/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    GetCommand,
    PutCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand,
    QueryCommandOutput,
    QueryCommandInput,
    ScanCommandInput,
    ScanCommandOutput
} from "@aws-sdk/lib-dynamodb";
import dynamoDb from "./client";

// Generic function to get an item
export const getItem = async (tableName: string, key: Record<string, any>) => {
    const result = await dynamoDb.send(
        new GetCommand({
            TableName: tableName,
            Key: key
        })
    );
    return result.Item;
};

// Generic function to put an item
export const putItem = async (tableName: string, item: Record<string, any>) => {
    return await dynamoDb.send(
        new PutCommand({
            TableName: tableName,
            Item: item
        })
    );
};

// Generic function to delete an item
export const deleteItem = async (
    tableName: string,
    key: Record<string, any>
) => {
    return await dynamoDb.send(
        new DeleteCommand({
            TableName: tableName,
            Key: key
        })
    );
};

// Generic function to query items
export const queryItems = async (
    tableName: string,
    expression: string,
    values: Record<string, any>,
    optionalParams?: {
        indexName?: string;
        scanIndexForward?: boolean;
        totalSegments?: number;
        limit?: number;
        exclusiveStartKey?: Record<string, any>;
    }
): Promise<QueryCommandOutput> => {
    const params: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: expression,
        ExpressionAttributeValues: values,
        IndexName: optionalParams?.indexName,
        ScanIndexForward: optionalParams?.scanIndexForward,
        Limit: optionalParams?.limit,
        ExclusiveStartKey: optionalParams?.exclusiveStartKey
    };
    const result = await dynamoDb.send(new QueryCommand(params));
    return result;
};

/**
 * Most expensive operation, use wisely
 */
export const scanItems = async (
    tableName: string,
    expression: string,
    values: Record<string, any>,
    optionalParams?: {
        indexName?: string;
        segment?: number;
        totalSegments?: number;
        limit?: number;
        projectionExpression?: string;
        exclusiveStartKey?: Record<string, any>;
    }
): Promise<ScanCommandOutput> => {
    const params: ScanCommandInput = {
        TableName: tableName,
        FilterExpression: expression,
        ExpressionAttributeValues: values,
        IndexName: optionalParams?.indexName,
        Segment: optionalParams?.segment,
        TotalSegments: optionalParams?.totalSegments,
        Limit: optionalParams?.limit,
        ProjectionExpression: optionalParams?.projectionExpression,
        ExclusiveStartKey: optionalParams?.exclusiveStartKey
    };
    const result = await dynamoDb.send(new ScanCommand(params));
    return result;
};
