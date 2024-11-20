import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Load environment variables
const REGION = process.env.AWS_REGION || "us-east-1";
const DYNAMODB_URI = process.env.DYNAMODB_URI || undefined;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";

const isLocal = process.env.DYNAMODB_LOCAL === "true";

// Initialize DynamoDB Client
const config: DynamoDBClientConfig = {
    region: REGION,
    endpoint: isLocal ? "http://dynamodb:8000" : DYNAMODB_URI,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
};
const client = new DynamoDBClient(config);

// Wrap the client to simplify operations (e.g., marshalling)
const dynamoDb = DynamoDBDocumentClient.from(client);

export default dynamoDb;
