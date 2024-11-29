#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/stacks/main-stack";

const app = new cdk.App();
new InfraStack(app, "InfraStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }

    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
