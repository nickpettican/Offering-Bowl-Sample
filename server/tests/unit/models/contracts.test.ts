import {
    createContract,
    getContractById,
    getContractsForMonastic,
    getContractsByPatron,
    updateContract,
    getContractsBetweenPatronAndMonastic,
    getActiveMonasticIdsForPatron,
    getActivePatronIdsForMonastic,
    getActiveContractsByPatron,
    getActiveContractsForMonastic
} from "../../../src/models/contracts.model";
import { putItem, getItem, queryItems } from "../../../src/_db/helpers";
import { Contract } from "../../../src/_db/schemas";

jest.mock("../../../src/_db/helpers", () => ({
    putItem: jest.fn(),
    getItem: jest.fn(),
    queryItems: jest.fn()
}));

describe("Contracts Module", () => {
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;
    const mockQueryItems = queryItems as jest.Mock;

    const mockPutCommandOutput = {
        $metadata: { httpStatusCode: 200 }
    };

    const mockContracts: Contract[] = [
        {
            contractId: "contract1",
            patronId: "zuko",
            monasticId: "aang",
            amount: 100,
            recurring: true,
            status: "active",
            createdAt: new Date().toISOString()
        },
        {
            contractId: "contract2",
            patronId: "katara",
            monasticId: "aang",
            amount: 150,
            recurring: true,
            status: "paused",
            createdAt: new Date().toISOString()
        },
        {
            contractId: "contract3",
            patronId: "zuko",
            monasticId: "tenzin",
            amount: 200,
            recurring: false,
            status: "active",
            createdAt: new Date().toISOString()
        }
    ];

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

            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            await expect(createContract(validContract)).resolves.toEqual(
                mockPutCommandOutput
            );
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

            mockQueryItems.mockResolvedValueOnce({ Items: mockContracts });

            const result = await getContractsForMonastic(monasticId);
            expect(result).toEqual(mockContracts);
            expect(mockQueryItems).toHaveBeenCalledWith(
                "Contracts",
                "monasticId = :monasticId",
                { ":monasticId": monasticId }
            );
        });
    });

    describe("getContractsByPatron", () => {
        it("should retrieve all contracts for a patron", async () => {
            const patronId = "zuko";

            mockQueryItems.mockResolvedValueOnce({ Items: mockContracts });

            const result = await getContractsByPatron(patronId);
            expect(result).toEqual(mockContracts);
            expect(mockQueryItems).toHaveBeenCalledWith(
                "Contracts",
                "patronId = :patronId",
                { ":patronId": patronId }
            );
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

            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);

            await expect(updateContract(validContract)).resolves.toEqual(
                mockPutCommandOutput
            );
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

    describe("getActiveContractsForMonastic", () => {
        it("should return only active contracts for a monastic", async () => {
            mockQueryItems.mockResolvedValueOnce({
                Items: mockContracts.slice(0, 1)
            });

            const result = await getActiveContractsForMonastic("aang");
            expect(result).toHaveLength(1);
            expect(result[0].contractId).toBe("contract1");
            expect(result[0].status).toBe("active");
        });

        it("should return empty array when no contracts exist", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [] });

            const result = await getActiveContractsForMonastic("nonexistent");
            expect(result).toEqual([]);
        });
    });

    describe("getActiveContractsByPatron", () => {
        it("should return only active contracts for a patron", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: mockContracts });

            const result = await getActiveContractsByPatron("zuko");
            expect(result).toHaveLength(2);
            expect(
                result.every((contract) => contract.status === "active")
            ).toBe(true);
        });

        it("should return empty array when no contracts exist", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [] });

            const result = await getActiveContractsByPatron("nonexistent");
            expect(result).toEqual([]);
        });
    });

    describe("getActivePatronIdsForMonastic", () => {
        it("should return array of patron IDs with active contracts", async () => {
            const monasticId = "aang";
            mockQueryItems.mockResolvedValueOnce({
                Items: mockContracts.filter(
                    (c: Contract) => c.monasticId === monasticId
                )
            });

            const result = await getActivePatronIdsForMonastic("aang");
            expect(result).toHaveLength(1);
            expect(result).toContain("zuko");
            expect(result).not.toContain("katara"); // paused contract
        });

        it("should return empty array when no active contracts exist", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [mockContracts[1]] }); // Only paused contract

            const result = await getActivePatronIdsForMonastic("aang");
            expect(result).toEqual([]);
        });
    });

    describe("getActiveMonasticIdsForPatron", () => {
        it("should return array of monastic IDs with active contracts", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: mockContracts });

            const result = await getActiveMonasticIdsForPatron("zuko");
            expect(result).toHaveLength(2);
            expect(result).toContain("aang");
            expect(result).toContain("tenzin");
        });

        it("should return empty array when no active contracts exist", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [] });

            const result = await getActiveMonasticIdsForPatron("nonexistent");
            expect(result).toEqual([]);
        });
    });

    describe("getContractsBetweenPatronAndMonastic", () => {
        it("should return all contracts between a patron and monastic", async () => {
            const specificContracts = [
                {
                    contractId: "contract1",
                    patronId: "zuko",
                    monasticId: "aang",
                    status: "active"
                },
                {
                    contractId: "contract2",
                    patronId: "zuko",
                    monasticId: "aang",
                    status: "paused"
                }
            ];

            mockQueryItems.mockResolvedValueOnce({ Items: specificContracts });

            const result = await getContractsBetweenPatronAndMonastic(
                "zuko",
                "aang"
            );
            expect(result).toHaveLength(2);
            expect(result).toEqual(specificContracts);
        });

        it("should use the correct GSI for the query", async () => {
            await getContractsBetweenPatronAndMonastic("zuko", "aang");

            expect(mockQueryItems).toHaveBeenCalledWith(
                "Contracts",
                "monasticId = :monasticId AND patronId = :patronId",
                {
                    ":monasticId": "aang",
                    ":patronId": "zuko"
                },
                { indexName: "patronId-monasticId-index" }
            );
        });

        it("should return empty array when no contracts exist", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: [] });

            const result = await getContractsBetweenPatronAndMonastic(
                "nonexistent",
                "nonexistent"
            );
            expect(result).toEqual([]);
        });
    });

    // edge cases

    describe.skip("Data Validation Edge Cases", () => {
        it("should handle contract with zero amount", async () => {
            const zeroAmountContract: Contract = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: 0,
                recurring: true,
                status: "active",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);
            await expect(createContract(zeroAmountContract)).resolves.toEqual(
                mockPutCommandOutput
            );
        });

        it("should reject negative amounts", async () => {
            const negativeAmountContract: Contract = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: -10,
                recurring: true,
                status: "active",
                createdAt: new Date().toISOString()
            };

            await expect(
                createContract(negativeAmountContract)
            ).rejects.toThrow(/Invalid contract data/);
        });

        it("should handle very large amounts", async () => {
            const largeAmountContract: Contract = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: Number.MAX_SAFE_INTEGER,
                recurring: true,
                status: "active",
                createdAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);
            await expect(createContract(largeAmountContract)).resolves.toEqual(
                mockPutCommandOutput
            );
        });
    });

    describe.skip("Status Transition Edge Cases", () => {
        it("should handle rapid status changes", async () => {
            const contract: Contract = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: 100,
                recurring: true,
                status: "active",
                createdAt: new Date().toISOString()
            };

            // Simulate rapid status changes
            mockPutItem.mockResolvedValueOnce(mockPutCommandOutput);
            await updateContract({ ...contract, status: "active" });
            await updateContract({ ...contract, status: "paused" });
            await updateContract({ ...contract, status: "active" });

            expect(mockPutItem).toHaveBeenCalledTimes(3);
        });

        it("should handle invalid status transitions", async () => {
            const invalidStatusContract: Contract = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: 100,
                recurring: true,
                status: "invalid_status" as any,
                createdAt: new Date().toISOString()
            };

            await expect(updateContract(invalidStatusContract)).rejects.toThrow(
                /Invalid contract data/
            );
        });
    });

    describe.skip("Query Edge Cases", () => {
        it("should handle patrons with multiple active contracts with same monastic", async () => {
            const multipleContracts = [
                {
                    contractId: "contract1",
                    patronId: "zuko",
                    monasticId: "aang",
                    status: "active",
                    createdAt: "2024-01-01T00:00:00Z"
                },
                {
                    contractId: "contract2",
                    patronId: "zuko",
                    monasticId: "aang",
                    status: "active",
                    createdAt: "2024-01-02T00:00:00Z"
                }
            ];

            mockQueryItems.mockResolvedValueOnce({ Items: multipleContracts });
            const result = await getContractsBetweenPatronAndMonastic(
                "zuko",
                "aang"
            );
            expect(result).toHaveLength(2);
            expect(result.every((c) => c.status === "active")).toBe(true);
        });

        it("should handle maximum number of active contracts per monastic", async () => {
            const maxContracts = Array(100)
                .fill(null)
                .map((_, i) => ({
                    contractId: `contract${i}`,
                    patronId: `patron${i}`,
                    monasticId: "aang",
                    status: "active",
                    createdAt: new Date().toISOString()
                }));

            mockQueryItems.mockResolvedValueOnce({ Items: maxContracts });
            const activePatronIds = await getActivePatronIdsForMonastic("aang");
            expect(activePatronIds).toHaveLength(100);
        });

        it("should handle contracts with missing createdAt dates", async () => {
            const contractWithoutDate = {
                contractId: "contract123",
                patronId: "zuko",
                monasticId: "aang",
                amount: 100,
                recurring: true,
                status: "active"
            };

            await expect(
                createContract(contractWithoutDate as Contract)
            ).rejects.toThrow(/Invalid contract data/);
        });
    });

    describe.skip("Database Error Edge Cases", () => {
        it("should handle database timeout", async () => {
            mockQueryItems.mockRejectedValueOnce(new Error("Database timeout"));
            await expect(getContractsForMonastic("aang")).rejects.toThrow(
                "Database timeout"
            );
        });

        it("should handle partial database response", async () => {
            mockQueryItems.mockResolvedValueOnce({ Items: null });
            const result = await getContractsForMonastic("aang");
            expect(result).toEqual([]);
        });

        it("should handle malformed database response", async () => {
            mockQueryItems.mockResolvedValueOnce({
                Items: [{ invalidField: "value" }]
            });
            const result = await getActiveContractsForMonastic("aang");
            expect(result).toEqual([]);
        });
    });
});
