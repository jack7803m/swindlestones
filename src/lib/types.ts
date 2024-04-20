import type { DataConnection } from 'peerjs';
import { RandomResponseSchema } from '../../shared/types';
import { RoundData } from './game';
import { InferType, mixed, number, object, string } from 'yup';

export * from '../../shared/types';

export enum GameEvent {
	NonceExchange = "NonceExchange",
	HashExchange = "HashExchange",
	RoundReady = "RoundReady"
}

export type Player = {
	id: string;
	name: string;
	active: boolean; // if player joins midway through a game, will be false 
	connection: DataConnection;
	roundData?: RoundData;
};

export type GameMessage = InferType<typeof GameMessageSchema>;
export type NonceExchangeData = InferType<typeof NonceExchangeDataSchema>;
export type HashExchangeData = InferType<typeof HashExchangeDataSchema>;
export type RoundReadyData = InferType<typeof RoundReadyDataSchema>;

export const GameMessageSchema = object({
	event: string<GameEvent>().oneOf(Object.values(GameEvent)).defined(),
	details: mixed().nullable()
});

export const NonceExchangeDataSchema = object({
	roundIndex: number().required().positive().integer(),
	nonce: string().required()
});

export const HashExchangeDataSchema = object({
	roundIndex: number().required().positive().integer(),
	serverObject: RandomResponseSchema.required()
});

export const RoundReadyDataSchema = object({
	roundIndex: number().required().positive().integer()
});
