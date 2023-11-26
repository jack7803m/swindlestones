import { Client, DurableObjectRequest } from "./types";

export class LobbyManager {
    state: DurableObjectState;
    clients: Map<string, Client> = new Map();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(state: DurableObjectState, env: never) {
        this.state = state;
        this.clients = new Map();

        this.state.getWebSockets().forEach((_ws) => {
            // no typescript support for hibernatable websocket api? :(
            // let meta = ws.deserializeAttachment();
        })

    }

    async fetch(request: Request) {
        const req = await request.json() as DurableObjectRequest;

        switch (req.action) {
            case 'list':
                return this.list();
            case 'join':
                return this.join(req.data);
            default:
                return new Response('Invalid action', { status: 400 });
        }
    }

    join(_data: any) {

    }

    list() {
        return new Response('List', { status: 200 });
    }

}