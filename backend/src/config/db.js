import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    console.log("========== MONGO DEBUG ==========");

    const mongoUri = process.env.MONGO_URI;

    console.log("MONGO_URI exists:", !!mongoUri);
    console.log("NODE_ENV:", process.env.NODE_ENV);

    // Production MUST use MongoDB Atlas
    if (!mongoUri || mongoUri.trim() === "") {
      if (process.env.NODE_ENV === "production") {
        throw new Error("MONGO_URI is missing in production");
      }

      console.log(
        "No external MONGO_URI specified. Starting in-memory MongoDB..."
      );

      mongoMemoryServer = await MongoMemoryServer.create();

      const memoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memoryUri, {
        autoIndex: true,
        maxPoolSize: 10,
      });

      console.log("✅ In-memory MongoDB connected");
      console.log("Database:", conn.connection.name);
      console.log("Host:", conn.connection.host);
      console.log("=================================");

      return conn;
    }

    console.log("Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: process.env.NODE_ENV !== "production",
      autoCreate: process.env.NODE_ENV !== "production",
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 50,
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MONGODB CONNECTED");
    console.log("Database:", conn.connection.name);
    console.log("Host:", conn.connection.host);
    console.log("ReadyState:", mongoose.connection.readyState);
    console.log("=================================");

    return conn;
  } catch (error) {
    console.error("❌ MONGODB CONNECTION FAILED");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Code:", error.code);
    console.error("=================================");

    // Development-only fallback
    if (
      process.env.NODE_ENV !== "production" &&
      !mongoMemoryServer
    ) {
      try {
        console.log("Trying development in-memory MongoDB...");

        mongoMemoryServer = await MongoMemoryServer.create();

        const fallbackUri = mongoMemoryServer.getUri();

        const conn = await mongoose.connect(fallbackUri);

        console.log("✅ Fallback in-memory MongoDB connected");
        console.log("Database:", conn.connection.name);

        return conn;
      } catch (fallbackError) {
        console.error(
          "❌ In-memory MongoDB also failed:",
          fallbackError.message
        );

        throw fallbackError;
      }
    }

    // Never use process.exit() in Vercel/serverless
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();

    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnect error:", error.message);
  }
};