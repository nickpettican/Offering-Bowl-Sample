import request from "supertest";
import app from "../../../src/app";
import auth from "../../../src/_config/firebase";
import { UnauthorizedError } from "../../../src/_utils/httpError";

jest.mock("../../../src/_config/firebase");

describe("Authentication Integration Tests", () => {
    const mockVerifyIdToken = auth.verifyIdToken as jest.Mock;
    const validToken = "validMockToken";
    const invalidToken = "invalidMockToken";

    const mockUser = {
        uid: "toph",
        email: "toph@beifong.com"
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 401 for unauthenticated requests", async () => {
        const errorMessage = "Authorization token missing.";
        // /users route
        let response = await request(app).get("/users");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, error: errorMessage });

        // /settings route
        response = await request(app).get("/settings");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, error: errorMessage });

        // /posts route
        response = await request(app).post("/posts/post");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, error: errorMessage });
    });

    it("should return 401 for invalid tokens", async () => {
        const errorMessage = "Invalid token";
        mockVerifyIdToken.mockRejectedValueOnce(
            new UnauthorizedError(errorMessage)
        );

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, error: errorMessage });
        expect(auth.verifyIdToken).toHaveBeenCalledWith(invalidToken);
    });

    it("should allow requests with valid tokens", async () => {
        mockVerifyIdToken.mockResolvedValueOnce(mockUser);

        // /users route
        let response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${validToken}`);
        expect(response.status).not.toBe(401);
        expect(auth.verifyIdToken).toHaveBeenCalledWith(validToken);

        // /settings route
        response = await request(app)
            .get("/settings")
            .set("Authorization", `Bearer ${validToken}`);
        expect(response.status).not.toBe(401);
        expect(auth.verifyIdToken).toHaveBeenCalledWith(validToken);
    });
});
