export type DurableObjectRequest = {
    action: 'generate' | 'getReferenceId' | 'join' | 'list';
    data: any;
}

export type Client = {
    id: string;
    websocket: WebSocket;
}

export type JoinLobbyRequest = {
    clientId: string;
    pub: boolean;
}

export type JoinLobbyResponse = {
    lobbyId: string;
    clientIds: string[];
}

export type GetReferenceResponse = {
    referenceId: string;
}

export type ListResponse = {
    lobbies: {
        lobbyId: string;
        clients: number;
    }[]
}
