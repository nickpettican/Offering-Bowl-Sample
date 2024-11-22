/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import express from "express";
import { createUserPost, userGet, userUpdate } from "../controllers/users.controller";

const router = express.Router();

// POST create a new user
router.post("/", createUserPost);

// GET a user by ID
router.get("/:userId", userGet);

// UPDATE a user
router.put("/:userId", userUpdate);

export default router;
