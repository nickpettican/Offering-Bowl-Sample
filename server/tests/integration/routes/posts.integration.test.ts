import request from "supertest";
import app from "../../../src/app";
import auth from "../../../src/_config/firebase";
import {
    putItem,
    getItem,
    queryItems,
    deleteItem
} from "../../../src/_db/helpers";

jest.mock("../../../src/_config/firebase");
jest.mock("../../../src/_db/helpers");

describe("Posts Integration Tests", () => {
    const mockVerifyIdToken = auth.verifyIdToken as jest.Mock;
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;
    const mockQueryItems = queryItems as jest.Mock;
    const mockDeleteItem = deleteItem as jest.Mock;

    const mockPutCommandOutput = {
        $metadata: { httpStatusCode: 200 }
    };

    const mockMonastic = {
        uid: "aang",
        userId: "aang",
        role: "monastic",
        name: "Test Monastic",
        email: "monastic@test.com",
        createdAt: new Date().toISOString()
    };

    const mockPatron = {
        uid: "zuko",
        userId: "zuko",
        role: "patron",
        name: "Test Patron",
        email: "patron@test.com",
        createdAt: new Date().toISOString()
    };

    const mockPost = {
        postId: "post123",
        monasticId: "aang",
        mediaId: "media123",
        content: "Test post",
        isPublic: true,
        createdAt: new Date().toISOString()
    };

    const mockContract = {
        monasticId: "aang",
        patronId: "zuko",
        status: "active"
    };

    const validToken = "validToken";

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock successful database operations by default
        mockQueryItems.mockResolvedValue({
            Items: [mockPost]
        });
        mockGetItem.mockResolvedValue(mockPost);
        mockPutItem.mockResolvedValue(mockPutCommandOutput);
    });

    describe("Public Routes", () => {
        it("should get public posts for a monastic", async () => {
            const response = await request(app)
                .get("/posts/public/monastic/aang")
                .query({ limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.posts.posts)).toBe(true);
        });

        it("should get a specific public post", async () => {
            mockQueryItems.mockResolvedValue({
                Items: [mockPost]
            });

            const response = await request(app).get(
                "/posts/public/post/post123"
            );

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe("Protected Routes", () => {
        it("should create post when authenticated as monastic", async () => {
            mockVerifyIdToken.mockResolvedValue(mockMonastic);
            mockGetItem.mockResolvedValueOnce(mockMonastic);
            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            // Mock user middleware
            jest.mock("../../../src/_middleware/user.middleware", () => ({
                fetchUserFromDb: (req: any, _res: any, next: any) => {
                    req.user = mockMonastic;
                    next();
                },
                requireRole: () => (_req: any, _res: any, next: any) => next(),
                restrictToOwner: (_req: any, _res: any, next: any) => next()
            }));

            const response = await request(app)
                .post("/posts/post")
                .set("Authorization", `Bearer ${validToken}`)
                .send(mockPost);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        it("should get patron feed when authenticated as patron", async () => {
            mockVerifyIdToken.mockResolvedValue(mockPatron);
            mockQueryItems
                .mockResolvedValueOnce({ Items: [mockContract] }) // Active monastics
                .mockResolvedValueOnce({ Items: [mockPost] }); // Posts

            const response = await request(app)
                .get("/posts/feed/zuko")
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it("should delete post when authenticated as owner", async () => {
            mockVerifyIdToken.mockResolvedValue(mockMonastic);

            const response = await request(app)
                .delete("/posts/post/post123")
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it("should return 403 when patron tries to create post", async () => {
            mockVerifyIdToken.mockResolvedValue(mockPatron);

            const response = await request(app)
                .post("/posts/post")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    postId: "newpost123",
                    content: "New post"
                });

            expect(response.status).toBe(403);
        });
    });

    describe("Negative Cases", () => {
        it("should return 404 for non-existent public post", async () => {
            mockQueryItems.mockResolvedValue({
                Items: []
            });

            const response = await request(app).get(
                "/posts/public/post/nonexistent"
            );

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 401 for protected routes without token", async () => {
            interface TestEndpoint {
                method: "get" | "post" | "put" | "delete" | "patch";
                path: string;
            }

            const endpoints: TestEndpoint[] = [
                { method: "get", path: "/posts/post/123" },
                { method: "post", path: "/posts/post" },
                { method: "delete", path: "/posts/post/123" },
                { method: "get", path: "/posts/feed/zuko" }
            ];

            for (const endpoint of endpoints) {
                const response = await request(app)[endpoint.method](
                    endpoint.path
                );
                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
            }
        });

        it("should return 403 when non-owner tries to delete post", async () => {
            mockVerifyIdToken.mockResolvedValue({
                uid: "differentMonastic",
                role: "monastic"
            });

            const response = await request(app)
                .delete("/posts/post/post123")
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it("should return 403 when patron tries to access private post without contract", async () => {
            mockVerifyIdToken.mockResolvedValue(mockPatron);
            mockGetItem.mockResolvedValue({
                ...mockPost,
                isPublic: false
            });
            mockQueryItems.mockResolvedValue({
                Items: []
            }); // No contracts

            const response = await request(app)
                .get("/posts/post/post123")
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                success: false,
                error: "This post is only available for active patrons."
            });
        });

        it("should return 422 when creating post with invalid data", async () => {
            mockVerifyIdToken.mockResolvedValue(mockMonastic);

            // Mock middleware to allow the request through
            jest.mock("../../../src/_middleware/user.middleware", () => ({
                fetchUserFromDb: (req: any, _res: any, next: any) => {
                    req.user = mockMonastic;
                    next();
                },
                requireRole: () => (_req: any, _res: any, next: any) => next(),
                restrictToOwner: (_req: any, _res: any, next: any) => next()
            }));

            const response = await request(app)
                .post("/posts/post")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    content: "Invalid post" // Missing required fields
                });

            expect(response.status).toBe(422);
            expect(response.body.success).toBe(false);
        });

        it("should return empty feed for patron with no subscriptions", async () => {
            mockVerifyIdToken.mockResolvedValue(mockPatron);
            mockQueryItems.mockResolvedValue({
                Items: []
            }); // No active monastics

            const response = await request(app)
                .get("/posts/feed/zuko")
                .set("Authorization", `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.posts).toEqual([]);
        });
    });
});
