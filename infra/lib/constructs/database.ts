import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DatabaseConstruct extends Construct {
    public readonly tables: { [key: string]: dynamodb.Table } = {};

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Users Table
        this.tables.Users = new dynamodb.Table(this, "UsersTable", {
            tableName: "Users",
            partitionKey: {
                name: "userId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        this.tables.Users.addGlobalSecondaryIndex({
            indexName: "role-index",
            partitionKey: { name: "role", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Settings Table
        this.tables.Settings = new dynamodb.Table(this, "SettingsTable", {
            tableName: "Settings",
            partitionKey: {
                name: "settingsId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        this.tables.Settings.addGlobalSecondaryIndex({
            indexName: "userId-index",
            partitionKey: {
                name: "userId",
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Profiles Table
        this.tables.Profiles = new dynamodb.Table(this, "ProfilesTable", {
            tableName: "Profiles",
            partitionKey: {
                name: "profileId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        this.tables.Profiles.addGlobalSecondaryIndex({
            indexName: "userId-index",
            partitionKey: {
                name: "userId",
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Activities Table
        this.tables.Activities = new dynamodb.Table(this, "ActivitiesTable", {
            tableName: "Activities",
            partitionKey: {
                name: "activityId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        this.tables.Activities.addGlobalSecondaryIndex({
            indexName: "userId-index",
            partitionKey: {
                name: "userId",
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Contracts Table
        this.tables.Contracts = new dynamodb.Table(this, "ContractsTable", {
            tableName: "Contracts",
            partitionKey: {
                name: "contractId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        this.tables.Contracts.addGlobalSecondaryIndex({
            indexName: "patronId-monasticId-index",
            partitionKey: {
                name: "patronId",
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: "monasticId",
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Posts Table
        this.tables.Posts = new dynamodb.Table(this, "PostsTable", {
            tableName: "Posts",
            partitionKey: {
                name: "postId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        this.tables.Posts.addGlobalSecondaryIndex({
            indexName: "monasticId-index",
            partitionKey: {
                name: "monasticId",
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        this.tables.Posts.addGlobalSecondaryIndex({
            indexName: "createdAt-index",
            partitionKey: {
                name: "createdAt",
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Receipts Table
        this.tables.Receipts = new dynamodb.Table(this, "ReceiptsTable", {
            tableName: "Receipts",
            partitionKey: {
                name: "receiptId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        this.tables.Receipts.addGlobalSecondaryIndex({
            indexName: "contractId-index",
            partitionKey: {
                name: "contractId",
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Media Table
        this.tables.Media = new dynamodb.Table(this, "MediaTable", {
            tableName: "Media",
            partitionKey: {
                name: "mediaId",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });
    }
}
