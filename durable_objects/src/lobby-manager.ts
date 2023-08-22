export class LobbyManager {
    state: DurableObjectState;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(state: DurableObjectState, env: never) {
        this.state = state;
    }

    async fetch(request: Request) {

        const path = new URL(request.url).pathname;

        switch (path) {
            case "/host":
                return new Response("Hello Host!");
            case "/client":
                return new Response("Hello Client!");
            default:
                return new Response("Not Found", { status: 404 });
        }
    }
}