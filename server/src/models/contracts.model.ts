import { validateContract } from "../_db/validators";
import { putItem, getItem, queryItems } from "../_db/helpers";
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
    const result = await queryItems(
        TABLES.CONTRACTS,
        "monasticId = :monasticId",
        {
            ":monasticId": monasticId
        }
    );
    return result?.Items ?? [];
};

export const getContractsByPatron = async (patronId: string) => {
    const result = await queryItems(TABLES.CONTRACTS, "patronId = :patronId", {
        ":patronId": patronId
    });
    return result?.Items ?? [];
};

export const getActiveContractsForMonastic = async (monasticId: string) => {
    const contracts = await getContractsForMonastic(monasticId);

    if (contracts?.length === 0) {
        return [];
    }

    return contracts?.filter(
        (contract): contract is Contract => contract.status === "active"
    );
};

export const getActiveContractsByPatron = async (patronId: string) => {
    const contracts = await getContractsByPatron(patronId);

    if (contracts?.length === 0) {
        return [];
    }

    return contracts?.filter(
        (contract): contract is Contract => contract.status === "active"
    );
};

export const getActivePatronIdsForMonastic = async (monasticId: string) => {
    const activeContracts = await getActiveContractsForMonastic(monasticId);

    if (!activeContracts?.length) {
        return [];
    }

    return activeContracts
        .filter(
            (contract): contract is Contract => contract.patronId !== undefined
        )
        .map((contract) => contract.patronId);
};

export const getActiveMonasticIdsForPatron = async (patronId: string) => {
    const activeContracts = await getActiveContractsByPatron(patronId);

    if (!activeContracts?.length) {
        return [];
    }

    return activeContracts
        .filter(
            (contract): contract is Contract =>
                contract.monasticId !== undefined
        )
        .map((contract) => contract.monasticId);
};

export const getContractsBetweenPatronAndMonastic = async (
    patronId: string,
    monasticId: string
) => {
    const result = await queryItems(
        TABLES.CONTRACTS,
        "monasticId = :monasticId AND patronId = :patronId",
        {
            ":monasticId": monasticId,
            ":patronId": patronId
        },
        { indexName: "patronId-monasticId-index" }
    );
    return result?.Items ?? [];
};

export const updateContract = async (contract: Contract) => {
    if (!validateContract(contract)) {
        throw new UnprocessableEntityError(
            `Invalid contract data: ${JSON.stringify(validateContract.errors)}`
        );
    }
    return await putItem(TABLES.CONTRACTS, contract);
};
