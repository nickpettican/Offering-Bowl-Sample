import request from "supertest";
import app from "../../../src/app";
import auth from "../../../src/_config/firebase";
import {
    getItem,
    putItem,
    queryItems,
    deleteItem
} from "../../../src/_db/helpers";
import { User, Settings, Post } from "../../../src/_db/schemas";
import { UnauthorizedError } from "../../../src/_utils/httpError";

jest.mock("../../../src/_config/firebase");
jest.mock("../../../src/_db/helpers");

describe("User Middleware Integration Tests", () => {
    const mockVerifyIdToken = auth.verifyIdToken as jest.Mock;
    const mockGetItem = getItem as jest.Mock;
    const mockPutItem = putItem as jest.Mock;
    const mockQueryItems = queryItems as jest.Mock;
    const mockDeleteItem = deleteItem as jest.Mock;

    const validToken = "valid-token";

    const mockMonastic: User = {
        userId: "aang",
        role: "monastic",
        name: "Avatar Aang",
        email: "air@nomad.org",
        createdAt: new Date().toISOString()
    };

    const mockPatron: User = {
        userId: "zuko",
        role: "patron",
        name: "Prince Zuko",
        email: "fire@nation.com",
        createdAt: new Date().toISOString()
    };

    const mockSettings: Settings = {
        settingsId: "settings123",
        userId: mockMonastic.userId,
        country: "Air Temple",
        createdAt: new Date().toISOString()
    };

    const mockPost: Post = {
        postId: "post123",
        monasticId: mockMonastic.userId,
        content: "Test post",
        isPublic: false,
        createdAt: new Date().toISOString()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetItem.mockResolvedValue(mockMonastic);
        mockPutItem.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
        mockVerifyIdToken.mockResolvedValue({
            uid: mockMonastic.userId
        });
    });

    describe("fetchUserFromDb Middleware", () => {
        it("should fetch and attach user data to request", async () => {
            mockGetItem.mockResolvedValueOnce(mockMonastic);

            const response = await request(app)
                .post("/posts/post")
                .set("Authorization", `Bearer ${validToken}`)
                .send(mockPost);

            expect(mockGetItem).toHaveBeenCalledWith("Users", {
                userId: mockMonastic.userId
            });
            expect(response.status).not.toBe(401);
        });

        it("should return 401 when no user session exists", async () => {
            mockVerifyIdToken.mockRejectedValueOnce(
                new UnauthorizedError("Invalid token")
            );

            const response = await request(app)
                .post("/posts/post")
                .set("Authorization", `Bearer ${validToken}`)
                .send(mockPost);

            expect(response.status).toBe(401);
        });

        it("should pass through if user data already exists in request", async () => {
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: mockMonastic.userId,
                userId: mockMonastic.userId,
                role: mockMonastic.role
            });
            mockPutItem.mockResolvedValueOnce(undefined);

            const response = await request(app)
                .post("/posts/post")
                .set("Authorization", `Bearer ${validToken}`)
                .send(mockPost);

            expect(mockGetItem).not.toHaveBeenCalled();
            expect(response.status).not.toBe(401);
        });
    });

    describe("restrictToOwner Middleware", () => {
        describe("Users Routes", () => {
            it("should allow access to own user data", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockMonastic.userId
                });
                mockGetItem.mockResolvedValueOnce(mockMonastic);

                const response = await request(app)
                    .get(`/users/${mockMonastic.userId}`)
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(200);
                expect(response.body.user).toEqual(mockMonastic);
            });

            it("should deny access to other user's data", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockPatron.userId
                });

                const response = await request(app)
                    .get(`/users/${mockMonastic.userId}`)
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(403);
            });
        });

        describe("Settings Routes", () => {
            it("should allow access to own settings", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockMonastic.userId
                });
                mockQueryItems.mockResolvedValueOnce({
                    Items: [mockSettings]
                });

                const response = await request(app)
                    .get(`/settings/${mockMonastic.userId}`)
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(200);
                expect(response.body.settings).toEqual(mockSettings);
            });

            it("should deny access to other user's settings", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockPatron.userId
                });

                const response = await request(app)
                    .get(`/settings/${mockMonastic.userId}`)
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(403);
            });
        });
    });

    describe("requireRole Middleware", () => {
        describe("Posts Routes", () => {
            it("should allow monastic to create posts", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockMonastic.userId,
                    role: "monastic"
                });
                mockGetItem.mockResolvedValueOnce(mockMonastic);

                const response = await request(app)
                    .post("/posts/post")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(mockPost);

                expect(response.status).toBe(201);
            });

            it("should deny patron from creating posts", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockPatron.userId,
                    role: "patron"
                });
                mockGetItem.mockResolvedValueOnce(mockPatron);

                const response = await request(app)
                    .post("/posts/post")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(mockPost);

                expect(response.status).toBe(403);
            });

            it("should allow patron to access feed", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockPatron.userId,
                    role: "patron"
                });
                mockGetItem.mockResolvedValueOnce(mockPatron);
                mockQueryItems.mockResolvedValue({ Items: [] });

                const response = await request(app)
                    .get(`/posts/feed/${mockPatron.userId}`)
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(200);
            });

            it("should deny monastic from accessing patron feed", async () => {
                mockVerifyIdToken.mockResolvedValueOnce({
                    uid: mockMonastic.userId,
                    role: "monastic"
                });
                mockGetItem.mockResolvedValueOnce(mockMonastic);

                const response = await request(app)
                    .get(`/posts/feed/${mockPatron.userId}`)
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(403);
            });
        });
    });

    describe("Combined Middleware Tests", () => {
        it("should check both role and ownership for post deletion", async () => {
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: mockMonastic.userId,
                role: "monastic"
            });
            mockGetItem.mockResolvedValueOnce(mockMonastic);
            mockDeleteItem.mockResolvedValueOnce(undefined);

            const response = await request(app)
                .delete(`/posts/post/${mockPost.postId}`)
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(200);
        });

        it("should fail on role check before ownership check for post deletion", async () => {
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: mockPatron.userId,
                role: "patron"
            });
            mockGetItem.mockResolvedValueOnce(mockPatron);

            const response = await request(app)
                .delete(`/posts/post/${mockPost.postId}`)
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(403);
            expect(mockGetItem).not.toHaveBeenCalledWith("Posts", {
                postId: mockPost.postId
            });
        });
    });
});
