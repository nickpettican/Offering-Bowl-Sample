#!/usr/bin/env node

/**
 * Executable file to create the tables
 * in DynamoDb, to be used only in dev.
 *
 * Make sure that local DynanoDb container
 * is up with the correct version and port:
 *
 * ```bash
 * docker run --rm -d --name dynamodb-local -p $DYNAMODB_PORT:$DYNAMODB_PORT amazon/dynamodb-local:2.5.3
 * ```
 *
 * You should create a credentials profile
 * in ~/.aws/credentials and set the ID and
 * SECRET to something simple like xx.
 * Make sure you're using the same region.
 * Then just run and list tables:
 *
 * ```bash
 * npx ts-node src/aws/execCreateTables.ts
 * aws dynamodb list-tables --endpoint-url "http://localhost:$DYNAMODB_PORT" --region eu-south-2 --profile dynamodb-local
 * ```
 *
 * For production use AWS CloudFormation
 *
 * ```bash
 * aws cloudformation deploy --template-file src/aws/cloud-formation-template.yml --stack-name OfferingBowlTables
 * ```
 *
 * Check the status of the stack:
 *
 * ```bash
 * aws cloudformation describe-stacks --stack-name OfferingBowlDynamoDBTables
 * ```
 */

import dotenv from "dotenv";
import createTables from "../createTables.module";
import logger from "../../src/_utils/logger";

dotenv.config();

// Load environment variables
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

logger.info(`Running createTables with:\n
    - ddbUri: ${DYNAMODB_URI}
    - region: ${REGION}
    - accessKey: ${AWS_ACCESS_KEY_ID}
    - accessSecret: ${AWS_SECRET_ACCESS_KEY}
`);

createTables(REGION, endpoint, credentials);
