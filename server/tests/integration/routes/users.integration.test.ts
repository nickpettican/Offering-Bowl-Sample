import request from "supertest";
import app from "../../../src/app";
import auth from "../../../src/_config/firebase";
import { putItem, getItem } from "../../../src/_db/helpers";
import { User } from "../../../src/_db/schemas";

jest.mock("../../../src/_config/firebase");
jest.mock("../../../src/_db/helpers");

describe("Users Routes", () => {
    const mockVerifyIdToken = auth.verifyIdToken as jest.Mock;
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;

    const mockPutCommandOutput = {
        $metadata: { httpStatusCode: 200 }
    };

    const mockUser: User = {
        userId: "aang",
        role: "monastic",
        name: "Avatar Aang",
        email: "air@nomad.org",
        createdAt: new Date().toISOString()
    };

    const validToken = "validToken";

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock successful database operations by default
        mockGetItem.mockResolvedValue(mockUser);
        mockPutItem.mockResolvedValue(mockPutCommandOutput);
    });

    describe("POST /users", () => {
        it("should create a user and return 201", async () => {
            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });

            const response = await request(app)
                .post("/users")
                .send(mockUser)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: "User created successfully.",
                user: mockUser
            });
            expect(mockPutItem).toHaveBeenCalledWith("Users", mockUser);
        });

        it("should return 500 if creation fails", async () => {
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });
            mockPutItem.mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app)
                .post("/users")
                .send(mockUser)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                error: "Database error"
            });
            expect(mockPutItem).toHaveBeenCalledWith("Users", mockUser);
        });

        it("should return 422 if user data is invalid", async () => {
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });

            const invalidUser = {
                userId: "aang"
                // missing required fields
            };

            const response = await request(app)
                .post("/users")
                .send(invalidUser)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(422);
            expect(response.body.success).toBe(false);
            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });

    describe("GET /users/:userId", () => {
        it("should retrieve a user by ID", async () => {
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });
            mockGetItem.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .get(`/users/${mockUser.userId}`)
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                user: mockUser
            });
            expect(mockGetItem).toHaveBeenCalledWith("Users", {
                userId: mockUser.userId
            });
        });

        it("should return 404 if user is not found", async () => {
            mockGetItem.mockResolvedValueOnce(undefined);
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: "zuko"
            });

            const response = await request(app)
                .get(`/users/zuko`)
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "User not found."
            });
            expect(mockGetItem).toHaveBeenCalledWith("Users", {
                userId: "zuko"
            });
        });

        it("should return 500 if retrieval fails", async () => {
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });
            mockGetItem.mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app)
                .get(`/users/${mockUser.userId}`)
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                error: "Database error"
            });
            expect(mockGetItem).toHaveBeenCalledWith("Users", {
                userId: mockUser.userId
            });
        });

        it("should return 403 when accessing other user's data", async () => {
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: "zuko",
                role: "patron"
            });

            const response = await request(app)
                .get(`/users/${mockUser.userId}`)
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                success: false,
                error: "User does not have the necessary permissions."
            });
        });
    });

    describe("PUT /users/:userId", () => {
        const updatedData = {
            name: "Aang",
            email: "republic@city.com"
        };

        it("should update a user successfully", async () => {
            const updatedUser = {
                ...mockUser,
                ...updatedData
            };
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });
            mockGetItem.mockResolvedValueOnce(mockUser);
            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            const response = await request(app)
                .put(`/users/${mockUser.userId}`)
                .send(updatedUser)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "User updated successfully.",
                user: updatedUser
            });
            expect(mockPutItem).toHaveBeenCalledWith("Users", updatedUser);
        });

        it("should return 404 if user to update is not found", async () => {
            const updatedUser = {
                ...mockUser,
                ...updatedData,
                userId: "zuko"
            };
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });
            mockGetItem.mockResolvedValueOnce(undefined);

            const response = await request(app)
                .put(`/users/${mockUser.userId}`)
                .send(updatedUser)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                error: "User not found."
            });
        });

        it("should return 500 if update fails", async () => {
            const updatedUser = {
                ...mockUser,
                ...updatedData
            };
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });
            mockGetItem.mockResolvedValueOnce(mockUser);
            mockPutItem.mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app)
                .put(`/users/${mockUser.userId}`)
                .send(updatedUser)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                error: "Database error"
            });
        });

        it("should return 403 when trying to update other user's data", async () => {
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: "zuko",
                role: "patron"
            });

            const response = await request(app)
                .put(`/users/${mockUser.userId}`)
                .send(updatedData)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                success: false,
                error: "User does not have the necessary permissions."
            });
        });

        it("should return 422 if update data is invalid", async () => {
            mockVerifyIdToken.mockResolvedValue({
                uid: mockUser.userId,
                role: mockUser.role
            });

            const invalidData = {
                email: "not-an-email" // invalid email format
            };

            const response = await request(app)
                .put(`/users/${mockUser.userId}`)
                .send(invalidData)
                .set("Authorization", `Bearer ${validToken}`)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(422);
            expect(response.body.success).toBe(false);
        });
    });
});
