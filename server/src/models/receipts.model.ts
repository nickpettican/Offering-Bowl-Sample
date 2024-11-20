import { validateReceipt } from "../_db/validators";
import { putItem, getItem } from "../_db/helpers";
import { TABLES, Receipt } from "../_db/schemas";

export const createReceipt = async (receipt: Receipt) => {
    if (!validateReceipt(receipt)) {
        throw new Error(
            `Invalid receipt data: ${JSON.stringify(validateReceipt.errors)}`
        );
    }
    return await putItem(TABLES.RECEIPTS, receipt);
};

export const getReceiptById = async (receiptId: string) => {
    return await getItem(TABLES.RECEIPTS, { receiptId });
};
