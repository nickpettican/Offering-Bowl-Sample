import {
    createProfile,
    getProfileById,
    getProfileForUser,
    updateProfileForUser,
    updateProfile
} from "../../../src/models/profiles.model";
import { putItem, getItem, queryItems } from "../../../src/_db/helpers";
import { Profile } from "../../../src/_db/schemas";
import {
    UnprocessableEntityError,
    NotFoundError
} from "../../../src/_utils/httpError";

jest.mock("../../../src/_db/helpers", () => ({
    putItem: jest.fn(),
    getItem: jest.fn(),
    queryItems: jest.fn()
}));

describe("Profile Model", () => {
    const mockGetItem = getItem as jest.Mock;
    const mockPutItem = putItem as jest.Mock;
    const mockQueryItems = queryItems as jest.Mock;

    const mockPutCommandOutput = {
        $metadata: { httpStatusCode: 200 }
    };

    const mockProfile: Profile = {
        profileId: "avatar",
        userId: "aang",
        gender: "male",
        ordinationType: "novice",
        ordinationDate: new Date("1024-01-01").toISOString(),
        tradition: "Tibetan",
        vowPreceptor: "Monk Gyatso",
        lifestyle: "anchorite",
        isApproved: true,
        createdAt: new Date().toISOString()
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createProfile", () => {
        it("should create a valid profile", async () => {
            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            await expect(createProfile(mockProfile)).resolves.toEqual(
                mockPutCommandOutput
            );

            expect(mockPutItem).toHaveBeenCalledWith("Profiles", mockProfile);
        });

        it("should throw an error for invalid profile data", async () => {
            const invalidProfile: Partial<Profile> = {
                profileId: "avatar", // Missing required fields like gender, createdAt
                userId: "aang"
            };

            await expect(
                createProfile(invalidProfile as Profile)
            ).rejects.toThrow(UnprocessableEntityError);

            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });

    describe("getProfileById", () => {
        it("should retrieve a profile by ID", async () => {
            mockGetItem.mockResolvedValueOnce(mockProfile);

            const result = await getProfileById("avatar");

            expect(result).toEqual(mockProfile);
            expect(mockGetItem).toHaveBeenCalledWith("Profiles", {
                profileId: "avatar"
            });
        });
    });

    describe("getProfileForUser", () => {
        it("should retrieve profiles for a user", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [mockProfile] });

            const result = await getProfileForUser("aang");

            expect(result).toEqual([mockProfile]);
            expect(mockQueryItems).toHaveBeenCalledWith(
                "Profiles",
                "userId = :userId",
                { ":userId": "aang" },
                { indexName: "userId-index" }
            );
        });
    });

    describe("updateProfileForUser", () => {
        it("should update an existing profile for a user", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [mockProfile] });
            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            const userId = "aang";
            const updatedProfile = { ...mockProfile, tradition: "Mahayana" };

            const result = await updateProfileForUser(userId, updatedProfile);

            expect(result).toEqual({ ...mockProfile, ...updatedProfile });
            expect(mockPutItem).toHaveBeenCalledWith(
                "Profiles",
                updatedProfile
            );
        });

        it("should throw NotFoundError if no profile exists for the user", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [] });

            await expect(
                updateProfileForUser("aang", mockProfile)
            ).rejects.toThrow(NotFoundError);

            expect(mockQueryItems).toHaveBeenCalledWith(
                "Profiles",
                "userId = :userId",
                { ":userId": "aang" },
                { indexName: "userId-index" }
            );
            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });

    describe("updateProfile", () => {
        it("should update an existing profile by ID", async () => {
            mockGetItem.mockResolvedValueOnce(mockProfile);
            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            const updatedProfile: Profile = {
                ...mockProfile,
                lifestyle: "cenobite"
            };

            const result = await updateProfile("avatar", updatedProfile);

            expect(result).toEqual({ ...mockProfile, ...updatedProfile });
            expect(mockPutItem).toHaveBeenCalledWith(
                "Profiles",
                updatedProfile
            );
        });

        it("should throw NotFoundError if the profile does not exist", async () => {
            mockGetItem.mockResolvedValueOnce(null);

            await expect(updateProfile("avatar", mockProfile)).rejects.toThrow(
                NotFoundError
            );

            expect(mockGetItem).toHaveBeenCalledWith("Profiles", {
                profileId: "avatar"
            });
            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });
});
