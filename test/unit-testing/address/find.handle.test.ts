import {find} from "../../../resources/handlers/address/find";
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
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
