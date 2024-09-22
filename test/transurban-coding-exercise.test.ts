import * as cdk from 'aws-cdk-lib';
import {Capture, Template} from 'aws-cdk-lib/assertions';
import * as TransurbanCodingExercise from '../lib/transurban-coding-exercise-stack';
import {BuildState} from "../types";

const app = new cdk.App();
const stack = new TransurbanCodingExercise.TransurbanCodingExerciseStack(app, 'TestStack', {}, BuildState.PROD);
const template = Template.fromStack(stack);


test('Address DynamoDB template', () => {
    template.hasResourceProperties("AWS::DynamoDB::GlobalTable", {
        TableName: "PROD_TU_DDB_Table_Address",
        KeySchema: [
            {
                "AttributeName": "userId",
                "KeyType": "HASH"
            },
            {
                "AttributeName": "id",
                "KeyType": "RANGE"
            }
        ],
        GlobalSecondaryIndexes: [
            {
                "IndexName": "suburb",
                "KeySchema": [
                    {
                        "AttributeName": "pk",
                        "KeyType": "HASH"
                    }
                ],
                "Projection": {
                    "ProjectionType": "ALL"
                }
            },
            {
                "IndexName": "postcode",
                "KeySchema": [
                    {
                        "AttributeName": "pk",
                        "KeyType": "HASH"
                    }
                ],
                "Projection": {
                    "ProjectionType": "ALL"
                }
            }
        ],
    });
});


test('API Gateway template', () => {
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
        ApiKeySourceType: "HEADER",
        Name: "PROD_TU_API_Gateway"
    });
});

test('API Usage Plan template', () => {
    // RestApiId is a dynamic value, so we need to capture it
    const restApiIdCapture = new Capture();

    template.hasResourceProperties("AWS::ApiGateway::UsagePlan", {
        UsagePlanName: "PROD_TU_API_UsagePlan",
        ApiStages: [
            {
                ApiId: {
                    "Ref": restApiIdCapture
                }
            }
        ]
    });

    // Check that the RestApiId is a string that contains "TU_API_Gateway", which is the name of the api gateway
    expect(restApiIdCapture.asString()).toContain(`PRODTUAPIGateway`);
});


test('API Key template', () => {
    // RestApiId is a dynamic value, so we need to capture it
    const restApiIdCapture = new Capture();

    template.hasResourceProperties("AWS::ApiGateway::ApiKey", {
        Enabled: true,
        StageKeys: [
            {
                RestApiId: {
                    "Ref": restApiIdCapture
                }
            }
        ]
    });

    // Check that the RestApiId is a string that contains "TU_API_Gateway", which is the name of the api gateway
    expect(restApiIdCapture.asString()).toContain(`PRODTUAPIGateway`);
});


test('Lambda template', () => {
    // tableNameCapture is a dynamic value, so we need to capture it
    const tableNameCapture = new Capture();

    template.hasResourceProperties("AWS::Lambda::Function", {
        Handler: "index.handler",
        Environment: {
            Variables: {
                TABLE_NAME: {
                    Ref: tableNameCapture
                }
            }
        },
    });

    // Check that the RestApiId is a string that contains "TU_API_Gateway", which is the name of the api gateway
    expect(tableNameCapture.asString()).toContain(`PRODTUDDBTableAddress`);
});



/*
 * The following tests are not covered
 *  - API Gateway method (`api.root.addResource`, `address.addResource`), since the lambda function is dynamically created
 *    recommend to do it on integration testing
 *  - Output API Endpoint URL and Key ID, since it is a dynamic value
 *
 */
