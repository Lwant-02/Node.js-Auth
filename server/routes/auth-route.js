import express from "express";
import { LogOut, SignIn, SignUp } from "../controller/atuh.controller.js ";
import {
  ChechAuth,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
} from "../controller/atuh.controller.js";
import { VerifyToken } from "../middleware/VerifyToken.js";

const authRouter = express.Router();

authRouter.get("/check-auth", VerifyToken, ChechAuth);

authRouter.post("/signup", SignUp);

authRouter.post("/login", SignIn);

authRouter.post("/logout", LogOut);

authRouter.post("/verify-email", VerifyEmail);

authRouter.post("/forgot-password", ForgotPassword);

authRouter.post("/reset-password/:token", ResetPassword);

export default authRouter;
