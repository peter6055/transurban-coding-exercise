# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


## Deploying the CDK stack
Notes: The following steps assume you already have AWS CLI & CDK installed and configured with your AWS account.
Please refer to the following link for more information: 
Configure CDK: https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html

cdk bootstrap aws://ACCOUNT-NUMBER/REGION


