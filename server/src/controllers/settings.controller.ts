/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { Request, Response } from "express";
import {
    createSettings,
    getSettingsForUser,
    updateSettings
} from "../models/settings.model";
import { Settings } from "../_db/schemas";
import logger from "../_utils/logger";

// Create new settings (POST /settings)
export const createSettingsPost = async (req: Request, res: Response) => {
    try {
        const settings: Settings = req.body;

        // Call the model function to create a user
        await createSettings(settings);

        res.status(201).json({
            success: true,
            message: "Settings created successfully.",
            settings
        });
    } catch (error: any) {
        logger.error(`Error creating settings: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

// Get settings for a user
export const settingsGet = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const settings = await getSettingsForUser(userId);

        if (!settings?.length) {
            logger.warn(`Settings not found for user ${userId}`);
            res.status(404).json({
                success: false,
                message: "Settings not found."
            });
            return;
        }

        res.json({ success: true, settings: settings[0] });
    } catch (error: any) {
        logger.error(`Error getting settings: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

// Update settings
export const settingsUpdate = async (req: Request, res: Response) => {
    try {
        const { settingsId } = req.params;
        const updates: Settings = req.body;

        const updatedSettings = await updateSettings(settingsId, updates);

        res.json({
            success: true,
            message: "Settings updated successfully.",
            settings: updatedSettings
        });
    } catch (error: any) {
        logger.error(`Error updating settings: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};
