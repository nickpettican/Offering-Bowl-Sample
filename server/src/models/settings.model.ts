import { validateSettings } from "../_db/validators";
import { getItem, putItem, queryItems } from "../_db/helpers";
import { TABLES, Settings } from "../_db/schemas";
import { NotFoundError, UnprocessableEntityError } from "../_utils/httpError";

export const createSettings = async (settings: Settings) => {
    if (!validateSettings(settings)) {
        throw new UnprocessableEntityError(
            `Invalid settings data: ${JSON.stringify(validateSettings.errors)}`
        );
    }
    return await putItem(TABLES.SETTINGS, settings);
};

export const getSettingsById = async (settingsId: string) => {
    return await getItem(TABLES.SETTINGS, { settingsId });
};

export const getSettingsForUser = async (userId: string) => {
    return await queryItems(
        TABLES.SETTINGS,
        "userId = :userId",
        { ":userId": userId },
        "userId-index"
    );
};

export const updateSettings = async (
    settingsId: string,
    updatedSettings: Settings
) => {
    if (!validateSettings(updatedSettings)) {
        throw new UnprocessableEntityError(
            `Invalid settings data: ${JSON.stringify(validateSettings.errors)}`
        );
    }

    const existingSettings = await getSettingsById(settingsId);

    if (!existingSettings) {
        throw new NotFoundError("Settings not found.");
    }

    await putItem(TABLES.SETTINGS, updatedSettings);

    return { ...existingSettings, ...updatedSettings };
};
