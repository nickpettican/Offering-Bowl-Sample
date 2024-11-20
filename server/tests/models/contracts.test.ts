import {
    createContract,
    getContractById,
    getContractsForMonastic,
    getContractsByPatron,
    updateContract
} from "../../src/models/contracts.model";
import { putItem, getItem } from "../../src/_db/helpers";
import { Contract } from "../../src/_db/schemas";

jest.mock("../../src/_db/helpers", () => ({
    putItem: jest.fn(),
    getItem: jest.fn()
}));

describe("Contracts Module", () => {
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createContract", () => {
        it("should create a contract successfully with valid data", async () => {
            const validContract: Contract = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: 10,
                recurring: true,
                status: "active",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(
                createContract(validContract)
            ).resolves.toBeUndefined();
            expect(mockPutItem).toHaveBeenCalledWith(
                "Contracts",
                validContract
            );
        });

        it("should fail when contract data is invalid", async () => {
            const invalidContract: Partial<Contract> = {
                patronId: "zuko", // Missing required fields like contractId, monasticId, etc.
                amount: 10
            };

            await expect(
                createContract(invalidContract as Contract)
            ).rejects.toThrow(/Invalid contract data/);

            expect(mockPutItem).not.toHaveBeenCalled(); // Should not reach DB
        });
    });

    describe("getContractById", () => {
        it("should retrieve a contract by its ID", async () => {
            const contractId = "contract123";
            const mockContract: Contract = {
                contractId,
                patronId: "zuko",
                monasticId: "aang",
                amount: 10,
                recurring: true,
                status: "active",
                createdAt: new Date().toISOString()
            };

            mockGetItem.mockResolvedValueOnce(mockContract);

            const result = await getContractById(contractId);
            expect(result).toEqual(mockContract);
            expect(mockGetItem).toHaveBeenCalledWith("Contracts", {
                contractId
            });
        });
    });

    describe("getContractsForMonastic", () => {
        it("should retrieve all contracts for a monastic", async () => {
            const monasticId = "aang";
            const mockContracts = [
                { contractId: "contract123", monasticId, patronId: "zuko" }
            ];

            mockGetItem.mockResolvedValueOnce(mockContracts);

            const result = await getContractsForMonastic(monasticId);
            expect(result).toEqual(mockContracts);
            expect(mockGetItem).toHaveBeenCalledWith("Contracts", {
                monasticId
            });
        });
    });

    describe("getContractsByPatron", () => {
        it("should retrieve all contracts for a patron", async () => {
            const patronId = "zuko";
            const mockContracts = [
                { contractId: "contract123", patronId, monasticId: "aang" }
            ];

            mockGetItem.mockResolvedValueOnce(mockContracts);

            const result = await getContractsByPatron(patronId);
            expect(result).toEqual(mockContracts);
            expect(mockGetItem).toHaveBeenCalledWith("Contracts", { patronId });
        });
    });

    describe("updateContract", () => {
        it("should update a contract successfully with valid data", async () => {
            const validContract: Contract = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: 150,
                recurring: false,
                status: "paused",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(
                updateContract(validContract)
            ).resolves.toBeUndefined();
            expect(mockPutItem).toHaveBeenCalledWith(
                "Contracts",
                validContract
            );
        });

        it("should fail when contract data is invalid", async () => {
            const invalidContract: Partial<Contract> = {
                contractId: "contract123",
                amount: 150 // Missing required fields like patronId, monasticId, etc.
            };

            await expect(
                updateContract(invalidContract as Contract)
            ).rejects.toThrow(/Invalid contract data/);

            expect(mockPutItem).not.toHaveBeenCalled();
        });
    });
});
