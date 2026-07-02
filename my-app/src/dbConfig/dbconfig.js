import mongoose, { Schema } from "mongoose";

if (!global.mongoose) {
  global.mongoose = {
    conn: null,
  };
}

export const connectDB = async () => {
  if (global.mongoose.conn) {
    console.log("DB connected");
    return global.mongoose.conn;
  }
  try {
    global.mongoose.conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected");
    return global.mongoose.conn;
  } catch (error) {
    console.log("DB not connected");
    process.exit(1);
  }
};
