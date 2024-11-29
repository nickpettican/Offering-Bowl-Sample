import { Request, Response, NextFunction } from "express";

export type AsyncMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

export const asyncHandler = (middleware: AsyncMiddleware) => {
    return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, next).catch(next); // Catch and pass errors to Express
    };
};
