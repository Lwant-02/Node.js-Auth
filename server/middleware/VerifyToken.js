import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function VerifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized! No token is provided!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized -invalid token!" });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
