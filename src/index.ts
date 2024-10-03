import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
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
import contactRoutes from "./routes/contactsRoutes";
import todosRoutes from "./routes/todos/todosRoutes";

import { AppError, xssMiddleware } from "./utils";
import { createServer } from "http"; // Import the HTTP server
import { Server as SocketIOServer } from "socket.io"; // Import Socket.IO server

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

const app: Express = express();

// Express middleware setup
app.use(cors(corsOptions));

app.use(helmet());

if (process.env.NODE_ENV === "dev") app.use(morgan("dev"));

app.use(express.json());

app.use(mongoSanitize());

app.use(xssMiddleware);

app.use(hpp());

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
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/todos", todosRoutes);

// Catch-all for unhandled routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Create the HTTP server and initialize Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Create a map to store user socket IDs
const userSocketMap: { [userId: string]: string } = {};

export const getReceiverSocketId = (receiverId: string | number) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // Extract userId from the query
  const userId = socket.handshake.query.userId as string;

  if (!userId) {
    console.log("Missing userId in socket connection query");
    return socket.disconnect();
  }

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export the server for use in `server.ts`
export { httpServer as app, io };
