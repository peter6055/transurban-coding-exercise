import axios, {AxiosResponse} from "axios";
import {HttpMethod} from "../../types";

export async function sendAxiosRequest(url: string, method: HttpMethod, data: any, headers: any): Promise<AxiosResponse> {
    return axios({
        url,
        method,
        data,
        headers
    });
}