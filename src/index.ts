import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { createServer } from "http"; // Import the HTTP server
import { Server as SocketIOServer } from "socket.io"; // Import Socket.IO server

import { globalErrorHandler } from "./controllers";

import authRoutes from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import holidayRoutes from "./routes/holidayRoutes";
import leaveRoutes from "./routes/leaveRoutes";
import shiftRoutes from "./routes/shiftRoutes";
import statisticsRoutes from "./routes/statisticsRoutes";
import workSpaceRoutes from "./routes/kanban/workSpaceRoutes";
import boardRoutes from "./routes/kanban/boardRoutes";
import columnRoutes from "./routes/kanban/columnRoutes";
import taskRoutes from "./routes/kanban/taskRoutes";
import messageRoutes from "./routes/chat/messageRoutes";
import meetingRoutes from "./routes/meetingRoutes";
import notificationRoutes from "./routes/notification/notificationRoutes";
import subscriptionRoutes from "./routes/notification/subscriptionRoutes";
import { AppError, xssMiddleware } from "./utils";

// CORS configuration to allow requests from specified origins

const allowedOrigins = [
  process.env.ORIGIN_CLIENT_LOCAL,
  process.env.ORIGIN_CLIENT_LOCAL_IP,
  process.env.ORIGIN_CLIENT_LIVE,
];

// CORS configuration to allow requests from specified origins
const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin like mobile apps or curl requests
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

const app: Express = express();

// Apply CORS middleware to enable cross-origin requests
app.use(cors(corsOptions));

// Set various HTTP headers to secure the app
app.use(helmet());

// Logging middleware for development environment
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
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
app.use(express.json());

// Sanitize data to prevent NoSQL injection attacks
app.use(mongoSanitize());

// Sanitize user input coming from POST body, GET queries, and url params
app.use(xssMiddleware);

// Protect against HTTP parameter pollution attacks
app.use(hpp());

// Global error handling middleware
app.use(globalErrorHandler);

// Root route to confirm the server is running
app.get("/", (req: Request, res: Response) => {
  res.send("Express server is running! 🎉");
});

// Route handlers for different parts of the application
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/holidays", holidayRoutes);
app.use("/api/v1/leaves", leaveRoutes);
app.use("/api/v1/shifts", shiftRoutes);
app.use("/api/v1/statistics", statisticsRoutes);
app.use("/api/v1/workspace", workSpaceRoutes);
app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1/column", columnRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/meetings", meetingRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

// Catch-all for unhandled routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Create an HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
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

// Export the HTTP server instead of the app
export { httpServer as app };
