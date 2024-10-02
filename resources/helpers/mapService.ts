import { sendAxiosRequest } from "./axios";
import {
    GoogleMapResponseType,
    HereMapResponseType,
    HttpMethod,
    MapServiceResponseType
} from "../../types";


// Base class implementing the interface
export class MapAPI {
    address: string = '';
    suburb: string = '';
    state: string = '';
    postcode: string = '';
    country: string = '';

    async requestAPI(url: string, method: HttpMethod, data: any, headers: any): Promise<any> {
        const response = await sendAxiosRequest(url, method, data, headers);
        if (!response) {
            throw new Error('Internal Server Error');
        } else if (response.status === 200) {
            return 200;
        } else {
            throw new Error('Invalid address');
        }
    }

    // Set the address fields
    setAddress(address: string, suburb: string, state: string, postcode: string, country: string): void {
        this.address = address || '';
        this.suburb = suburb || '';
        this.state = state || '';
        this.postcode = postcode || '';
        this.country = country || '';
    }

    // Return the address as an object
    getAddress(): MapServiceResponseType {
        return {
            address: this.address,
            suburb: this.suburb,
            state: this.state,
            postcode: this.postcode,
            country: this.country
        };
    }
}

// Derived class for Google Map API
// Assume that the Google Maps API response is in the format:
// {
//     address: string,
//     suburb: string,
//     state: string,
//     postcode: string
//     country: string
// }
export class GoogleMap extends MapAPI {
    constructor() {
        super();
    }

    // Override the requestAPI method for Google Maps
    async requestAPI(url: string = 'https://maps.google.com/api/v1', method: HttpMethod = HttpMethod.POST, data: any = {}, headers: any = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_GOOGLE_API_KEY'
    }){
        const response: GoogleMapResponseType = await super.requestAPI(url, method, data, headers);

        // Map the Google Maps API response to the format we need
        this.setAddress(response.address, response.suburb, response.state, response.postcode, 'Australia');
    }
}

// Derived class for Here Map API
// Assume that the Here Maps API response is in the format:
// {
//     address_full_string: string,
//     address_components: [{
//         long_name: string,
//         short_name: string,
//         types: string[] // address, locality, administrative_area_level_1, postcode, country
//     }]
// }
export class HereMap extends MapAPI {
    constructor() {
        super();
    }

    // Override the requestAPI method for Here Maps
    async requestAPI(url: string = 'https://maps.here.com/api/v1', method: HttpMethod = HttpMethod.POST, data: any = {}, headers: any = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_HERE_MAP_API_KEY'
    }){
        const response: HereMapResponseType = await super.requestAPI(url, method, data, headers);

        // Convert the Here Maps API response to the format we need
        const addressComponents = response?.address_components;

        if(addressComponents && addressComponents.length > 0){

            const addressLine = addressComponents.find((comp: any) => comp.types?.includes('address'))?.long_name || "";
            const suburb = addressComponents.find((comp: any) => comp.types?.includes('locality'))?.long_name || "";
            const state = addressComponents.find((comp: any) => comp.types?.includes('administrative_area_level_1'))?.short_name || "";
            const postcode = addressComponents.find((comp: any) => comp.types?.includes('postcode'))?.short_name || "";
            const country = addressComponents.find((comp: any) => comp.types?.includes('postcode'))?.short_name || "";

            this.setAddress(addressLine, suburb, state, postcode, country);
        }

    }
}