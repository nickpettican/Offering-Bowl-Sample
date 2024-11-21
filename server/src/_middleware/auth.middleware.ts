import { Request, Response, NextFunction } from "express";
import auth from "../_config/firebase";
import { asyncHandler, AsyncMiddleware } from "../_utils/asyncHandler";
import { UnauthorizedError } from "../_utils/httpError";

const authenticate: AsyncMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split("Bearer ")[1]; // extract the token

    if (!token) {
        throw new UnauthorizedError("Authorization token missing.");
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken; // Attach user info to the request object
    next();
};

export default asyncHandler(authenticate);
