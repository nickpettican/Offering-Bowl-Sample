import {
    DynamoDBClient,
    CreateTableCommand,
    CreateTableCommandInput,
    DynamoDBClientConfig
} from "@aws-sdk/client-dynamodb";
import logger from "./logger";

export const setupLocalTables = async (config: DynamoDBClientConfig) => {
    const client = new DynamoDBClient(config);

    let successCount = 0;
    let failedCount = 0;

    const tables: CreateTableCommandInput[] = [
        {
            TableName: "Users",
            KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "userId", AttributeType: "S" },
                { AttributeName: "role", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "role-index",
                    KeySchema: [{ AttributeName: "role", KeyType: "HASH" }],
                    Projection: { ProjectionType: "ALL" }
                }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: "Settings",
            KeySchema: [{ AttributeName: "settingsId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "settingsId", AttributeType: "S" },
                { AttributeName: "userId", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "userId-index",
                    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
                    Projection: { ProjectionType: "ALL" }
                }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: "Profiles",
            KeySchema: [{ AttributeName: "profileId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "profileId", AttributeType: "S" },
                { AttributeName: "userId", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "userId-index",
                    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
                    Projection: { ProjectionType: "ALL" }
                }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: "Activities",
            KeySchema: [{ AttributeName: "activityId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "activityId", AttributeType: "S" },
                { AttributeName: "userId", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "userId-index",
                    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
                    Projection: { ProjectionType: "ALL" }
                }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: "Contracts",
            KeySchema: [{ AttributeName: "contractId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "contractId", AttributeType: "S" },
                { AttributeName: "patronId", AttributeType: "S" },
                { AttributeName: "monasticId", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "patronId-monasticId-index",
                    KeySchema: [
                        { AttributeName: "patronId", KeyType: "HASH" },
                        { AttributeName: "monasticId", KeyType: "RANGE" }
                    ],
                    Projection: { ProjectionType: "ALL" }
                }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: "Posts",
            KeySchema: [{ AttributeName: "postId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "postId", AttributeType: "S" },
                { AttributeName: "monasticId", AttributeType: "S" },
                { AttributeName: "createdAt", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "monasticId-index",
                    KeySchema: [
                        { AttributeName: "monasticId", KeyType: "HASH" }
                    ],
                    Projection: { ProjectionType: "ALL" }
                },
                {
                    IndexName: "createdAt-index",
                    KeySchema: [
                        { AttributeName: "createdAt", KeyType: "HASH" }
                    ],
                    Projection: { ProjectionType: "ALL" }
                }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: "Receipts",
            KeySchema: [{ AttributeName: "receiptId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "receiptId", AttributeType: "S" },
                { AttributeName: "contractId", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "contractId-index",
                    KeySchema: [
                        { AttributeName: "contractId", KeyType: "HASH" }
                    ],
                    Projection: { ProjectionType: "ALL" }
                }
            ],
            BillingMode: "PAY_PER_REQUEST"
        },
        {
            TableName: "Media",
            KeySchema: [{ AttributeName: "mediaId", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "mediaId", AttributeType: "S" }
            ],
            BillingMode: "PAY_PER_REQUEST"
        }
    ];

    for (const tableDefinition of tables) {
        try {
            const command = new CreateTableCommand(tableDefinition);
            const result = await client.send(command);
            logger.info(
                `Created table ${tableDefinition.TableName}`,
                result.TableDescription?.CreationDateTime
            );
            successCount++;
        } catch (error: any) {
            if (error.name === "ResourceInUseException") {
                logger.info(
                    `Table ${tableDefinition.TableName} already exists.`
                );
            } else {
                logger.error(
                    `Error creating table ${tableDefinition.TableName}: ${error.message ?? error}`
                );
            }
            failedCount++;
        }
    }

    return { successCount, failedCount };
};
