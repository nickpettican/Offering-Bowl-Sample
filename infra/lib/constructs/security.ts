import * as waf from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

export class SecurityConstruct extends Construct {
    public readonly webAcl: waf.CfnWebACL;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create WAF ACL with basic rules
        this.webAcl = new waf.CfnWebACL(this, "WebAcl", {
            defaultAction: { allow: {} },
            scope: "CLOUDFRONT", // We'll create a separate regional one for ALB
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: "WebACLMetrics",
                sampledRequestsEnabled: true
            },
            rules: [
                // Rate limiting rule
                {
                    name: "RateLimit",
                    priority: 1,
                    statement: {
                        rateBasedStatement: {
                            limit: 2000,
                            aggregateKeyType: "IP"
                        }
                    },
                    action: { block: {} },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: "RateLimitMetric",
                        sampledRequestsEnabled: true
                    }
                },
                // AWS Managed Rules
                {
                    name: "AWSManagedRulesCommonRuleSet",
                    priority: 2,
                    statement: {
                        managedRuleGroupStatement: {
                            name: "AWSManagedRulesCommonRuleSet",
                            vendorName: "AWS"
                        }
                    },
                    overrideAction: { none: {} },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: "AWSManagedRulesCommonRuleSetMetric",
                        sampledRequestsEnabled: true
                    }
                }
            ]
        });

        // Create Regional WAF ACL for ALB
        const regionalWebAcl = new waf.CfnWebACL(this, "RegionalWebAcl", {
            defaultAction: { allow: {} },
            scope: "REGIONAL",
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: "RegionalWebACLMetrics",
                sampledRequestsEnabled: true
            },
            rules: [
                // Similar rules but for regional WAF
                {
                    name: "RegionalRateLimit",
                    priority: 1,
                    statement: {
                        rateBasedStatement: {
                            limit: 2000,
                            aggregateKeyType: "IP"
                        }
                    },
                    action: { block: {} },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: "RegionalRateLimitMetric",
                        sampledRequestsEnabled: true
                    }
                }
            ]
        });
    }
}
