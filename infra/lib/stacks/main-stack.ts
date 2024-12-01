import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as targets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as waf from "aws-cdk-lib/aws-wafv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { DatabaseConstruct } from "../constructs/database";
import { SecurityConstruct } from "../constructs/security";
import { DnsCdnConstruct } from "../constructs/dns-cdn";

export class InfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create security construct
        const security = new SecurityConstruct(this, "Security");

        // Create database tables
        const database = new DatabaseConstruct(this, "Database");

        // EC2 Role with enhanced permissions
        const ec2Role = new iam.Role(this, "EC2Role", {
            assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    "AmazonSSMManagedInstanceCore"
                ),
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    "CloudWatchAgentServerPolicy"
                )
            ]
        });

        // Grant EC2 instance role access to DynamoDB tables
        database.tables.Users.grantReadWriteData(ec2Role);
        database.tables.Settings.grantReadWriteData(ec2Role);
        database.tables.Users.grantReadWriteData(ec2Role);
        database.tables.Settings.grantReadWriteData(ec2Role);
        database.tables.Profiles.grantReadWriteData(ec2Role);
        // TODO split profiles into two tables (see server/)
        database.tables.Activities.grantReadWriteData(ec2Role);
        database.tables.Contracts.grantReadWriteData(ec2Role);
        database.tables.Posts.grantReadWriteData(ec2Role);
        database.tables.Receipts.grantReadWriteData(ec2Role);
        database.tables.Media.grantReadWriteData(ec2Role);

        // VPC with proper networking
        const vpc = new ec2.Vpc(this, "OfferingBowlVPC", {
            maxAzs: 2,
            natGateways: 1, // Add NAT Gateway for private subnets
            subnetConfiguration: [
                {
                    name: "Public",
                    subnetType: ec2.SubnetType.PUBLIC
                },
                {
                    name: "Private",
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
                }
            ]
        });

        // S3 buckets
        const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            encryption: s3.BucketEncryption.S3_MANAGED
        });

        const mediaStorageBucket = new s3.Bucket(this, "MediaStorageBucket", {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            encryption: s3.BucketEncryption.S3_MANAGED,
            cors: [
                {
                    allowedMethods: [
                        s3.HttpMethods.GET,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST
                    ],
                    allowedOrigins: ["*"], // You should restrict this in production
                    allowedHeaders: ["*"]
                }
            ]
        });

        // Grant S3 access to EC2
        mediaStorageBucket.grantReadWrite(ec2Role);
        websiteBucket.grantRead(ec2Role);

        // CloudFront distribution
        const distribution = new cloudfront.Distribution(
            this,
            "WebsiteDistribution",
            {
                defaultBehavior: {
                    origin: new s3origins.S3StaticWebsiteOrigin(websiteBucket),
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                    cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD
                },
                errorResponses: [
                    {
                        httpStatus: 404,
                        responseHttpStatus: 200,
                        responsePagePath: "/index.html"
                    }
                ]
            }
        );

        // Security Group for ALB
        const albSecurityGroup = new ec2.SecurityGroup(
            this,
            "AlbSecurityGroup",
            {
                vpc,
                allowAllOutbound: true,
                description: "Security group for Application Load Balancer"
            }
        );

        // Allow inbound HTTPS and HTTP (HTTP will be redirected to HTTPS)
        albSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            "Allow HTTPS traffic"
        );
        albSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            "Allow HTTP traffic"
        );

        // Security Group for EC2
        const apiSecurityGroup = new ec2.SecurityGroup(
            this,
            "ApiSecurityGroup",
            {
                vpc,
                allowAllOutbound: true,
                description: "Security group for API server"
            }
        );

        // Only allow traffic from ALB to EC2
        apiSecurityGroup.addIngressRule(
            ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
            ec2.Port.tcp(3000),
            "Allow traffic from ALB to API1"
        );
        apiSecurityGroup.addIngressRule(
            ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
            ec2.Port.tcp(3001),
            "Allow traffic from ALB to API2"
        );

        // Create ACM certificate for ALB
        const albCertificate = new acm.Certificate(this, "AlbCertificate", {
            domainName: "api.offeringbowl.org",
            validation: acm.CertificateValidation.fromEmail()
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

        // -----------------------------------

        // EC2 Instance in private subnet
        const ec2Instance = new ec2.Instance(this, "ApiInstance", {
            vpc,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T2,
                ec2.InstanceSize.MICRO
            ),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            securityGroup: apiSecurityGroup,
            role: ec2Role,
            userData,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS // Changed to private subnet
            }
        });

        // Create instance target
        const instance = new targets.InstanceTarget(ec2Instance);

        // TODO: Replace the single EC2 instance with an Auto Scaling Group
        /*
        const asg = new autoscaling.AutoScalingGroup(
            this,
            "ApiAutoScalingGroup",
            {
                vpc,
                instanceType: ec2.InstanceType.of(
                    ec2.InstanceClass.T2,
                    ec2.InstanceSize.MICRO
                ),
                machineImage: new ec2.AmazonLinuxImage({
                    generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
                }),
                securityGroup: apiSecurityGroup,
                role: ec2Role,
                userData,
                vpcSubnets: {
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
                },
                // Auto scaling settings
                minCapacity: 1, // Always keep at least one instance running
                maxCapacity: 2, // Never scale beyond two instances
                desiredCapacity: 1, // Start with one instance

                // Health check settings
                healthCheck: autoscaling.HealthCheck.elb({
                    grace: cdk.Duration.seconds(60)
                })
            }
        );

        // Add scaling policies based on CPU utilization
        asg.scaleOnCpuUtilization("CpuScaling", {
            targetUtilizationPercent: 80, // Scale when CPU hits 80%
            cooldown: cdk.Duration.minutes(5) // Wait 5 minutes between scaling actions
        });

        // Optional: Add scaling based on ALB request count
        asg.scaleOnRequestCount("RequestScaling", {
            targetRequestsPerMinute: 1000, // Scale when requests exceed this number
            cooldown: cdk.Duration.minutes(5)
        });
        */

        // -----------------------------------

        // Application Load Balancer
        const alb = new elbv2.ApplicationLoadBalancer(this, "ApiALB", {
            vpc,
            internetFacing: true,
            securityGroup: albSecurityGroup // Use ALB security group
        });

        // HTTPS Listener
        const httpsListener = alb.addListener("HttpsListener", {
            port: 443,
            certificates: [albCertificate],
            protocol: elbv2.ApplicationProtocol.HTTPS
        });

        // HTTP Listener that redirects to HTTPS
        const httpListener = alb.addListener("HttpListener", {
            port: 80,
            defaultAction: elbv2.ListenerAction.redirect({
                protocol: "HTTPS",
                port: "443",
                permanent: true
            })
        });

        // Target Groups remain the same
        const targetGroup1 = new elbv2.ApplicationTargetGroup(
            this,
            "ApiTargetGroup1",
            {
                vpc,
                port: 3000,
                protocol: elbv2.ApplicationProtocol.HTTP,
                healthCheck: {
                    path: "/health",
                    interval: cdk.Duration.seconds(30)
                },
                targetType: elbv2.TargetType.INSTANCE
            }
        );

        const targetGroup2 = new elbv2.ApplicationTargetGroup(
            this,
            "ApiTargetGroup2",
            {
                vpc,
                port: 3001,
                protocol: elbv2.ApplicationProtocol.HTTP,
                healthCheck: {
                    path: "/health",
                    interval: cdk.Duration.seconds(30)
                },
                targetType: elbv2.TargetType.INSTANCE
            }
        );

        // -----------------------------------

        // TODO: Add targets to target groups using ASG instead of single instance
        /*
        targetGroup1.addTarget(asg);
        targetGroup2.addTarget(asg);
        */

        // Add targets to target groups
        targetGroup1.addTarget(instance);
        targetGroup2.addTarget(instance);

        // -----------------------------------

        // Add listener rule for round-robin between containers to HTTPS listener
        httpsListener.addTargetGroups("DefaultRule", {
            targetGroups: [targetGroup1, targetGroup2]
        });

        // Outputs
        new cdk.CfnOutput(this, "WebsiteURL", {
            value: `https://${distribution.distributionDomainName}`
        });

        new cdk.CfnOutput(this, "ApiURL", {
            value: alb.loadBalancerDnsName
        });

        // Create DNS and CDN construct
        const dnsAndCdn = new DnsCdnConstruct(this, "DnsAndCdn", {
            websiteBucket,
            mediaStorageBucket,
            loadBalancer: alb
        });

        // WAF for CloudFront
        new waf.CfnWebACLAssociation(this, "CloudFrontWafAssociation", {
            resourceArn: `arn:aws:cloudfront::${this.account}:distribution/${dnsAndCdn.distribution.distributionId}`,
            webAclArn: security.webAcl.attrArn
        });

        // WAF for ALB
        new waf.CfnWebACLAssociation(this, "AlbWafAssociation", {
            resourceArn: alb.loadBalancerArn,
            webAclArn: security.webAcl.attrArn
        });

        // Create SNS topic for alarms
        const alarmsTopic = new sns.Topic(this, "AlarmsTopic", {
            displayName: "Server Alarms"
        });

        // Add notification action to both alarms
        alarmsTopic.addSubscription(
            new subscriptions.EmailSubscription("info@offeringbowl.org")
        );

        // CPU Usage Alarm
        new cloudwatch.Alarm(this, "CpuUsageAlarm", {
            metric: new cloudwatch.Metric({
                namespace: "AWS/EC2",
                metricName: "CPUUtilization",
                dimensionsMap: {
                    InstanceId: ec2Instance.instanceId
                },
                period: cdk.Duration.minutes(5),
                statistic: "Average"
            }),
            threshold: 80,
            evaluationPeriods: 3,
            datapointsToAlarm: 2,
            alarmDescription: "CPU usage is over 80%",
            actionsEnabled: true,
            comparisonOperator:
                cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
        });

        // ALB Request Count Alarm
        new cloudwatch.Alarm(this, "RequestCountAlarm", {
            metric: new cloudwatch.Metric({
                namespace: "AWS/ApplicationELB",
                metricName: "RequestCount",
                dimensionsMap: {
                    LoadBalancer: alb.loadBalancerFullName
                },
                period: cdk.Duration.minutes(5),
                statistic: "Sum"
            }),
            threshold: 1000,
            evaluationPeriods: 3,
            datapointsToAlarm: 2,
            alarmDescription: "Request count exceeds 1000 per minute",
            actionsEnabled: true,
            comparisonOperator:
                cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
        });
    }
}
