import dotenv from "dotenv";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "production") {
      await import("./config/env.js");
    }

    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log("Server Started");
      console.log(`Port: ${PORT}`);
      console.log(
        `Environment: ${process.env.NODE_ENV ?? "development"}`
      );
    });

    const shutdown = (signal: string): void => {
      console.log(`${signal} received, shutting down`);

      server.close(() => {
        process.exit(0);
      });

      setTimeout(() => {
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

void startServer();