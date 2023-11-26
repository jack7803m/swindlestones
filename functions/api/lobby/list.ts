import { DurableObjectRequest, Env, ListResponse } from "../types";
import { durableObjectRequestURL } from "../util";

/**
 * Handles the GET request for retrieving a list of lobbies.
 * @returns A {@link Response} object containing a {@link ListResponse} object with the list of lobbies.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { LOBBYMANAGER } = context.env;

    // * Note that parsing the json and then stringifying is redundant here, but done for consistency with other endpoints
    const registry = LOBBYMANAGER.get(LOBBYMANAGER.idFromName('registry'));
    const response: ListResponse = await (await registry.fetch(new Request(
        durableObjectRequestURL, {
        method: 'GET',
        body: JSON.stringify({
            action: 'list',
            data: {}
        } as DurableObjectRequest)
    }
    ))).json();

    return new Response(JSON.stringify(response));
}