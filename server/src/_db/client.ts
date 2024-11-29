import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import envVars from "../_config/env.vars";

// Load environment variables
const NODE_ENV = envVars.NODE_ENV || "production";
const REGION = envVars.AWS_REGION || "eu-south-2";
const DYNAMODB_URI = envVars.DYNAMODB_URI || "";
const DYNAMODB_PORT = envVars.DYNAMODB_PORT || "";
const AWS_ACCESS_KEY_ID = envVars.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = envVars.AWS_SECRET_ACCESS_KEY || "";
const endpoint =
    NODE_ENV === "development"
        ? `${DYNAMODB_URI}:${DYNAMODB_PORT}`
        : DYNAMODB_URI;

// Initialize DynamoDB Client
const config: DynamoDBClientConfig = {
    region: REGION,
    endpoint,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
};
const client = new DynamoDBClient(config);

// Wrap the client to simplify operations (e.g., marshalling)
const dynamoDb = DynamoDBDocumentClient.from(client);

export default dynamoDb;
