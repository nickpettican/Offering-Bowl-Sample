import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { setupLocalTables } from "./dynamodb";
import logger from "./logger";

interface Credentials {
    accessKeyId: string;
    secretAccessKey: string;
}

async function main() {
    const NODE_ENV = process.env.NODE_ENV || "production";

    if (NODE_ENV !== "development") return;

    const REGION = process.env.AWS_REGION || "eu-south-2";
    const DYNAMODB_URI = process.env.DYNAMODB_URI || "";
    const DYNAMODB_PORT = process.env.DYNAMODB_PORT || "";
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";

    const endpoint = `${DYNAMODB_URI}:${DYNAMODB_PORT}`;
    const credentials: Credentials = {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
    const config: DynamoDBClientConfig = {
        region: REGION,
        endpoint,
        credentials,
    };

    logger.info(
        `Creating tables with:\n\t- ddbUri: ${DYNAMODB_URI}\n\t- region: ${REGION}\n\t- accessKey: ${AWS_ACCESS_KEY_ID}\n\t- accessSecret: ${AWS_SECRET_ACCESS_KEY}`
    );

    try {
        const result = await setupLocalTables(config);
        logger.info(
            `DynamoDb setup complete with:\n\t- succeeded: ${result?.successCount}\n\t- failed: ${result?.failedCount}`
        );
    } catch (error) {
        logger.error(`Error setting up local DynamoDb tables: ${error}`);
        process.exit(1);
    }
}

main();
