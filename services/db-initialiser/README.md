# DynamoDb Local Initializer

This service is responsible for initializing the local DynamoDb tables for development. It runs as a separate container during development and ensures all required tables are created before the application starts.

## Features

- Waits for DynamoDb to be ready before creating tables
- Creates all required tables with proper indexes
- Handles existing tables gracefully
- Proper logging and error handling
- Exits after completion to avoid running unnecessarily

## Usage

The service is automatically started through docker-compose and will:

1. Wait for the DynamoDb container to be ready
2. Create all required tables
3. Exit once complete

## Environment Variables

- `AWS_REGION`: The AWS region to use
- `AWS_ACCESS_KEY_ID`: AWS access key (can be dummy value for local)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (can be dummy value for local)
- `DYNAMODB_URI`: URI of local DynamoDb (use http://dynamodb if running with docker compose)
- `DYNAMODB_PORT`: Port number for local DynamoDb

## Table Definitions

Table definitions match the production tables defined in the CDK infrastructure. Any changes to table structures should be made in both:

- `infra/lib/constructs/database.ts` (for production)
- `services/db-initialiser/dynamodb.ts` (for development)

## Troubleshooting

If tables aren't being created:

1. Check the logs: `docker compose logs db-initialiser`
2. Verify DynamoDb is accessible: `docker compose logs dynamodb-local`
3. Ensure environment variables are set correctly
