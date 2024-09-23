import * as cdk from 'aws-cdk-lib';
import {CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {AttributeType, TableV2} from 'aws-cdk-lib/aws-dynamodb';
import {
    ApiKeySourceType,
    Cors,
    LambdaIntegration,
    RestApi,
    UsagePlan,
    IApiKey,
    Resource
} from "aws-cdk-lib/aws-apigateway";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import {BuildState} from "../types";


export class TransurbanCodingExerciseStack extends cdk.Stack {
    apiEndpointOutput: string;
    tableNameOutput: string;

    constructor(scope: Construct, id: string, props?: cdk.StackProps, buildState?: BuildState) {
        super(scope, id, props);

        // define the build state to avoid name conflict
        let buildString: string = "";
        if (buildState === BuildState.PROD) {
            buildString = 'PROD_';
        } else if (buildState === BuildState.TEST) {
            buildString = 'TEST_';
        }


        // create a dynamodb table
        const addressTable: TableV2 = new TableV2(this, buildString + 'TU_DDB_Table_Address', {
            tableName: buildString + 'TU_DDB_Table_Address',
            partitionKey: {name: 'userId', type: AttributeType.STRING},
            sortKey: {name: 'id', type: AttributeType.STRING},
            globalSecondaryIndexes: [
                {
                    indexName: 'suburb',
                    partitionKey: {name: 'pk', type: AttributeType.STRING},
                },
                {
                    indexName: 'postcode',
                    partitionKey: {name: 'pk', type: AttributeType.STRING},
                },
            ],
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });


        // create an api gateway
        const api: RestApi = new RestApi(this, buildString + 'TU_API_Gateway', {
            restApiName: buildString + 'TU_API_Gateway',
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
            },
            apiKeySourceType: ApiKeySourceType.HEADER,
        });

        // create a lambda function
        const addressLambda: NodejsFunction = new NodejsFunction(this, buildString + 'TU_Lambda_Address', {
            functionName: buildString + 'TU_Lambda_Address',
            entry: path.join(__dirname, '../resources/endpoints/address.ts'),
            handler: 'handler',
            environment: {
                TABLE_NAME: addressTable.tableName,
            },
        });
        addressTable.grantReadWriteData(addressLambda);


        // create the api gateway resources and attach it to the lambda function
        const addressAPIResource: Resource = api.root.addResource('address');

        // create endpoint POST /address/create
        addressAPIResource.addResource('create').addMethod('POST', new LambdaIntegration(addressLambda), {
            apiKeyRequired: buildState === BuildState.PROD, // required in production only
        });

        // create endpoint POST /address/find
        addressAPIResource.addResource('find').addMethod('POST', new LambdaIntegration(addressLambda), {
            apiKeyRequired: buildState === BuildState.PROD, // required in production only
        });


        // only the production build will have usage plan and api key
        if (buildState === BuildState.PROD) {
            // create a usage plan
            const plan: UsagePlan = api.addUsagePlan(buildString + 'TU_API_UsagePlan', {
                name: buildString + 'TU_API_UsagePlan',
                apiStages: [
                    {
                        api,
                        stage: api.deploymentStage,
                    }
                ],
            });

            // create an api key for testing purposes
            const apiKey: IApiKey = api.addApiKey(buildString + 'TU_API_Key');
            plan.addApiKey(apiKey);

            // output api key
            new CfnOutput(this, buildString + 'APIKeyID', {
                value: apiKey.keyId,
            });
        } else {
            // expose this for testing purposes
            this.apiEndpointOutput = api.url;
            this.tableNameOutput = addressTable.tableName;
        }
    }
}