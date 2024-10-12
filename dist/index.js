"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = exports.getReceiverSocketId = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
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
const workSpaceRoutes_1 = __importDefault(require("./routes/kanban/workSpaceRoutes"));
const boardRoutes_1 = __importDefault(require("./routes/kanban/boardRoutes"));
const columnRoutes_1 = __importDefault(require("./routes/kanban/columnRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/kanban/taskRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/chat/messageRoutes"));
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notification/notificationRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/notification/subscriptionRoutes"));
const contactsRoutes_1 = __importDefault(require("./routes/contactsRoutes"));
const todosRoutes_1 = __importDefault(require("./routes/todos/todosRoutes"));
const otherRoutes_1 = __importDefault(require("./routes/otherRoutes"));
const utils_1 = require("./utils");
const http_1 = require("http"); // Import the HTTP server
const socket_io_1 = require("socket.io"); // Import Socket.IO server
// Allowed origins for CORS
const allowedOrigins = [
    process.env.ORIGIN_CLIENT_LOCAL,
    process.env.ORIGIN_CLIENT_LOCAL_IP,
    process.env.ORIGIN_CLIENT_LIVE,
];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
};
const app = (0, express_1.default)();
// Express middleware setup
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
if (process.env.NODE_ENV === "dev")
    app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, express_mongo_sanitize_1.default)());
app.use(utils_1.xssMiddleware);
app.use((0, hpp_1.default)());
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
app.use("/api/v1/contacts", contactsRoutes_1.default);
app.use("/api/v1/todos", todosRoutes_1.default);
app.use("/api/v1/others", otherRoutes_1.default);
// Catch-all for unhandled routes
app.all("*", (req, res, next) => {
    next(new utils_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Create the HTTP server and initialize Socket.IO
const httpServer = (0, http_1.createServer)(app);
exports.app = httpServer;
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io = io;
// Create a map to store user socket IDs
const userSocketMap = {};
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};
exports.getReceiverSocketId = getReceiverSocketId;
io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    // Extract userId from the query
    const userId = socket.handshake.query.userId;
    if (!userId) {
        console.log("Missing userId in socket connection query");
        return socket.disconnect();
    }
    if (userId)
        userSocketMap[userId] = socket.id;
    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // socket.on() is used to listen to the events. can be used both on client and server side
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
//# sourceMappingURL=index.js.map