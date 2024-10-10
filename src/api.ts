import type {IFormResponse} from "@gigya/types";
 
export async function jsonApi(api: () => Promise<Response>): Promise<any> {
    try {
        const r = await api();
        if (r.status > 400) {
            const response = await r.json();
            console.error(
                `Failed to call api token ${r.status} ${
                    r.statusText
                } ${JSON.stringify(response, null, 2)} ${api}`
            );
            return response;
        }
        return await r.json();
    } catch (message) {
        console.error(message);
        return {
            errCode: 5000,
            errMessage: message,
        };
    }
}

type args<T> = { callback: (response: T) => void } & any;
type method<T> = (params: args<T>) => void;
export function promisify<
    T,
    TResponse extends T & IFormResponse = T & IFormResponse
>(method: method<TResponse> , params: any = {}): Promise<TResponse> {
    return new Promise<TResponse>((resolve) => {
        method({
            ...params,
            callback: (response: TResponse) => {
                resolve(response);
            },
        });
    });
}
