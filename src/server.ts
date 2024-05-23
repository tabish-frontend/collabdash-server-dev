import dotenv from "dotenv";
import { db_connect } from "./config/mongoose";
import { app } from "./index";
// Ensure AnyObjectType is defined in a way that it can capture at least `name` and `message` properties.
interface ErrorWithMessage {
  name: string;
  message: string;
}

// Handle uncaught exceptions at the top level
process.on("uncaughtException", (err: ErrorWithMessage) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1); // Exit the process with failure code
});

// Configure dotenv to load environment variables
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Define the server's port. Default to 4000 if not specified in the environment variables.
const port = process.env.PORT || 4000;
// Start the server and listen on the specified port.
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Establish database connection
db_connect();

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err: ErrorWithMessage) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  // Gracefully close the server before exiting the process
  server.close(() => {
    process.exit(1); // Exit the process with failure code
  });
});
