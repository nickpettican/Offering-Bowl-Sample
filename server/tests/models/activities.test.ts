import { logActivity } from "../../src/models/activities.model";
import { Activity } from "../../src/_db/schemas";
import { putItem } from "../../src/_db/helpers";

jest.mock("../../src/_db/helpers", () => ({
    putItem: jest.fn()
}));

describe("logActivity", () => {
    const mockPutItem = putItem as jest.Mock;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should log a valid activity successfully", async () => {
        const validActivity: Activity = {
            activityId: "activity123",
            userId: "zuko",
            type: "signup",
            details: "User signed up",
            createdAt: new Date().toISOString()
        };

        mockPutItem.mockResolvedValueOnce(undefined); // Simulate successful DB operation

        await expect(logActivity(validActivity)).resolves.toBeUndefined();
        expect(mockPutItem).toHaveBeenCalledWith("Activities", validActivity);
    });

    it("should throw an error for invalid activity data", async () => {
        const invalidActivity: Partial<Activity> = {
            userId: "zuko", // Missing activityId
            type: "signup",
            createdAt: new Date().toISOString()
        };

        await expect(logActivity(invalidActivity as Activity)).rejects.toThrow(
            /Invalid activity data/
        );

        expect(mockPutItem).not.toHaveBeenCalled(); // Should not reach DB
    });

    it("should throw an error if DynamoDB fails", async () => {
        const validActivity: Activity = {
            activityId: "activity123",
            userId: "zuko",
            type: "signup",
            details: "User signed up",
            createdAt: new Date().toISOString()
        };

        mockPutItem.mockRejectedValueOnce(new Error("DynamoDB error")); // Simulate DB failure

        await expect(logActivity(validActivity)).rejects.toThrow(
            "DynamoDB error"
        );
        expect(mockPutItem).toHaveBeenCalledWith("Activities", validActivity);
    });
});
