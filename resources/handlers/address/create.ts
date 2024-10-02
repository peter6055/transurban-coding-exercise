import {uuid} from 'uuidv4';
import {PutCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {HereMap} from "../../helpers/mapService";
import {MapServiceResponseType} from "../../../types";

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
        !bodyParsed.address
    ) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'Missing necessary request body'}),
        };
    }

    // using Google Map API
    // const googleMap = new HereMap();
    // await googleMap.requestAPI(undefined, undefined, {
    //     address: bodyParsed.address,
    // })
    // const address:MapServiceResponseType = googleMap.getAddress()


    // using Here Map API
    const hereMap = new HereMap();
    await hereMap.requestAPI(undefined, undefined, {
        address: bodyParsed.address,
    })
    const address:MapServiceResponseType = hereMap.getAddress()



    if(address.address === ""){
        return {
            statusCode: 404,
            body: JSON.stringify({message: 'Unable to find the address'}),
        };
    } else {
        // Create the database
        const dynamodb = new DynamoDB({});
        await dynamodb.send(
            new PutCommand({
                TableName: process.env.TABLE_NAME,
                Item: {
                    id: `${uuid()}`,
                    userId: bodyParsed.userId,
                    address: address
                },
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({message: 'Address created successfully'}),
        }
    }



}
