import request from "supertest";
import app from "../../src/app";
import auth from "../../src/_config/firebase";
import { UnauthorizedError } from "../../src/_utils/httpError";

jest.mock("../../src/_config/firebase", () => ({
    verifyIdToken: jest.fn()
}));

describe("Authentication Integration Tests", () => {
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
        expect(response.body).toEqual({ error: errorMessage });

        // /settings route
        response = await request(app).get("/settings");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: errorMessage });

        // /posts route
        response = await request(app).get("/posts");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: errorMessage });
    });

    it("should return 401 for invalid tokens", async () => {
        const errorMessage = "Invalid token";
        (auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(
            new UnauthorizedError(errorMessage)
        );

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: errorMessage });
        expect(auth.verifyIdToken).toHaveBeenCalledWith(invalidToken);
    });

    it("should allow requests with valid tokens", async () => {
        (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUser);

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

        // /posts route
        response = await request(app)
            .get("/posts")
            .set("Authorization", `Bearer ${validToken}`);
        expect(response.status).not.toBe(401);
        expect(auth.verifyIdToken).toHaveBeenCalledWith(validToken);
    });
});
