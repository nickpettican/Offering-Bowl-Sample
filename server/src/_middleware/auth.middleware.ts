/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { Request, Response, NextFunction } from "express";
import auth from "../_config/firebase";
import { asyncHandler, AsyncMiddleware } from "../_utils/asyncHandler";
import { UnauthorizedError } from "../_utils/httpError";

const authenticate: AsyncMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1]; // extract the token

        if (!token) {
            throw new UnauthorizedError("Authorization token missing.");
        }

        const decodedToken = await auth.verifyIdToken(token); // see DecodedIdToken
        req.user = decodedToken; // Attach user info to the request object

        next();
    } catch (error: any) {
        if (/firebase/gi.test(error.message ?? error)) {
            throw new UnauthorizedError(error.message ?? error);
        }

        throw error;
    }
};

export default asyncHandler(authenticate);
