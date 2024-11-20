import { createReceipt, getReceiptById } from "../../src/models/receipts.model";
import { putItem, getItem } from "../../src/_db/helpers";
import { Receipt } from "../../src/_db/schemas";

jest.mock("../../src/_db/helpers", () => ({
    putItem: jest.fn(),
    getItem: jest.fn()
}));

describe("Receipt Module", () => {
    const mockPutItem = putItem as jest.Mock;
    const mockGetItem = getItem as jest.Mock;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createReceipt", () => {
        it("should create a receipt successfully with valid data", async () => {
            const validReceipt: Receipt = {
                receiptId: "receipt123",
                contractId: "contract123",
                mediaId: "media123",
                issuedAt: new Date().toISOString()
            };

            mockPutItem.mockResolvedValueOnce(undefined);

            await expect(createReceipt(validReceipt)).resolves.toBeUndefined();
            expect(mockPutItem).toHaveBeenCalledWith("Receipts", validReceipt);
        });

        it("should fail when receipt data is invalid", async () => {
            const invalidReceipt: Partial<Receipt> = {
                receiptId: "receipt123", // Missing required fields like issuedAt
                contractId: "contract123",
                mediaId: "media123"
            };

            await expect(
                createReceipt(invalidReceipt as Receipt)
            ).rejects.toThrow(/Invalid receipt data/);

            expect(mockPutItem).not.toHaveBeenCalled(); // Should not reach DB
        });
    });

    describe("getReceiptById", () => {
        it("should retrieve a receipt by its ID", async () => {
            const receiptId = "receipt123";
            const mockReceipt: Receipt = {
                receiptId,
                contractId: "contract123",
                mediaId: "media123",
                issuedAt: new Date().toISOString()
            };

            mockGetItem.mockResolvedValueOnce(mockReceipt);

            const result = await getReceiptById(receiptId);
            expect(result).toEqual(mockReceipt);
            expect(mockGetItem).toHaveBeenCalledWith("Receipts", {
                receiptId
            });
        });
    });
});
