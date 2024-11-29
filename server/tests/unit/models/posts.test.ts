import {
    getPublicPostById,
    getPublicPostsOfMonastic,
    getPostForUser,
    getPatronFeedPosts,
    getMonasticProfilePostsForPatron,
    createPost,
    deletePost
} from "../../../src/models/posts.model";
import { TABLES } from "../../../src/_db/schemas";
import {
    putItem,
    getItem,
    queryItems,
    deleteItem
} from "../../../src/_db/helpers";

jest.mock("../../../src/_db/helpers");

describe("Posts Model Unit Tests", () => {
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;
    const mockQueryItems = queryItems as jest.Mock;
    const mockDeleteItem = deleteItem as jest.Mock;

    const mockPutCommandOutput = {
        $metadata: { httpStatusCode: 200 }
    };

    const mockPost = {
        postId: "post123",
        monasticId: "aang",
        content: "Test post",
        mediaId: "media123",
        isPublic: true,
        createdAt: new Date().toISOString()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getPublicPostById", () => {
        it("should return a public post when it exists", async () => {
            mockQueryItems.mockResolvedValue({
                Items: [mockPost]
            });

            const result = await getPublicPostById(mockPost.postId);
            expect(result).toEqual(mockPost);
            expect(queryItems).toHaveBeenCalledWith(
                TABLES.POSTS,
                "postId = :postId AND isPublic = :isPublic",
                { ":postId": mockPost.postId, ":isPublic": true }
            );
        });

        it("should return undefined when post doesn't exist", async () => {
            mockQueryItems.mockResolvedValue({
                Items: []
            });

            await expect(getPublicPostById("nonexistent")).rejects.toThrow(
                /Post not found/
            );
        });
    });

    describe("getPublicPostsOfMonastic", () => {
        it("should return public posts with pagination", async () => {
            const mockPosts = [mockPost, { ...mockPost, postId: "post456" }];
            mockQueryItems.mockResolvedValue({
                Items: mockPosts,
                LastEvaluatedKey: { postId: "post456" }
            });

            const result = await getPublicPostsOfMonastic("aang", {
                limit: 2
            });
            expect(result.posts).toEqual(mockPosts);
            expect(result.lastEvaluatedKey).toEqual({ postId: "post456" });
        });

        it("should return empty array when no posts exist", async () => {
            mockQueryItems.mockResolvedValue({
                Items: []
            });

            const result = await getPublicPostsOfMonastic("aang");
            expect(result.posts).toEqual([]);
            expect(result.lastEvaluatedKey).toBeNull();
        });
    });

    describe("getPostForUser", () => {
        it("should return post if user has active contract", async () => {
            mockGetItem.mockResolvedValue(mockPost);
            const mockContract = { status: "active" };
            mockQueryItems.mockResolvedValue({
                Items: [mockContract]
            });

            const result = await getPostForUser(mockPost.postId, "zuko");
            expect(result).toEqual(mockPost);
        });

        it("should throw forbidden error if no active contract", async () => {
            mockGetItem.mockResolvedValue({
                ...mockPost,
                isPublic: false
            });
            mockQueryItems.mockResolvedValue({
                Items: []
            });

            await expect(
                getPostForUser(mockPost.postId, "zuko")
            ).rejects.toThrow(
                "This post is only available for active patrons."
            );
        });
    });

    describe("createPost", () => {
        const validPost = {
            postId: "post123",
            monasticId: "aang",
            mediaId: "media123",
            content: "Test post",
            isPublic: true,
            createdAt: new Date().toISOString()
        };

        it("should create a valid post", async () => {
            mockPutItem.mockResolvedValue(mockPutCommandOutput);

            const result = await createPost(validPost);
            expect(result).toEqual(mockPutCommandOutput);
            expect(putItem).toHaveBeenCalledWith(TABLES.POSTS, validPost);
        });

        it("should throw UnprocessableEntityError for invalid post data", async () => {
            const invalidPost = {
                ...validPost,
                isPublic: undefined // Required field missing
            };

            // @ts-expect-error Type 'undefined' is not assignable to type 'boolean'.
            await expect(createPost(invalidPost)).rejects.toThrow(
                "Invalid post data"
            );
        });
    });

    describe("deletePost", () => {
        it("should delete an existing post", async () => {
            mockDeleteItem.mockResolvedValue({
                success: true
            });

            const result = await deletePost("post123");
            expect(result).toEqual({ success: true });
            expect(deleteItem).toHaveBeenCalledWith(TABLES.POSTS, {
                postId: "post123"
            });
        });
    });

    describe("getMonasticProfilePostsForPatron", () => {
        const mockPosts = [
            { postId: "post1", monasticId: "aang", isPublic: true },
            { postId: "post2", monasticId: "aang", isPublic: false }
        ];

        it("should return all posts when patron has active contract", async () => {
            const mockContract = { status: "active" };
            mockQueryItems
                .mockResolvedValueOnce({ Items: [mockContract] }) // For contracts query
                .mockResolvedValueOnce({
                    Items: mockPosts,
                    LastEvaluatedKey: null
                }); // For posts query

            const result = await getMonasticProfilePostsForPatron(
                "aang",
                "zuko",
                {}
            );
            expect(result.posts).toEqual(mockPosts);
        });

        it("should return empty array when no active contract exists", async () => {
            mockQueryItems.mockResolvedValueOnce({
                Items: []
            }); // No contracts

            const result = await getMonasticProfilePostsForPatron(
                "aang",
                "zuko",
                {}
            );
            expect(result.posts).toEqual([]);
        });

        it("should handle pagination correctly", async () => {
            const mockContract = { status: "active" };
            const lastEvaluatedKey = { postId: "post1" };

            mockQueryItems
                .mockResolvedValueOnce({ Items: [mockContract] })
                .mockResolvedValueOnce({
                    Items: mockPosts,
                    LastEvaluatedKey: lastEvaluatedKey
                });

            const result = await getMonasticProfilePostsForPatron(
                "aang",
                "zuko",
                {
                    limit: 2,
                    lastEvaluatedKey: { postId: "startKey" }
                }
            );

            expect(result.posts).toEqual(mockPosts);
            expect(result.lastEvaluatedKey).toEqual(lastEvaluatedKey);
        });
    });

    describe("getPatronFeedPosts", () => {
        const mockPosts = [
            {
                postId: "post1",
                monasticId: "tenzin",
                createdAt: "2024-01-02"
            },
            {
                postId: "post2",
                monasticId: "monastic2",
                createdAt: "2024-01-01"
            }
        ];
        const mockContracts = [
            { monasticId: "tenzin", status: "active" },
            { monasticId: "monastic2", status: "active" }
        ];

        it("should return sorted posts from all subscribed monastics", async () => {
            mockQueryItems
                .mockResolvedValueOnce({ Items: mockContracts }) // For active monastics
                .mockResolvedValueOnce({ Items: [mockPosts[0]] }) // Posts from first monastic
                .mockResolvedValueOnce({ Items: [mockPosts[1]] }); // Posts from second monastic

            const result = await getPatronFeedPosts("zuko", { limit: 10 });
            expect(result.posts).toEqual(mockPosts);
            expect(
                new Date(result.posts[0].createdAt).getTime()
            ).toBeGreaterThan(new Date(result.posts[1].createdAt).getTime());
        });

        it("should return empty array when patron has no subscriptions", async () => {
            mockQueryItems.mockResolvedValueOnce({
                Items: []
            }); // No active monastics

            const result = await getPatronFeedPosts("zuko", {});
            expect(result.posts).toEqual([]);
            expect(result.lastEvaluatedKey).toBeNull();
        });

        it("should respect limit parameter", async () => {
            const manyPosts = Array(15)
                .fill(null)
                .map((_, i) => ({
                    postId: `post${i}`,
                    monasticId: "tenzin",
                    createdAt: new Date(2024, 0, i + 1).toISOString()
                }));

            mockQueryItems
                .mockResolvedValueOnce({
                    Items: [{ monasticId: "tenzin", status: "active" }]
                })
                .mockResolvedValueOnce({ Items: manyPosts });

            const result = await getPatronFeedPosts("zuko", { limit: 10 });
            expect(result.posts).toHaveLength(10);
            expect(result.lastEvaluatedKey).not.toBeNull();
        });
    });

    // edge cases

    describe("Content Validation Edge Cases", () => {
        it("should handle extremely long post content", async () => {
            const longContent = "a".repeat(10000);
            const longPost = {
                postId: "post123",
                monasticId: "aang",
                mediaId: "media123",
                content: longContent,
                isPublic: true,
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);
            await expect(createPost(longPost)).rejects.toThrow(
                /Invalid post data/
            );
        });

        it("should handle posts with empty content", async () => {
            const emptyContentPost = {
                postId: "post123",
                monasticId: "aang",
                mediaId: "media123",
                content: "",
                isPublic: true,
                createdAt: new Date().toISOString()
            };

            await expect(createPost(emptyContentPost)).rejects.toThrow(
                /Invalid post data/
            );
        });

        it("should handle special characters in content", async () => {
            const testCases = [
                {
                    desc: "emoji and sanskrit",
                    content: "🙏 धम्मो पञ्ञत्तो"
                },
                {
                    desc: "chinese characters",
                    content: "佛法僧"
                },
                {
                    desc: "line breaks and quotes",
                    content: "Line 1\nLine 2\n'quoted'\n\"double quoted\""
                },
                {
                    desc: "html characters that should be escaped",
                    content: "<script>alert('test')</script>"
                }
            ];

            for (const testCase of testCases) {
                mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

                const post = {
                    postId: "post123",
                    monasticId: "aang",
                    mediaId: "media123",
                    content: testCase.content,
                    isPublic: true,
                    createdAt: new Date().toISOString()
                };

                await expect(createPost(post)).resolves.toEqual(
                    mockPutCommandOutput
                );
            }
        });
    });

    describe.skip("Access Control Edge Cases", () => {
        it("should handle post access with expired contract", async () => {
            const post = {
                postId: "post123",
                monasticId: "aang",
                isPublic: false
            };

            const expiredContract = {
                patronId: "zuko",
                monasticId: "aang",
                status: "canceled",
                createdAt: new Date(Date.now() - 86400000).toISOString()
            };

            mockGetItem.mockResolvedValueOnce(post);
            mockQueryItems.mockResolvedValueOnce({ Items: [expiredContract] });

            await expect(getPostForUser("post123", "zuko")).rejects.toThrow(
                "This post is only available for active patrons"
            );
        });

        it("should handle post access with multiple contracts in different states", async () => {
            const post = {
                postId: "post123",
                monasticId: "aang",
                isPublic: false
            };

            const mixedContracts = [
                { status: "canceled", createdAt: "2024-01-01T00:00:00Z" },
                { status: "active", createdAt: "2024-01-02T00:00:00Z" },
                { status: "paused", createdAt: "2024-01-03T00:00:00Z" }
            ];

            mockGetItem.mockResolvedValueOnce(post);
            mockQueryItems.mockResolvedValueOnce({ Items: mixedContracts });

            const result = await getPostForUser("post123", "zuko");
            expect(result).toEqual(post);
        });
    });

    describe.skip("Feed Generation Edge Cases", () => {
        it("should handle patron following maximum number of monastics", async () => {
            const maxMonastics = Array(100)
                .fill(null)
                .map((_, i) => `monastic${i}`);
            const mockPosts = maxMonastics.map((monasticId) => ({
                postId: `post_${monasticId}`,
                monasticId,
                content: "content",
                createdAt: new Date().toISOString()
            }));

            mockQueryItems
                .mockResolvedValueOnce({ Items: maxMonastics }) // Active monastics
                .mockResolvedValue({ Items: [mockPosts[0]] }); // Each monastic's posts

            const result = await getPatronFeedPosts("zuko", { limit: 10 });
            expect(result.posts.length).toBeLessThanOrEqual(10);
        });

        it("should handle feed with posts created at exact same timestamp", async () => {
            const timestamp = new Date().toISOString();
            const sameDatePosts = [
                { postId: "post1", monasticId: "aang", createdAt: timestamp },
                { postId: "post2", monasticId: "aang", createdAt: timestamp },
                { postId: "post3", monasticId: "aang", createdAt: timestamp }
            ];

            mockQueryItems
                .mockResolvedValueOnce({ Items: ["aang"] })
                .mockResolvedValueOnce({ Items: sameDatePosts });

            const result = await getPatronFeedPosts("zuko", { limit: 10 });
            expect(result.posts).toHaveLength(3);
        });
    });

    describe.skip("Pagination Edge Cases", () => {
        it("should handle last page with fewer items than limit", async () => {
            const posts = Array(3)
                .fill(null)
                .map((_, i) => ({
                    postId: `post${i}`,
                    monasticId: "aang",
                    createdAt: new Date().toISOString()
                }));

            mockQueryItems.mockResolvedValueOnce({
                Items: posts,
                LastEvaluatedKey: undefined
            });

            const result = await getPublicPostsOfMonastic("aang", {
                limit: 10
            });
            expect(result.posts).toHaveLength(3);
            expect(result.lastEvaluatedKey).toBeNull();
        });

        it("should handle invalid lastEvaluatedKey format", async () => {
            await expect(
                getPublicPostsOfMonastic("aang", {
                    lastEvaluatedKey: "invalid" as any
                })
            ).rejects.toThrow();
        });
    });
});
