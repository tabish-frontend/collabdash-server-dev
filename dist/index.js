"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http"); // Import the HTTP server
const socket_io_1 = require("socket.io"); // Import Socket.IO server
const controllers_1 = require("./controllers");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const holidayRoutes_1 = __importDefault(require("./routes/holidayRoutes"));
const leaveRoutes_1 = __importDefault(require("./routes/leaveRoutes"));
const shiftRoutes_1 = __importDefault(require("./routes/shiftRoutes"));
const statisticsRoutes_1 = __importDefault(require("./routes/statisticsRoutes"));
const workSpaceRoutes_1 = __importDefault(require("./routes/kanban/workSpaceRoutes"));
const boardRoutes_1 = __importDefault(require("./routes/kanban/boardRoutes"));
const columnRoutes_1 = __importDefault(require("./routes/kanban/columnRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/kanban/taskRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/chat/messageRoutes"));
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notification/notificationRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/notification/subscriptionRoutes"));
const utils_1 = require("./utils");
// CORS configuration to allow requests from specified origins
const allowedOrigins = [
    process.env.ORIGIN_CLIENT_LOCAL,
    process.env.ORIGIN_CLIENT_LOCAL_IP,
    process.env.ORIGIN_CLIENT_LIVE,
];
// CORS configuration to allow requests from specified origins
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin like mobile apps or curl requests
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
};
const app = (0, express_1.default)();
// Apply CORS middleware to enable cross-origin requests
app.use((0, cors_1.default)(corsOptions));
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
app.use("/api/v1/workspace", workSpaceRoutes_1.default);
app.use("/api/v1/boards", boardRoutes_1.default);
app.use("/api/v1/column", columnRoutes_1.default);
app.use("/api/v1/task", taskRoutes_1.default);
app.use("/api/v1/messages", messageRoutes_1.default);
app.use("/api/v1/meetings", meetingRoutes_1.default);
app.use("/api/v1/notifications", notificationRoutes_1.default);
app.use("/api/v1/subscriptions", subscriptionRoutes_1.default);
// Catch-all for unhandled routes
app.all("*", (req, res, next) => {
    next(new utils_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Create an HTTP server
const httpServer = (0, http_1.createServer)(app);
exports.app = httpServer;
// Initialize Socket.IO
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Socket.IO connection handler
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Handle custom events from clients
    socket.on("someEvent", (data) => {
        console.log("Received someEvent with data:", data);
        // Emit events to other connected clients
        socket.broadcast.emit("someEventResponse", {
            message: "This is a response to someEvent",
            data: data,
        });
    });
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
//# sourceMappingURL=index.js.map