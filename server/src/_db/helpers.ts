/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    GetCommand,
    PutCommand,
    DeleteCommand,
    QueryCommand
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
    indexName?: string
) => {
    const result = await dynamoDb.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: expression,
            ExpressionAttributeValues: values,
            IndexName: indexName
        })
    );
    return result.Items;
};
