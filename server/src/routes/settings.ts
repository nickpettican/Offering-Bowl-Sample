/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import express, { Request, Response } from "express";
import {
    createSettings,
    getSettingsForUser,
    updateSettings
} from "../models/settings.model";
import { Settings } from "../_db/schemas";
import logger from "../_utils/logger";

const router = express.Router();

// Create new settings (POST /settings)
router.post("/", async (req: Request, res: Response) => {
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
        logger.error("Error creating settings:", error.message);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message
        });
    }
});

// Get settings for a user
router.get("/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const settings = await getSettingsForUser(userId);

        if (!settings) {
            logger.warn("Settings not found for user", userId);
            res.status(404).json({
                success: false,
                message: "Settings not found."
            });
            return;
        }

        res.json({ success: true, settings });
    } catch (error: any) {
        logger.error("Error creating settings:", error.message);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message
        });
    }
});

// Update settings
router.put("/:settingsId", async (req: Request, res: Response) => {
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
        logger.error("Error creating settings:", error.message);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
