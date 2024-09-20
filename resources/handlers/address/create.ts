import {uuid} from 'uuidv4';
import {PutCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {Address, UserId} from "../../../types";

type Body = {
    userId: UserId,
    address: Address
}

export async function create(body: string | null) {
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'Missing request body'}),
        };
    }


    // Parse the body
    const bodyParsed = JSON.parse(body) as Body;
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
