import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

export interface DnsCdnConstructProps {
    websiteBucket: s3.IBucket;
    mediaStorageBucket: s3.IBucket;
    loadBalancer: elbv2.IApplicationLoadBalancer;
}

export class DnsCdnConstruct extends Construct {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: DnsCdnConstructProps) {
        super(scope, id);

        // Create SSL certificate for CloudFront
        // Note: You'll need to validate domain ownership through DNS validation manually in Dynadot
        const certificate = new acm.Certificate(this, "Certificate", {
            domainName: "offeringbowl.org",
            subjectAlternativeNames: [
                "*.offeringbowl.org",
                "cuencodeofrendas.org",
                "*.cuencodeofrendas.org"
            ],
            validation: acm.CertificateValidation.fromEmail() // Email validation since we can't use DNS validation
        });

        // Create CloudFront distribution
        this.distribution = new cloudfront.Distribution(
            this,
            "WebsiteDistribution",
            {
                defaultBehavior: {
                    origin: new s3origins.S3StaticWebsiteOrigin(
                        props.websiteBucket
                    ),
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                    cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD
                },
                additionalBehaviors: {
                    "/media/*": {
                        origin: new s3origins.HttpOrigin(
                            props.mediaStorageBucket.bucketRegionalDomainName
                        ),
                        viewerProtocolPolicy:
                            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
                    }
                },
                certificate: certificate,
                domainNames: [
                    "offeringbowl.org",
                    "www.offeringbowl.org",
                    "cuencodeofrendas.org",
                    "www.cuencodeofrendas.org"
                ]
            }
        );

        // Output the CloudFront and ALB domain names to configure in Dynadot
        new cdk.CfnOutput(this, "CloudFrontDomain", {
            value: this.distribution.distributionDomainName,
            description:
                "CloudFront domain name - Configure CNAME/ALIAS records in Dynadot for: offeringbowl.org, www.offeringbowl.org, cuencodeofrendas.org, www.cuencodeofrendas.org"
        });

        new cdk.CfnOutput(this, "LoadBalancerDomain", {
            value: props.loadBalancer.loadBalancerDnsName,
            description:
                "Load balancer domain name - Configure CNAME/ALIAS record in Dynadot for: api.offeringbowl.org"
        });
    }
}
