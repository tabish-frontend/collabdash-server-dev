import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
// import { rateLimit } from 'express-rate-limit';
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

import { AppError, xssMiddleware } from "./utils";

// CORS configuration to allow requests from specified origins
const corsOptions = {
  origin: [process.env.ORIGIN_CLIENT_LOCAL, process.env.ORIGIN_CLIENT_LIVE],
  credentials: true,
};
const corsMiddleware = cors(corsOptions);

const app: Express = express();

// Apply CORS middleware to enable cross-origin requests
app.use(corsMiddleware);

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

// Catch-all for unhandled routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export { app };
