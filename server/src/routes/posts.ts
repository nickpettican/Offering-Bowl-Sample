import express from "express";
import {
    createPostPost,
    monasticPostGet,
    monasticPostDelete
} from "../controllers/posts.controller";

const router = express.Router();

// POST create a new post
router.post("/", createPostPost);

// GET posts for a specific monastic
router.get("/:monasticId", monasticPostGet);

// DELETE a post
router.delete("/:postId", monasticPostDelete);

export default router;
