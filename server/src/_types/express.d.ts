import "express-serve-static-core";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

declare module "express-serve-static-core" {
    interface Request {
        user?: DecodedIdToken;
    }
}
