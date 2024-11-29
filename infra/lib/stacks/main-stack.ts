import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IApplicationLoadBalancerTarget } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
import { DatabaseConstruct } from "../constructs/database";

export class InfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create database tables
        const database = new DatabaseConstruct(this, "Database");

        // VPC
        const vpc = new ec2.Vpc(this, "OfferingBowlVPC", {
            maxAzs: 2,
            natGateways: 0, // No NAT Gateway to save costs
            subnetConfiguration: [
                {
                    name: "Public",
                    subnetType: ec2.SubnetType.PUBLIC,
                },
            ],
        });

        // S3 bucket for static website
        const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "index.html",
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        // CloudFront distribution
        const distribution = new cloudfront.Distribution(
            this,
            "WebsiteDistribution",
            {
                defaultBehavior: {
                    origin: new origins.S3Origin(websiteBucket),
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                    cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                },
                errorResponses: [
                    {
                        httpStatus: 404,
                        responseHttpStatus: 200,
                        responsePagePath: "/index.html",
                    },
                ],
            }
        );

        // Security Group for EC2
        const apiSecurityGroup = new ec2.SecurityGroup(this, "ApiSecurityGroup", {
            vpc,
            allowAllOutbound: true,
            description: "Security group for API server",
        });

        apiSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            "Allow HTTP traffic"
        );

        // EC2 Role
        const ec2Role = new iam.Role(this, "EC2Role", {
            assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    "AmazonSSMManagedInstanceCore"
                ),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
            ],
        });

        // User data script for EC2 instance
        const userData = ec2.UserData.forLinux();
        userData.addCommands(
            "yum update -y",
            "yum install -y docker",
            "systemctl start docker",
            "systemctl enable docker",
            "usermod -a -G docker ec2-user",
            "curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose",
            "chmod +x /usr/local/bin/docker-compose",
            // Create docker-compose.yml
            "mkdir -p /app",
            "cat > /app/docker-compose.yml << EOL\n" +
            'version: "3.8"\n' +
            "services:\n" +
            "  api1:\n" +
            "    image: ${process.env.ECR_REPO_URI}:latest\n" +
            "    ports:\n" +
            '      - "3000:3000"\n' +
            "    environment:\n" +
            "      - NODE_ENV=production\n" +
            "  api2:\n" +
            "    image: ${process.env.ECR_REPO_URI}:latest\n" +
            "    ports:\n" +
            '      - "3001:3000"\n' +
            "    environment:\n" +
            "      - NODE_ENV=production\n" +
            "EOL",
            "cd /app && docker-compose up -d"
        );

        // EC2 Instance
        const instance: IApplicationLoadBalancerTarget = new ec2.Instance(this, "ApiInstance", {
            vpc,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T2,
                ec2.InstanceSize.MICRO
            ),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            securityGroup: apiSecurityGroup,
            role: ec2Role,
            userData,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        });

        // Application Load Balancer
        const alb = new elbv2.ApplicationLoadBalancer(this, "ApiALB", {
            vpc,
            internetFacing: true,
            securityGroup: apiSecurityGroup,
        });

        // ALB Listener
        const listener = alb.addListener("ApiListener", {
            port: 80,
        });

        // Target Group 1
        const targetGroup1 = new elbv2.ApplicationTargetGroup(
            this,
            "ApiTargetGroup1",
            {
                vpc,
                port: 3000,
                protocol: elbv2.ApplicationProtocolVersion.HTTP,
                healthCheck: {
                    path: "/health",
                    interval: cdk.Duration.seconds(30),
                },
                targetType: elbv2.TargetType.INSTANCE,
            }
        );

        // Target Group 2
        const targetGroup2 = new elbv2.ApplicationTargetGroup(
            this,
            "ApiTargetGroup2",
            {
                vpc,
                port: 3001,
                protocol: elbv2.ApplicationProtocolVersion.HTTP,
                healthCheck: {
                    path: "/health",
                    interval: cdk.Duration.seconds(30),
                },
                targetType: elbv2.TargetType.INSTANCE,
            }
        );

        // Add targets to target groups
        targetGroup1.addTarget(instance);
        targetGroup2.addTarget(instance);

        // Add listener rule for round-robin between containers
        listener.addTargetGroups("DefaultRule", {
            targetGroups: [targetGroup1, targetGroup2],
        });

        // Outputs
        new cdk.CfnOutput(this, "WebsiteURL", {
            value: `https://${distribution.distributionDomainName}`,
        });

        new cdk.CfnOutput(this, "ApiURL", {
            value: alb.loadBalancerDnsName,
        });

        // Grant EC2 instance role access to DynamoDB tables
        database.tables.Users.grantReadWriteData(ec2Role);
        database.tables.Settings.grantReadWriteData(ec2Role);
        database.tables.Users.grantReadWriteData(ec2Role);
        database.tables.Settings.grantReadWriteData(ec2Role);
        database.tables.Profiles.grantReadWriteData(ec2Role);
        database.tables.Activities.grantReadWriteData(ec2Role);
        database.tables.Contracts.grantReadWriteData(ec2Role);
        database.tables.Posts.grantReadWriteData(ec2Role);
        database.tables.Receipts.grantReadWriteData(ec2Role);
        database.tables.Media.grantReadWriteData(ec2Role);
    }
}
