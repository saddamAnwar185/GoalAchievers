import mongoose from "mongoose";
import dotenv from 'dotenv'

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Database Connected");
    })
    .catch((error) => {
      console.log(error)
    });
};