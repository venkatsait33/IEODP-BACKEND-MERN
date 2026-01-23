import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing");
    }

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false, // 🔥 VERY IMPORTANT
        serverSelectionTimeoutMS: 30000,
      })
      .then((mongoose) => mongoose);
    console.log("✅ MongoDB connected");
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
