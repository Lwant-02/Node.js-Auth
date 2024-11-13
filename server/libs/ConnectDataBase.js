import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
export async function ConnectingDataBase() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connecting to database success.");
  } catch (error) {
    console.log("Error connecting database:", error.message);
  }
}
