import express from "express";
import {
    createSettingsPost,
    settingsGet,
    settingsUpdate
} from "../controllers/settings.controller";

const router = express.Router();

// POST create new settings
router.post("/", createSettingsPost);

// GET settings for a user
router.get("/:userId", settingsGet);

// UPDATE settings
router.put("/:settingsId", settingsUpdate);

export default router;
