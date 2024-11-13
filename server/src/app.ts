import express from "express";
// import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";

import morganMiddleware from "./middleware/morgan.middleware";
import logger from "./utils/logger";

import indexRouter from "./routes/index";

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

// Serve static files
// const staticPath = process.env.STATIC_PATH || path.join(__dirname, "public");
// app.use(express.static(staticPath));

// Routes
app.use("/", indexRouter);

// Centralized error handling
interface Error {
    stack: string;
    status: number;
    message: string;
}

app.use((err: Error, req: express.Request, res: express.Response) => {
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
