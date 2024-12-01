#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { InfraStack } from "../lib/stacks/main-stack";

const app = new cdk.App();

// Development/Staging stack
new InfraStack(app, "StagingStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    },
    stagingConfig: {
        removalPolicy: cdk.RemovalPolicy.DESTROY, // For easy cleanup
        instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T2,
            ec2.InstanceSize.MICRO
        )
    }
});

// Production stack
new InfraStack(app, "ProductionStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: "us-east-1"
    },
    productionConfig: {
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T2,
            ec2.InstanceSize.MICRO
        )
    }
});
