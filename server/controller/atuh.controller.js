import UserModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateVerificationCode } from "../util/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../util/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendSuccessResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../sendMail/emails.js";
import dotenv from "dotenv";
dotenv.config();

const salt = 10;
export async function SignUp(req, res) {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      throw new Error("All input fileds are required!");
    }
    //Checking user is already exist or not
    const userExisting = await UserModel.findOne({ email });
    if (userExisting) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist!" });
    }
    //Hash password and save to database
    const hashPassword = await bcrypt.hash(password, salt);
    const verificationToken = generateVerificationCode();
    const newUser = await UserModel.create({
      name,
      email,
      password: hashPassword,
      verificationToken,
      verificationTokenExpiredAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    //jwt
    generateTokenAndSetCookie(res, newUser._id);

    //send mail
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User successfully created.",
      user: {
        ...newUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function VerifyEmail(req, res) {
  const { code } = req.body;
  try {
    const user = await UserModel.findOne({
      verificationToken: code,
      verificationTokenExpiredAt: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error("Invalid or expired verification token! ");
    }
    user.verificationToken = undefined;
    user.verificationTokenExpiredAt = undefined;
    user.isVerified = true;
    user.save();

    //Send welcome email
    await sendWelcomeEmail(user.email, user.name);
    res.status(200).json({
      success: true,
      message: "Email verification successfull.",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function SignIn(req, res) {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No user found with this email" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Password incorrect!" });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Successfully login.",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function ForgotPassword(req, res) {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    //Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiredAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiredAt = resetTokenExpiredAt;
    user.save();

    //Send reset email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(200).json({
      success: true,
      message: "Password reset link already sent to your email.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function ResetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await UserModel.findOne({
      resetPasswordExpiredAt: { $gt: Date.now() },
      resetPasswordToken: token,
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or token expired!" });
    }

    //hash password
    const hashPassword = await bcrypt.hash(password, salt);
    user.password = hashPassword;
    user.resetPasswordExpiredAt = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    //send success reset email
    await sendSuccessResetEmail(user.email);

    return res
      .status(200)
      .json({ success: true, message: "Password reset success." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function LogOut(req, res) {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Successfully logout." });
}

export async function ChechAuth(req, res) {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
