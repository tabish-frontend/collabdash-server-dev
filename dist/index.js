"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
// import { rateLimit } from 'express-rate-limit';
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const controllers_1 = require("./controllers");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const holidayRoutes_1 = __importDefault(require("./routes/holidayRoutes"));
const leaveRoutes_1 = __importDefault(require("./routes/leaveRoutes"));
const shiftRoutes_1 = __importDefault(require("./routes/shiftRoutes"));
const statisticsRoutes_1 = __importDefault(require("./routes/statisticsRoutes"));
const utils_1 = require("./utils");
// CORS configuration to allow requests from specified origins
const corsOptions = {
    origin: [process.env.ORIGIN_CLIENT_LOCAL, process.env.ORIGIN_CLIENT_LIVE],
};
const corsMiddleware = (0, cors_1.default)(corsOptions);
const app = (0, express_1.default)();
exports.app = app;
// Apply CORS middleware to enable cross-origin requests
app.use(corsMiddleware);
// Set various HTTP headers to secure the app
app.use((0, helmet_1.default)());
// Logging middleware for development environment
if (process.env.NODE_ENV === "dev") {
    app.use((0, morgan_1.default)("dev"));
}
// TEMPORARILY STOPPED - Middleware to limit repeated requests to public APIs within a time frame
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
// });
// app.use('/api', limiter);
// TEMPORARILY STOPPED - body size limit for incoming JSON payloads
// app.use(express.json({ limit: "10kb" }));
// Parses incoming requests with JSON payloads
app.use(express_1.default.json());
// Sanitize data to prevent NoSQL injection attacks
app.use((0, express_mongo_sanitize_1.default)());
// Sanitize user input coming from POST body, GET queries, and url params
app.use(utils_1.xssMiddleware);
// Protect against HTTP parameter pollution attacks
app.use((0, hpp_1.default)());
// Global error handling middleware
app.use(controllers_1.globalErrorHandler);
// Root route to confirm the server is running
app.get("/", (req, res) => {
    res.send("Express server is running! 🎉");
});
// Route handlers for different parts of the application
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/users", userRoutes_1.default);
app.use("/api/v1/attendance", attendanceRoutes_1.default);
app.use("/api/v1/employees", employeeRoutes_1.default);
app.use("/api/v1/holidays", holidayRoutes_1.default);
app.use("/api/v1/leaves", leaveRoutes_1.default);
app.use("/api/v1/shifts", shiftRoutes_1.default);
app.use("/api/v1/statistics", statisticsRoutes_1.default);
// Catch-all for unhandled routes
app.all("*", (req, res, next) => {
    next(new utils_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
//# sourceMappingURL=index.js.map