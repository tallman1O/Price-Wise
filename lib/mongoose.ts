import mongoose from "mongoose";

//variable to track connection status.
let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URI) {
    throw new Error("MongoDB URI is missing");
  }

  if (isConnected) {
    return console.log("Using existing database connection");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
