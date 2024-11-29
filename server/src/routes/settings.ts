import express from "express";
import {
    createSettingsPost,
    settingsGet,
    settingsUpdate
} from "../controllers/settings.controller";
import {
    fetchUserFromDb,
    restrictToOwner
} from "../_middleware/user.middleware";

const router = express.Router();

// POST create new settings
router.post("/", fetchUserFromDb, restrictToOwner, createSettingsPost);

// GET settings for a user
router.get("/:userId", restrictToOwner, settingsGet);

// UPDATE settings
router.put("/:settingsId", fetchUserFromDb, restrictToOwner, settingsUpdate);

export default router;
