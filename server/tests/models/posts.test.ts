import { getPostsForPatron } from "../../src/models/posts.model";
import { queryItems } from "../../src/_db/helpers";

jest.mock("../../src/_db/helpers", () => ({
    queryItems: jest.fn()
}));

describe("getPostsForPatron", () => {
    const mockedQueryItems = queryItems as jest.Mock;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return posts if there is an active contract", async () => {
        // Mock contract query
        mockedQueryItems.mockImplementationOnce(async () => [
            { monasticId: "aang", patronId: "zuko", status: "active" }
        ]);

        // Mock post query
        mockedQueryItems.mockImplementationOnce(async () => [
            {
                postId: "post1",
                monasticId: "aang",
                uri: "s3://post1",
                createdAt: "2023-01-01"
            }
        ]);

        const posts = await getPostsForPatron("aang", "zuko");
        expect(posts).toEqual([
            {
                postId: "post1",
                monasticId: "aang",
                uri: "s3://post1",
                createdAt: "2023-01-01"
            }
        ]);
    });

    it("should return an empty array if there are no active contracts", async () => {
        // Mock contract query
        mockedQueryItems.mockImplementationOnce(async () => [
            { monasticId: "aang", patronId: "zuko", status: "inactive" }
        ]);

        const posts = await getPostsForPatron("aang", "zuko");
        expect(posts).toEqual([]);
    });
});
