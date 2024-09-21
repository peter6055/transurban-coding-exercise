import {QueryCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {QueryCommandInput} from "@aws-sdk/lib-dynamodb/dist-types/commands/QueryCommand";

export async function find(body: string | null) {
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'Missing request body'}),
        };
    }


    // This code ensure @aws-cdk/integ-tests-alpha to be able to pass the test data
    const bodyParsed = typeof body === 'string' ? JSON.parse(body) : body;


    if (!bodyParsed.userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'Missing necessary request body: userId'}),
        };
    }


    // build a basic query
    let input: QueryCommandInput = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": bodyParsed.userId,
        },
        ConsistentRead: true,
    }


    // Do not merge it into the above object, as a undefined value in FilterExpression will cause an error
    // This try-catch only used to skip the error to avoid 500 error been return
    try {
        // In case use wants to search by suburb or postcode
        if (bodyParsed.address.suburb || bodyParsed.address.postcode) {
            input.FilterExpression = "#suburb = :suburb OR #postcode = :postcode";
            input.ExpressionAttributeNames = {
                "#suburb": "suburb",
                "#postcode": "postcode"
            };
            input.ExpressionAttributeValues = {
                ":userId": bodyParsed.userId,
                ":suburb": bodyParsed.address.suburb || "",
                ":postcode": bodyParsed.address.postcode || "",
            };
        }
    } catch (error) {
    }

    // Create the database, send the query
    const dynamodb = new DynamoDB({});
    const response = await dynamodb.send(new QueryCommand(input));

    if (response.Items?.length === 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({message: 'Address not found'}),
        }
    } else {
        return {
            statusCode: 200,
            body: JSON.stringify(response.Items),
        };
    }
}
