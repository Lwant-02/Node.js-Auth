import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { mailTrapClient, sender } from "./sendMail.js";

export async function sendVerificationEmail(email, verificationToken) {
  const recipient = [{ email }];
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email!",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email verification",
    });
  } catch (error) {
    throw new Error(`Error sending email ${error.message}`);
  }
}

export async function sendWelcomeEmail(email, name) {
  const recipient = [{ email }];
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "c260a2f2-e2d0-419b-9e06-82c80306b4f3",
      template_variables: { name: name },
    });
  } catch (error) {
    throw new Error(`Error sending email :${error.message}`);
  }
}

export async function sendPasswordResetEmail(email, resetUrl) {
  const recipient = [{ email }];
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Password reset",
    });
  } catch (error) {
    throw new Error(`Error reseting password :${error.message}`);
  }
}

export async function sendSuccessResetEmail(email) {
  const recipient = [{ email }];
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password reset success",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password reset",
    });
  } catch (error) {
    throw new Error(`Error sending password reset success: ${error.message}`);
  }
}
