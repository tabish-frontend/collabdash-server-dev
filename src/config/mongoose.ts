import mongoose from "mongoose";
import { DB_Name } from "../utils";

// Define a TypeScript type for the function to explicitly state it returns a Promise<void>
export const db_connect = async (): Promise<void> => {
  // Check for the presence of necessary environment variables
  const dbConnectionUrl: string | undefined = process.env.DB_CONNECTION;
  const dbSecret: string | undefined = process.env.DB_SECRET;

  // Ensure both required environment variables are available
  if (!dbConnectionUrl || !dbSecret) {
    console.error(
      "Database connection or secret is not defined in environment variables."
    );
    process.exit(1); // Exit the process with an error code
  }

  // Replace the placeholder in the connection string with the actual secret
  const DB_URL: string = dbConnectionUrl.replace("<PASSWORD>", dbSecret);

  console.log("DB_URL", DB_URL);

  try {
    // Attempt to establish a connection to the MongoDB database
    await mongoose.connect(`${DB_URL}/${DB_Name}`);
    console.log("MongoDB Connected successfully.");
  } catch (error) {
    // Log and rethrow the error for further handling
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
