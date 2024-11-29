/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

/**
 * TODO: remove this file and the /demo route
 */

import { Request, Response } from "express";
import logger from "../_utils/logger";
import dynamoDb from "../_db/client";
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";

// List all tables
export const listTablesGet = async (req: Request, res: Response) => {
    try {
        // Call DynamoDB to list tables
        const result = await dynamoDb.send(new ListTablesCommand({}));
        res.json({
            success: true,
            tables: result.TableNames || []
        });
    } catch (error: any) {
        logger.error(`Error listing tables: ${error.message || error}`);
        res.status(500).json({
            success: false,
            error: error.message ?? error ?? error
        });
    }
};
