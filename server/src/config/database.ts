import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    mongoose.set("strictQuery", true);

    const connection = await mongoose.connect(MONGODB_URI, {
      dbName: "prepdost",
    });

    isConnected = true;

    console.log(`MongoDB Connected: ${connection.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });
  } catch (error) {
    console.error("Failed to connect MongoDB:", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    isConnected = false;
  } catch (error) {
    console.error("Error while closing MongoDB connection:", error);
  }
};

process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});