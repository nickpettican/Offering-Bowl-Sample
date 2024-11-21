/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

/**
 * TODO: remove this file and the /demo route
 */

import express, { Request, Response } from "express";
import logger from "../_utils/logger";
import dynamoDb from "../_db/client";
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";

import createTables from "../../aws/createTables.module";

const router = express.Router();

// Route to create tables
router.post("/create-tables", async (req: Request, res: Response) => {
    try {
        const REGION = process.env.AWS_REGION || "eu-south-2";
        const DYNAMODB_URI = process.env.DYNAMODB_URI || undefined;
        const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
        const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";

        const isLocal = process.env.DYNAMODB_LOCAL === "true";
        const endpoint = isLocal ? "http://dynamodb:8000" : DYNAMODB_URI;
        const credentials = {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        };
        const result = await createTables(REGION, endpoint, credentials);
        res.json({
            success: true,
            result
        });
    } catch (error: any) {
        logger.error("Error creating tables:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route to list all tables
router.get("/list-tables", async (req: Request, res: Response) => {
    try {
        // Call DynamoDB to list tables
        const result = await dynamoDb.send(new ListTablesCommand({}));
        res.json({
            success: true,
            tables: result.TableNames || []
        });
    } catch (error: any) {
        logger.error("Error listing tables:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
