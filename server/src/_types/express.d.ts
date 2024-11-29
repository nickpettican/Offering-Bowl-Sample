import "express-serve-static-core";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

interface User extends DecodedIdToken {
    userId?: string;
    role?: string;
    name?: string;
    profilePhotoUrl?: string;
    createdAt?: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: User;
    }
}
