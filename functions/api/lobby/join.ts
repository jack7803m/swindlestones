import { Env, JoinLobbyRequest, JoinLobbyResponse } from "../types";
import { durableObjectRequestURL } from "../util";

/**
 * Handles the POST request to create and join a new lobby.
 *
 * @returns A {@link Response} object containing a {@link JoinLobbyResponse} with the result of the join request.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {

    const { LOBBYMANAGER } = context.env;
    const { request } = context;
    const joinRequest = await request.json() as JoinLobbyRequest;

    const registry = LOBBYMANAGER.get(LOBBYMANAGER.idFromName('registry'));
    const result: JoinLobbyResponse = await (await registry.fetch(new Request(
        durableObjectRequestURL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'generate',
            data: joinRequest
        })
    }
    ))).json();

    if (!result.lobbyId) {
        console.error('Failed to generate lobby');
        return new Response(JSON.stringify({
            error: 'Failed to generate lobby'
        }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }

    const lobby = LOBBYMANAGER.get(LOBBYMANAGER.idFromName(result.lobbyId));
    const joinResult: JoinLobbyResponse = await (await lobby.fetch(new Request(
        durableObjectRequestURL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'join',
            data: joinRequest
        })
    }
    ))).json();

    if (!joinResult.lobbyId) {
        return new Response(JSON.stringify({
            error: 'Failed to join lobby'
        }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }

    return new Response(JSON.stringify(result));
}