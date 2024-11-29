import { Request, Response, NextFunction } from "express";
import { asyncHandler, AsyncMiddleware } from "../_utils/asyncHandler";
import { ForbiddenError, UnauthorizedError } from "../_utils/httpError";
import { getUserById } from "../models/users.model";
import logger from "../_utils/logger";
import { User } from "../_types/express";

const _fetchUserFromDb = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userUid = req.user?.uid;
    let user;

    if (!userUid) {
        throw new UnauthorizedError("No user session found.");
    }

    // Check if user data already exists in `req.user`, fetch only if missing
    if (!req.user?.userId || !req.user?.role) {
        user = await getUserById(userUid);

        if (!user) {
            logger.warn("User data not fetched.");
            return next();
        }

        const { userId, role, name, profilePhotoUrl, createdAt } = user;
        req.user = {
            ...(req.user as User),
            userId, // email is probably present in both
            role,
            name,
            profilePhotoUrl,
            createdAt
        };
    }

    next();
};

const _restrictToOwner: AsyncMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userUid = req.user?.uid;
    let { userId } = req.params;

    if (!userUid) {
        throw new UnauthorizedError("No user session found.");
    }

    if (!userId) {
        userId = req.user?.userId ?? "";
    }

    // if no userId we can't check for ownership
    if (!userId) {
        throw new ForbiddenError("User data missing.");
    }

    if (userUid !== userId) {
        throw new ForbiddenError(
            "User does not have the necessary permissions."
        );
    }

    next();
};

export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userUid = req.user?.uid;

        if (!userUid) {
            throw new UnauthorizedError("No user session found.");
        }

        if (req.user?.role !== role) {
            throw new ForbiddenError(
                `User role ${req.user?.role} is not permitted.`
            );
        }

        next();
    };
};

export const fetchUserFromDb = asyncHandler(_fetchUserFromDb);
export const restrictToOwner = asyncHandler(_restrictToOwner);
