import request from "supertest";
import { PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import app from "../../src/app";
import * as UserModel from "../../src/models/users.model"; // mock this
import { User } from "../../src/_db/schemas";

jest.mock("../../src/models/users.model");

describe("Users Routes", () => {
    const mockUser: User = {
        userId: "aang",
        role: "monastic",
        name: "Avatar Aang",
        email: "air@nomad.org",
        createdAt: new Date().toISOString()
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /users", () => {
        it("should create a user and return 201", async () => {
            jest.spyOn(UserModel, "createUser").mockResolvedValueOnce({
                $metadata: {
                    httpStatusCode: 200,
                    requestId: "mockRequestId",
                    attempts: 1,
                    totalRetryDelay: 0
                }
            } as PutCommandOutput);

            const response = await request(app)
                .post("/users")
                .send(mockUser)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: "User created successfully.",
                user: mockUser
            });
            expect(UserModel.createUser).toHaveBeenCalledWith(mockUser);
        });

        it("should return 500 if creation fails", async () => {
            jest.spyOn(UserModel, "createUser").mockRejectedValueOnce(
                new Error("Database error")
            );

            const response = await request(app)
                .post("/users")
                .send(mockUser)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                error: "Database error"
            });
            expect(UserModel.createUser).toHaveBeenCalledWith(mockUser);
        });
    });

    describe("GET /users/:userId", () => {
        it("should retrieve a user by ID", async () => {
            jest.spyOn(UserModel, "getUserById").mockResolvedValueOnce(
                mockUser
            );

            const response = await request(app).get(
                `/users/${mockUser.userId}`
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                user: mockUser
            });
            expect(UserModel.getUserById).toHaveBeenCalledWith(mockUser.userId);
        });

        it("should return 404 if user is not found", async () => {
            jest.spyOn(UserModel, "getUserById").mockImplementation(() =>
                Promise.resolve(undefined)
            );

            const response = await request(app).get(`/users/zuko`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "User not found."
            });
            expect(UserModel.getUserById).toHaveBeenCalledWith("zuko");
        });

        it("should return 500 if retrieval fails", async () => {
            jest.spyOn(UserModel, "getUserById").mockRejectedValueOnce(
                new Error("Database error")
            );

            const response = await request(app).get(
                `/users/${mockUser.userId}`
            );

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                error: "Database error"
            });
            expect(UserModel.getUserById).toHaveBeenCalledWith(mockUser.userId);
        });
    });

    describe("PUT /users/:userId", () => {
        const updatedData = {
            name: "Aang",
            email: "republic@city.com"
        };

        it("should update a user successfully", async () => {
            const updatedUser: User = {
                ...mockUser,
                ...updatedData
            };
            jest.spyOn(UserModel, "updateUser").mockResolvedValueOnce(
                updatedUser
            );

            const response = await request(app)
                .put(`/users/${mockUser.userId}`)
                .send(updatedData)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "User updated successfully.",
                user: {
                    ...mockUser,
                    ...updatedData
                }
            });
            expect(UserModel.updateUser).toHaveBeenCalledWith(
                mockUser.userId,
                updatedData
            );
        });

        it("should return 500 if update fails", async () => {
            jest.spyOn(UserModel, "updateUser").mockRejectedValueOnce(
                new Error("Database error")
            );

            const response = await request(app)
                .put(`/users/${mockUser.userId}`)
                .send(updatedData)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                error: "Database error"
            });
            expect(UserModel.updateUser).toHaveBeenCalledWith(
                mockUser.userId,
                updatedData
            );
        });
    });
});
