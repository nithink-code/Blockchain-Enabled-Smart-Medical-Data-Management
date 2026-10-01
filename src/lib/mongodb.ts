import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder('ipv4first')

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}


let cached = (global as any).__mongoose_cache;

if (!cached) {
  cached = (global as any).__mongoose_cache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, 
    };

    console.log("Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully to:", mongoose.connection.name);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const message = e instanceof Error ? e.message : String(e);
    console.error(
      "MongoDB connection error. Check Atlas network access, the connection string, and local DNS:",
      message
    );
    throw e;
  }

  return cached.conn;
}
