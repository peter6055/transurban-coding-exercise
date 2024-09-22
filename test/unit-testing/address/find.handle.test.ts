import 'aws-sdk-client-mock-jest';
import {find} from "../../../resources/handlers/address/find";
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {GetCommand, PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";

const dynamoDBMock = mockClient(DynamoDBClient);

describe('Test Create Address Fail', () => {
    beforeAll(async () => {
        process.env.TABLE_NAME = 'address'
    });

    // Make sure to reset your mocks before each test to avoid issues.
    beforeEach(() => {
        dynamoDBMock.reset();
    });


    it('should return 400 when there are no body', async () => {
        let response = await find(null);
        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing request body' })
        });
    });

    it('should return 400 when there are no userId', async () => {
        let response = await find(JSON.stringify([{
            "postcode": "3053",
            "state": "VIC"
        }]));

        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify({ message:'Missing necessary request body: userId' })
        });
    });


});


describe('Database Command', () => {
    let response: any;


    // a test data
    const data = {
        userId: '123',
        address: {
            line: '123 Fake St',
            suburb: 'Springfield',
            state: 'QLD',
            postcode: '4000',
        }
    }

    beforeAll(async () => {
        process.env.TABLE_NAME = 'address'
    });

    // Make sure to reset your mocks before each test to avoid issues.
    beforeEach(() => {
        dynamoDBMock.reset();
    });



    it('should query address by userId from dynamodb', async () => {
        await find(JSON.stringify({
            userId: data.userId
        }));

        expect(dynamoDBMock).toHaveReceivedCommandWith(QueryCommand, {
            TableName: process.env.TABLE_NAME,
            ExpressionAttributeValues: {":userId": "123"},
            KeyConditionExpression: "userId = :userId",
        });
    });


    it('should query address by suburb and userId from dynamodb', async () => {
        await find(JSON.stringify({
            userId: data.userId,
            address: {
                suburb: data.address.suburb,
            }
        }));

        expect(dynamoDBMock).toHaveReceivedCommandWith(QueryCommand, {
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "userId = :userId",
            FilterExpression: "#suburb = :suburb OR #postcode = :postcode",
            ExpressionAttributeValues: {":postcode": "", ":suburb": data.address.suburb, ":userId": data.userId},
            ExpressionAttributeNames: {"#postcode": "postcode", "#suburb": "suburb"},
        });
    });

    it('should query address by postcode and userId from dynamodb', async () => {
        await find(JSON.stringify({
            userId: data.userId,
            address: {
                postcode: data.address.postcode
            }
        }));

        expect(dynamoDBMock).toHaveReceivedCommandWith(QueryCommand, {
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "userId = :userId",
            FilterExpression: "#suburb = :suburb OR #postcode = :postcode",
            ExpressionAttributeValues: {":postcode": data.address.postcode, ":suburb": "", ":userId": data.userId},
            ExpressionAttributeNames: {"#postcode": "postcode", "#suburb": "suburb"},
        });
    });

});