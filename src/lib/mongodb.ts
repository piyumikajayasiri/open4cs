import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gemstone_evaluation";

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(MONGODB_URI);

  return mongoose.connection;
}

export async function connectDB() {
  await connectToDatabase();

  return mongoose;
}
