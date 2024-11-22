import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";

import morganMiddleware from "./_middleware/morgan.middleware";
import authenticate from "./_middleware/auth.middleware";
import logger from "./_utils/logger";
import HttpError from "./_utils/httpError";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import settingsRouter from "./routes/settings";
import postsRouter from "./routes/posts";
import demoRouter from "./routes/demo";
import notFoundHandler from "./controllers/404.controller";

// Initialize environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: ["*"], // TODO: Update with front-end domain
        methods: ["GET", "POST", "PUT", "DELETE"]
    })
);

// Rate limiting
// Default status code is 429
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later."
});

app.use(limiter);

// Logging
app.use(morganMiddleware);

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/", indexRouter);
app.use("/users", authenticate, usersRouter);
app.use("/settings", authenticate, settingsRouter);
app.use("/posts", authenticate, postsRouter);
app.use("/demo", demoRouter);
app.use(notFoundHandler);

// Centralized error handling
// For some reason without "next" not all errors are caught
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    const errorMessage =
        statusCode === 500 ? "Internal Server Error" : err.message;

    // Log errors
    if (statusCode === 500) {
        logger.error(err.stack || err.message);
    } else {
        logger.warn(err.message);
    }

    res.status(statusCode).json({ error: errorMessage });
});

export default app;
