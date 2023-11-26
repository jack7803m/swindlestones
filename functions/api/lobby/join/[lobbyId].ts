import { DurableObjectRequest, Env, GetReferenceResponse, JoinLobbyRequest, JoinLobbyResponse } from "../../types";
import { durableObjectRequestURL } from "../../util";

/**
 * Handles the POST request to join an existing lobby.
 * 
 * @returns A {@link Response} object containing a {@link JoinLobbyResponse} with the result of the join request.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { LOBBYMANAGER } = context.env;
    const { request } = context;

    const joinRequest = await request.json() as JoinLobbyRequest;
    const lobbyId = context.params.lobbyId as string;

    const registry = LOBBYMANAGER.get(LOBBYMANAGER.idFromString('registry'));
    const reference: GetReferenceResponse = await (await registry.fetch(new Request(durableObjectRequestURL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'getReferenceId',
            data: { lobbyId }
        } as DurableObjectRequest)
    }))).json();

    if (!reference.referenceId) {
        return new Response(JSON.stringify({
            error: 'Could not find lobby'
        }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }

    const lobby = LOBBYMANAGER.get(LOBBYMANAGER.idFromString(reference.referenceId));
    const result: JoinLobbyResponse = await (await lobby.fetch(new Request(durableObjectRequestURL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'join',
            data: {
                referenceId: reference.referenceId,
                joinRequest
            }
        } as DurableObjectRequest)
    }))).json();

    if (!result.lobbyId) {
        return new Response(JSON.stringify({
            error: 'Could not find lobby'
        }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }

    return new Response(JSON.stringify(result));
} 