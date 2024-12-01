# Infrastructure Setup

This directory contains the AWS CDK infrastructure code for the Offering Bowl platform. The infrastructure is designed to be cost-effective while maintaining scalability, using AWS free tier resources where possible.

## Architecture Overview

This is the current architecture for stage 1 (prototype).

- **Frontend**: Served from S3 through CloudFront (static website hosting)
- **Backend**: Single t2.micro EC2 instance running two Docker containers for the API
- **Database**: DynamoDB tables with on-demand pricing
- **Load Balancing**: Application Load Balancer (free tier eligible)

## Directory Structure

```
infra/
├── bin/
│   └── app.ts           # CDK app entry point
├── lib/
│   ├── constructs/
│   │   └── database.ts  # DynamoDB tables construct
│   └── stacks/
│       └── main-stack.ts # Main infrastructure stack
└── README.md
```

## Development Setup

### Prerequisites

1. AWS CLI installed and configured
2. Node.js and npm installed
3. AWS CDK CLI installed (`npm install -g aws-cdk`)
4. Docker installed for local development

### Database Tables

The following DynamoDB tables are defined in `constructs/database.ts`:

- Users (with role-index GSI)
- Settings (with userId-index GSI)
- Profile (with userId-index GSI)
- Activities (with userId-index GSI)
- Contracts (with patronId-monasticId-index GSI)
- Posts (with monasticId-index GSI)
- Receipts (with contractId-index GSI)
- Media

## Testing and Staging

### Development/Testing Workflow

You can safely deploy and tear down the infrastructure for testing:

1. Deploy staging environment:

```bash
cdk deploy StagingStack
```

2. Test the infrastructure

3. Tear down when done:

```bash
cdk destroy StagingStack
```

### Environment Management

The infrastructure supports multiple environments:

- **Staging**: For testing infrastructure changes

    - Uses `RemovalPolicy.DESTROY` for easy cleanup
    - Same setup as production but allows easy teardown
    - Perfect for testing autoscaling configurations

- **Production**: Live environment

    - Uses `RemovalPolicy.RETAIN` for data protection
    - More restricted security settings
    - Changes require careful planning

### Scaling Scenarios

The infrastructure is designed to evolve with your needs:

1. **Initial Setup** (Current)

    - Single t2.micro EC2 instance
    - Two Docker containers with ALB
    - Perfect for prototype/MVP phase

2. **Autoscaling Ready**

    - When high usage notifications arrive:
    - Infrastructure code for autoscaling is prepared
    - Can switch from single EC2 to autoscaling group
    - Allows testing autoscaling in staging first

### Migration Process

When ready to implement autoscaling:

1. Test in staging:

    - Deploy autoscaling configuration
    - Verify scaling behaviors
    - Test monitoring and alerts
    - Practice rollback procedures

2. Production migration:

    - Take snapshot of production EC2 for AMI
    - Deploy autoscaling infrastructure
    - Gradually move traffic over
    - Maintain single EC2 until migration complete

### Monitoring and Alerts

The infrastructure includes CloudWatch alarms for:

- CPU Usage (>80% threshold)
- Request Count (>1000/minute threshold)
- Notifications sent to configured email addresses

This helps identify when to consider scaling up the infrastructure.

Remember to accept the initial SNS subscription email to receive alerts.

## Deployment

### First Time Setup

1. Install dependencies:

```bash
cd infra
npm install
```

2. Bootstrap CDK (first time only):

```bash
cdk bootstrap
```

### Deploying to Production

Deploy the entire stack:

```bash
cdk deploy
```

This will:

1. Create/update all DynamoDB tables
2. Set up the EC2 instance with Docker
3. Configure the Application Load Balancer
4. Set up S3 and CloudFront for the frontend

### Cost Optimization

The infrastructure is designed to use AWS free tier resources:

- EC2: t2.micro instance (750 hours/month free for 12 months)
- Application Load Balancer (750 hours/month free for 12 months)
- DynamoDB: On-demand pricing (minimal costs for low traffic)
- S3/CloudFront: Pay as you go (minimal for small applications)

### Future Scaling

When ready to scale beyond free tier:

1. Migrate to ECS for better container orchestration
2. Add auto-scaling groups for EC2 instances
3. Implement CloudWatch alarms for scaling triggers

## Troubleshooting

### Common Issues

1. DynamoDB Tables not creating locally:

    - Check Docker logs: `docker compose logs dynamodb-local`
    - Verify port mappings in docker-compose.yml

2. EC2 instance not starting:

    - Check instance logs in AWS Console
    - Verify security group settings

### Useful Commands

```bash
# List deployed stacks
cdk ls

# Compare deployed stack with current state
cdk diff

# Destroy stack (careful in production!)
cdk destroy

# Check DynamoDB tables locally
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

#### Other useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## Security

- EC2 instance role has minimal required permissions
- DynamoDB tables use encryption at rest
- CloudFront uses HTTPS only
- Security groups restrict access appropriately

## Contributing

1. Create a feature branch
2. Make infrastructure changes
3. Run `cdk diff` to verify changes
4. Submit a pull request

For significant infrastructure changes, please update this README and provide context in the PR.
