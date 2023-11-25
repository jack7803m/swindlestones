export interface DiceRequest {
    result: {
        sides: number,
        count: number,
        time: number,
        rolls: number[]
    },
    signature: string
}

export enum GameEvent {
    TurnStart,
    Bid,
    Challenge,
}

export interface GameConnection {
    connect(): void;
    broadcast<T>(data: T): void;
    send<T>(clientId: number, data: T): void;
    on<T>(event: GameEvent, callback: (clientId: number, data: T) => void): void;
}

export type Player = {
    id: number,
    name: string,
    publicKey: string,
    diceCount: number,
    roundData: RoundData,
}

export type RoundData = {
    nonceHash: string,
}
