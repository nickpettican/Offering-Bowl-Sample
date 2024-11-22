/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

/**
 * TODO: remove this file and the /demo route
 */

import express from "express";
import { createTablesPost, listTablesGet } from "../controllers/demo.controller";

const router = express.Router();

// POST to create tables
router.post("/create-tables", createTablesPost);

// GET to list all tables
router.get("/list-tables", listTablesGet);

export default router;
