import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {AttributeType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {ApiKeySourceType, Cors, LambdaIntegration, RestApi, UsagePlan} from "aws-cdk-lib/aws-apigateway";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {CfnOutput} from "aws-cdk-lib";


export class TransurbanCodingExerciseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a dynamodb table
    const addressTable = new Table(this, 'address', {
        partitionKey: { name: 'userId', type: AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    // create an api gateway
    const api = new RestApi(this, 'RestAPI', {
      restApiName: 'TransurbanCodingExerciseAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    // create a usage plan
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'Usage Plan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        }
      ],
    });

    // create an api key for testing purposes
    const apiKey = api.addApiKey('ApiKey');
    plan.addApiKey(apiKey);



    // create a lambda function
    const addressLambda = new NodejsFunction(this, 'addressLambda', {
      entry: 'resources/endpoints/address.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: addressTable.tableName,
      },
    });
    addressTable.grantReadWriteData(addressLambda);


    // create the api gateway resources and attach it to the lambda function
    const posts = api.root.addResource('address');

    posts.addResource('create').addMethod('POST', new LambdaIntegration(addressLambda), {
      apiKeyRequired: true,
    });

    posts.addResource('find').addMethod('POST', new LambdaIntegration(addressLambda), {
      apiKeyRequired: true,
    });



    // output api key
    new CfnOutput(this, 'API Key ID', {
      value: apiKey.keyId,
    });


  }
}
