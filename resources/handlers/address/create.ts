import {uuid} from 'uuidv4';
import {PutCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";

export async function create(body: any) {
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'Missing request body'}),
        };
    }


    // This code ensure @aws-cdk/integ-tests-alpha to be able to pass the test data
    const bodyParsed = typeof body === 'string' ? JSON.parse(body) : body;

    if (
        !bodyParsed.userId ||
        !bodyParsed.address ||
        !bodyParsed.address.line ||
        !bodyParsed.address.suburb ||
        !bodyParsed.address.state ||
        !bodyParsed.address.postcode
    ) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'Missing necessary request body'}),
        };
    }


    // Create the database
    const dynamodb = new DynamoDB({});
    await dynamodb.send(
        new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                id: `${uuid()}`,
                userId: bodyParsed.userId,
                ...bodyParsed.address,
            },
        })
    );

    return {
        statusCode: 201,
        body: JSON.stringify({message: 'Address Created!'}),
    };
}
