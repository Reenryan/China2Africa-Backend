import "dotenv/config";

import app from "./app.js";
import prisma from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Test Database Connection
    |--------------------------------------------------------------------------
    */

    await prisma.$connect();

    console.log("Database connected successfully");

    /*
    |--------------------------------------------------------------------------
    | Start HTTP Server
    |--------------------------------------------------------------------------
    */

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    /*
    |--------------------------------------------------------------------------
    | Graceful Shutdown
    |--------------------------------------------------------------------------
    */

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await prisma.$disconnect();

        console.log("Server and database connections closed");

        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

startServer();
