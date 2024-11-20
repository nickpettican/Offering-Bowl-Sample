import {
    createUser,
    getUserById,
    updateUser
} from "../../src/models/users.model";
import { putItem, getItem } from "../../src/_db/helpers";
import { User } from "../../src/_db/schemas";

jest.mock("../../src/_db/helpers", () => ({
    putItem: jest.fn(),
    getItem: jest.fn()
}));

describe("Users Module", () => {
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        it("should create a monastic successfully with valid data", async () => {
            const validUser: User = {
                userId: "aang",
                role: "monastic",
                name: "Aang",
                email: "air@nomad.org",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(createUser(validUser)).resolves.toBeUndefined();
            expect(mockPutItem).toHaveBeenCalledWith("Users", validUser);
        });

        it("should create a patron successfully with valid data", async () => {
            const validUser: User = {
                userId: "zuko",
                role: "patron",
                name: "Zuko",
                email: "hotman@royalty.org",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(createUser(validUser)).resolves.toBeUndefined();
            expect(mockPutItem).toHaveBeenCalledWith("Users", validUser);
        });

        it("should fail when user data is invalid", async () => {
            const invalidUser: Partial<User> = {
                userId: "aang", // Missing required fields like email
                role: "monastic",
                name: "Aang"
            };

            await expect(createUser(invalidUser as User)).rejects.toThrow(
                /Invalid user data/
            );

            expect(mockPutItem).not.toHaveBeenCalled(); // Should not reach DB
        });
    });

    describe("getUserById", () => {
        it("should retrieve a user by user ID", async () => {
            const userId = "aang";
            const mockUsers: User = {
                userId,
                role: "monastic",
                name: "Aang",
                email: "air@nomad.org",
                createdAt: new Date().toISOString()
            };

            mockGetItem.mockResolvedValueOnce(mockUsers);

            const result = await getUserById(userId);
            expect(result).toEqual(mockUsers);
            expect(mockGetItem).toHaveBeenCalledWith("Users", {
                userId
            });
        });
    });

    describe("updateUser", () => {
        it("should update a user successfully with valid data", async () => {
            const userId = "zuko";
            const validUser: User = {
                userId,
                role: "patron",
                name: "Zuko",
                email: "prince@royalty.org",
                createdAt: new Date().toISOString()
            };

            mockGetItem.mockResolvedValueOnce(validUser);
            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(updateUser(userId, validUser)).resolves.toEqual(
                validUser
            );
            expect(mockGetItem).toHaveBeenCalledWith("Users", {
                userId
            });
            expect(mockPutItem).toHaveBeenCalledWith("Users", validUser);
        });

        it("should fail when user data is invalid", async () => {
            const userId = "zuko";
            const invalidUser: Partial<User> = {
                userId: "zuko", // Missing required fields like email
                role: "patron",
                name: "Zuko"
            };

            await expect(
                updateUser(userId, invalidUser as User)
            ).rejects.toThrow(/Invalid user data/);

            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });
});
