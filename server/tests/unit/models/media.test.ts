import {
    createMedia,
    getMediaById,
    updateMedia
} from "../../../src/models/media.model";
import { putItem, getItem } from "../../../src/_db/helpers";
import { Media } from "../../../src/_db/schemas";

jest.mock("../../../src/_db/helpers", () => ({
    putItem: jest.fn(),
    getItem: jest.fn()
}));

describe("Media Module", () => {
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;

    const mockPutCommandOutput = {
        $metadata: { httpStatusCode: 200 }
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createMedia", () => {
        it("should create a media successfully with valid data", async () => {
            const validMedia: Media = {
                mediaId: "media123",
                uri: "/media.png",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            await expect(createMedia(validMedia)).resolves.toEqual(
                mockPutCommandOutput
            );
            expect(mockPutItem).toHaveBeenCalledWith("Media", validMedia);
        });

        it("should fail when media data is invalid", async () => {
            const invalidMedia: Partial<Media> = {
                mediaId: "media123", // Missing required fields like createdAt
                uri: "/media.png"
            };

            await expect(createMedia(invalidMedia as Media)).rejects.toThrow(
                /Invalid media data/
            );

            expect(mockPutItem).not.toHaveBeenCalled(); // Should not reach DB
        });
    });

    describe("getMediaById", () => {
        it("should retrieve a media by its ID", async () => {
            const mediaId = "media123";
            const mockMedia: Media = {
                mediaId,
                uri: "/media.png",
                createdAt: new Date().toISOString()
            };

            mockGetItem.mockResolvedValueOnce(mockMedia);

            const result = await getMediaById(mediaId);
            expect(result).toEqual(mockMedia);
            expect(mockGetItem).toHaveBeenCalledWith("Media", {
                mediaId
            });
        });
    });

    describe("updateMedia", () => {
        it("should update a media successfully with valid data", async () => {
            const validMedia: Media = {
                mediaId: "media123",
                uri: "/media-02.png",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            await expect(updateMedia(validMedia)).resolves.toEqual(
                mockPutCommandOutput
            );
            expect(mockPutItem).toHaveBeenCalledWith("Media", validMedia);
        });

        it("should fail when media data is invalid", async () => {
            const invalidMedia: Partial<Media> = {
                mediaId: "media123", // Missing required fields like createdAt
                uri: "/media.png"
            };

            await expect(updateMedia(invalidMedia as Media)).rejects.toThrow(
                /Invalid media data/
            );

            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });
});
