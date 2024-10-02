export enum BuildState{
    TEST = 'TEST',
    PROD = 'PROD'
}

export type MapServiceResponseType = {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
}

export type GoogleMapResponseType = {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
}

export type HereMapResponseType = {
    address_full_string: string;
    address_components: [{
        long_name: string;
        short_name: string;
        types: string[];
    }]
}

export type LambdaResponseType = {
    statusCode: number;
    body: string;
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}