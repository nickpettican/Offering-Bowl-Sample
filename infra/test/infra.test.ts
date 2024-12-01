import { describe, test, beforeEach } from "@jest/globals";
import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { InfraStack } from "../lib/stacks/main-stack";

describe("InfraStack", () => {
    let app: cdk.App;
    let stack: InfraStack;
    let template: Template;

    beforeEach(() => {
        app = new cdk.App();
        stack = new InfraStack(app, "TestStack", {
            env: { account: "123456789012", region: "us-east-1" }
        });
        template = Template.fromStack(stack);
    });

    test("VPC is created with correct configuration", () => {
        template.hasResourceProperties("AWS::EC2::VPC", {
            EnableDnsHostnames: true,
            EnableDnsSupport: true,
            CidrBlock: Match.anyValue()
        });

        // Check for 2 public and 2 private subnets (one per AZ)
        template.resourceCountIs("AWS::EC2::Subnet", 4);

        // Check for NAT Gateway
        template.resourceCountIs("AWS::EC2::NatGateway", 1);
    });

    test("S3 buckets are created with correct configuration", () => {
        // Website bucket
        template.hasResourceProperties("AWS::S3::Bucket", {
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true
            },
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                    {
                        ServerSideEncryptionByDefault: {
                            SSEAlgorithm: "AES256"
                        }
                    }
                ]
            }
        });

        // Media storage bucket with CORS
        template.hasResourceProperties("AWS::S3::Bucket", {
            CorsConfiguration: {
                CorsRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["GET", "PUT", "POST"],
                        AllowedOrigins: ["*"]
                    }
                ]
            }
        });
    });

    test("EC2 instance is created in private subnet with correct configuration", () => {
        template.hasResourceProperties("AWS::EC2::Instance", {
            InstanceType: "t2.micro",
            SecurityGroupIds: Match.anyValue()
        });
    });

    test("Application Load Balancer is created with correct configuration", () => {
        template.hasResourceProperties(
            "AWS::ElasticLoadBalancingV2::LoadBalancer",
            {
                Scheme: "internet-facing",
                Type: "application"
            }
        );

        // Check for HTTPS listener
        template.hasResourceProperties(
            "AWS::ElasticLoadBalancingV2::Listener",
            {
                Protocol: "HTTPS",
                Port: 443
            }
        );

        // Check for HTTP to HTTPS redirect
        template.hasResourceProperties(
            "AWS::ElasticLoadBalancingV2::Listener",
            {
                Protocol: "HTTP",
                Port: 80,
                DefaultActions: [
                    {
                        Type: "redirect",
                        RedirectConfig: {
                            Protocol: "HTTPS",
                            Port: "443",
                            StatusCode: "HTTP_301"
                        }
                    }
                ]
            }
        );
    });

    test("Target groups are created with correct configuration", () => {
        template.resourceCountIs("AWS::ElasticLoadBalancingV2::TargetGroup", 2);

        template.hasResourceProperties(
            "AWS::ElasticLoadBalancingV2::TargetGroup",
            Match.objectLike({
                Port: 3000,
                Protocol: "HTTP",
                HealthCheckPath: "/health",
                TargetType: "instance"
            })
        );

        template.hasResourceProperties(
            "AWS::ElasticLoadBalancingV2::TargetGroup",
            Match.objectLike({
                Port: 3001,
                Protocol: "HTTP",
                HealthCheckPath: "/health",
                TargetType: "instance"
            })
        );
    });

    test("Security Groups are created with correct rules", () => {
        // ALB Security Group
        template.hasResourceProperties("AWS::EC2::SecurityGroup", {
            SecurityGroupIngress: Match.arrayWith([
                Match.objectLike({
                    CidrIp: "0.0.0.0/0",
                    FromPort: 443,
                    IpProtocol: "tcp",
                    ToPort: 443
                }),
                Match.objectLike({
                    CidrIp: "0.0.0.0/0",
                    FromPort: 80,
                    IpProtocol: "tcp",
                    ToPort: 80
                })
            ])
        });
    });

    test("CloudWatch Alarms are created with correct thresholds", () => {
        template.hasResourceProperties("AWS::CloudWatch::Alarm", {
            Threshold: 80,
            ComparisonOperator: "GreaterThanThreshold",
            EvaluationPeriods: 3,
            DatapointsToAlarm: 2,
            MetricName: "CPUUtilization",
            Namespace: "AWS/EC2"
        });

        template.hasResourceProperties("AWS::CloudWatch::Alarm", {
            Threshold: 1000,
            ComparisonOperator: "GreaterThanThreshold",
            EvaluationPeriods: 3,
            DatapointsToAlarm: 2,
            MetricName: "RequestCount",
            Namespace: "AWS/ApplicationELB"
        });
    });

    test("WAF is associated with both CloudFront and ALB", () => {
        template.resourceCountIs("AWS::WAFv2::WebACLAssociation", 2);
    });
});
