import 'aws-sdk-client-mock-jest';
import {mockClient} from 'aws-sdk-client-mock';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb";
import {create} from "../../../resources/handlers/address/create";

const dynamoDBMock = mockClient(DynamoDBClient);

jest.mock('uuidv4', () => ({
    uuid: jest.fn(() => 'testID00001'),
}));

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

describe('Test Create Address Successful', () => {
    beforeAll(async () => {
        process.env.TABLE_NAME = 'address'
    });

    // Make sure to reset your mocks before each test to avoid issues.
    beforeEach(() => {
        dynamoDBMock.reset();
    });


    it('should return 201 and created message', async () => {
        const response = await create(JSON.stringify(data));
        expect(response).toEqual({
            statusCode: 201,
            body: JSON.stringify({message: 'Address Created!'}),
        });
    });


    it('should call DynamoDB with the correct command', async () => {
        await create(JSON.stringify(data));
        expect(dynamoDBMock).toHaveReceivedCommandWith(PutCommand, {
            TableName: process.env.TABLE_NAME,
            Item: expect.objectContaining({
                id: 'testID00001',
                userId: data.userId,
                line: data.address.line,
                suburb: data.address.suburb,
                state: data.address.state,
                postcode: data.address.postcode,
            })
        });
    });
});


describe('Test Create Address Fail', () => {
    const MISSING_BODY_ERROR_MSG = {message: 'Missing request body'};
    const MISSING_BODY_COMPONENTS_ERROR_MSG = {message: 'Missing necessary request body'};

    beforeAll(async () => {
        process.env.TABLE_NAME = 'address'
    });

    // Make sure to reset your mocks before each test to avoid issues.
    beforeEach(() => {
        dynamoDBMock.reset();
    });

    it('should return 400 when there are no body', async () => {
        const response = await create(null);
        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify(MISSING_BODY_ERROR_MSG),
        });
    });

    it('should return 400 when no user Id', async () => {
        const response = await create(JSON.stringify({
            address: {
                line: data.address.line,
                suburb: data.address.suburb,
                state: data.address.state,
                postcode: data.address.postcode,
            }
        }));
        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify(MISSING_BODY_COMPONENTS_ERROR_MSG),
        });
    });

    it('should return 400 when no address components', async () => {
        const response = await create(JSON.stringify({
            userId: data.userId
        }));
        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify(MISSING_BODY_COMPONENTS_ERROR_MSG),
        });
    });

    it('should return 400 when no suburb', async () => {
        const response = await create(JSON.stringify({
            userId: data.userId,
            address: {
                line: data.address.line,
                state: data.address.state,
                postcode: data.address.postcode,
            }
        }));
        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify(MISSING_BODY_COMPONENTS_ERROR_MSG),
        });
    })

    it('should return 400 when no state', async () => {
        const response = await create(JSON.stringify({
            userId: data.userId,
            address: {
                line: data.address.line,
                suburb: data.address.suburb,
                postcode: data.address.postcode,
            }
        }));
        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify(MISSING_BODY_COMPONENTS_ERROR_MSG),
        });
    })

    it('should return 400 when no postcode', async () => {
        const response = await create(JSON.stringify({
            userId: data.userId,
            address: {
                line: data.address.line,
                suburb: data.address.suburb,
                postcode: data.address.postcode,
            }
        }));
        expect(response).toEqual({
            statusCode: 400,
            body: JSON.stringify(MISSING_BODY_COMPONENTS_ERROR_MSG),
        });
    })
});