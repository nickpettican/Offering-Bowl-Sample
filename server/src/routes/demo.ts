/**
 * TODO: remove this file and the /demo route
 */

import express from "express";
import { listTablesGet } from "../controllers/demo.controller";

const router = express.Router();

// GET to list all tables
router.get("/list-tables", listTablesGet);

export default router;
