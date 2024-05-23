"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("./config/mongoose");
const index_1 = require("./index");
// Handle uncaught exceptions at the top level
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1); // Exit the process with failure code
});
// Configure dotenv to load environment variables
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
// Define the server's port. Default to 4000 if not specified in the environment variables.
const port = process.env.PORT || 4000;
// Start the server and listen on the specified port.
const server = index_1.app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
// Establish database connection
(0, mongoose_1.db_connect)();
// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    // Gracefully close the server before exiting the process
    server.close(() => {
        process.exit(1); // Exit the process with failure code
    });
});
//# sourceMappingURL=server.js.map