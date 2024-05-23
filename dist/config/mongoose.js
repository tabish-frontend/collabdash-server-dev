"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db_connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../utils");
// Define a TypeScript type for the function to explicitly state it returns a Promise<void>
const db_connect = () => __awaiter(void 0, void 0, void 0, function* () {
    // Check for the presence of necessary environment variables
    const dbConnectionUrl = process.env.DB_CONNECTION;
    const dbSecret = process.env.DB_SECRET;
    // Ensure both required environment variables are available
    if (!dbConnectionUrl || !dbSecret) {
        console.error("Database connection or secret is not defined in environment variables.");
        process.exit(1); // Exit the process with an error code
    }
    // Replace the placeholder in the connection string with the actual secret
    const DB_URL = dbConnectionUrl.replace("<PASSWORD>", dbSecret);
    console.log("DB_URL", DB_URL);
    try {
        // Attempt to establish a connection to the MongoDB database
        yield mongoose_1.default.connect(`${DB_URL}/${utils_1.DB_Name}`);
        console.log("MongoDB Connected successfully.");
    }
    catch (error) {
        // Log and rethrow the error for further handling
        console.error("MongoDB connection failed:", error);
        throw error;
    }
});
exports.db_connect = db_connect;
//# sourceMappingURL=mongoose.js.map