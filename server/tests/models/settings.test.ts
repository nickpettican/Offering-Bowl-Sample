import {
    createSettings,
    getSettingsForUser,
    updateSettings
} from "../../src/models/settings.model";
import { putItem, getItem, queryItems } from "../../src/_db/helpers";
import { Settings } from "../../src/_db/schemas";

jest.mock("../../src/_db/helpers", () => ({
    putItem: jest.fn(),
    getItem: jest.fn(),
    queryItems: jest.fn()
}));

describe("Settings Module", () => {
    const mockPutItem = putItem as jest.Mock;
    const mockQueryItems = queryItems as jest.Mock;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createSettings", () => {
        it("should create a settings successfully with valid data", async () => {
            const validSettings: Settings = {
                settingsId: "settings123",
                userId: "aang",
                country: "Air Nation",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(
                createSettings(validSettings)
            ).resolves.toBeUndefined();
            expect(mockPutItem).toHaveBeenCalledWith("Settings", validSettings);
        });

        it("should fail when settings data is invalid", async () => {
            const invalidSettings: Partial<Settings> = {
                settingsId: "settings123", // Missing required fields like country, createdAt
                userId: "aang"
            };

            await expect(
                createSettings(invalidSettings as Settings)
            ).rejects.toThrow(/Invalid settings data/);

            expect(mockPutItem).not.toHaveBeenCalled(); // Should not reach DB
        });
    });

    describe("getSettingsForUser", () => {
        it("should retrieve a settings by user ID", async () => {
            const userId = "aang";
            const mockSettings: Settings = {
                userId,
                settingsId: "setting123",
                country: "Air Nation",
                createdAt: new Date().toISOString()
            };

            mockQueryItems.mockResolvedValueOnce(mockSettings);

            const result = await getSettingsForUser(userId);
            expect(result).toEqual(mockSettings);
            expect(mockQueryItems).toHaveBeenCalledWith(
                "Settings",
                "userId = :userId",
                { ":userId": userId },
                "userId-index"
            );
        });
    });

    describe("updateSettings", () => {
        it("should update a settings successfully with valid data", async () => {
            const validSettings: Settings = {
                settingsId: "settings123",
                userId: "aang",
                country: "Air Nation",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(
                updateSettings(validSettings)
            ).resolves.toBeUndefined();
            expect(mockPutItem).toHaveBeenCalledWith("Settings", validSettings);
        });

        it("should fail when settings data is invalid", async () => {
            const invalidSettings: Partial<Settings> = {
                settingsId: "settings123", // Missing required fields like country, createdAt
                userId: "aang"
            };

            await expect(
                updateSettings(invalidSettings as Settings)
            ).rejects.toThrow(/Invalid settings data/);

            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });
});
