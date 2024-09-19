import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {AttributeType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {ApiKey, ApiKeySourceType, Cors, RestApi} from "aws-cdk-lib/aws-apigateway";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";


export class TransurbanCodingExerciseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'TransurbanCodingExerciseQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // create a dynamodb table
    const addressTable = new Table(this, 'address', {
        partitionKey: { name: 'userId', type: AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    // create a lambda function
    const addressLambda = new NodejsFunction(this, 'PostsLambda', {
      entry: 'resources/endpoints/address.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: addressTable.tableName,
      },
    });

    // create an api gateway
    const api = new RestApi(this, 'RestAPI', {
      restApiName: 'RestAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    // create an api key
    const apiKey = api.addApiKey('ApiKey');



  }
}
