import type { DataConnection } from 'peerjs';

export * from '../../shared/types';

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
    RoundStart,
    NonceHash,
    NonceSigned,
    TurnStart,
    Bid,
    Challenge,
    NonceVerification,
    NonceDispute
}

export type Player = {
    id: string,
    name: string,
    publicKey: string,
    diceCount: number,
    connection: DataConnection,
    roundData: RoundData,
}

export type RoundData = {
    nonceHash: string,
}

export type GameMessage = {
    event: GameEvent,
    details: any
}