import express from "express";
import { ConnectingDataBase } from "./libs/ConnectDataBase.js";
import authRouter from "./routes/auth-route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();
const app = express();
const port = process.env.PORT;
const __dirname = path.resolve();

app.use(cors({ origin: "http://localhost:4000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
  });
}

app.listen(port, () => {
  ConnectingDataBase();
  console.log(`Listening on port ${port}`);
});
