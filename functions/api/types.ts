
export interface Env {
    LOBBYMANAGER: DurableObjectNamespace;
}

export type DiceRequest = {
    nonce: string;
    sigs: string[];
}

export type DiceResponse = {
    result: {

        sides: number;
        count: number;
        nonce: string;
        sigs: string[];
        time: number;
        rolls: number[];
    },
    signature: string;
}

export * from '../../shared/types';