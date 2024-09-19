import { APIGatewayProxyEvent } from 'aws-lambda';
import { create } from '../handlers/address/create';
import { find } from '../handlers/address/find';

export const handler = async (event: APIGatewayProxyEvent) => {
    try {

        switch (event.path){
            case '/address/create/':
                return await create(event.body);

            case '/address/find/':
                return await find(event.body);

            default:
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Not Found' }),
                }
        }


    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: error }),
        };
    }
};