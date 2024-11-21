import { validateContract } from "../_db/validators";
import { putItem, getItem } from "../_db/helpers";
import { TABLES, Contract } from "../_db/schemas";
import { UnprocessableEntityError } from "../_utils/httpError";

export const createContract = async (contract: Contract) => {
    if (!validateContract(contract)) {
        throw new UnprocessableEntityError(
            `Invalid contract data: ${JSON.stringify(validateContract.errors)}`
        );
    }
    return await putItem(TABLES.CONTRACTS, contract);
};

export const getContractById = async (contractId: string) => {
    return await getItem(TABLES.CONTRACTS, { contractId });
};

export const getContractsForMonastic = async (monasticId: string) => {
    return await getItem(TABLES.CONTRACTS, { monasticId });
};

export const getContractsByPatron = async (patronId: string) => {
    return await getItem(TABLES.CONTRACTS, { patronId });
};

export const updateContract = async (contract: Contract) => {
    if (!validateContract(contract)) {
        throw new UnprocessableEntityError(
            `Invalid contract data: ${JSON.stringify(validateContract.errors)}`
        );
    }
    return await putItem(TABLES.CONTRACTS, contract);
};
