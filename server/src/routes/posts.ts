/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import express from "express";
import { createPostPost, monasticPostGet, monasticPostDelete } from "../controllers/posts.controller";

const router = express.Router();

// POST create a new post
router.post("/", createPostPost);

// GET posts for a specific monastic
router.get("/:monasticId", monasticPostGet);

// DELETE a post
router.delete("/:postId", monasticPostDelete);

export default router;
