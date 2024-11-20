import { validateSettings } from "../_db/validators";
import { putItem, queryItems } from "../_db/helpers";
import { TABLES, Settings } from "../_db/schemas";

export const createSettings = async (settings: Settings) => {
    if (!validateSettings(settings)) {
        throw new Error(
            `Invalid settings data: ${JSON.stringify(validateSettings.errors)}`
        );
    }
    return await putItem(TABLES.SETTINGS, settings);
};

export const getSettingsForUser = async (userId: string) => {
    return await queryItems(
        TABLES.SETTINGS,
        "userId = :userId",
        { ":userId": userId },
        "userId-index"
    );
};

export const updateSettings = async (settings: Settings) => {
    if (!validateSettings(settings)) {
        throw new Error(
            `Invalid settings data: ${JSON.stringify(validateSettings.errors)}`
        );
    }
    return await putItem(TABLES.SETTINGS, settings);
};
