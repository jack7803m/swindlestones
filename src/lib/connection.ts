import type { GameConnection, GameEvent } from './types';

export class DurableObjectGame implements GameConnection {

    constructor() {
        console.log('DurableObjectGame constructor');
    }
    connect(): void {
        throw new Error('Method not implemented.');
    }
    send<T>(clientId: number, data: T): void {
        throw new Error('Method not implemented.');
    }
    broadcast<T>(data: T): void {
        throw new Error('Method not implemented.');
    }
    on<T>(event: GameEvent, callback: (clientId: number, data: T) => void): void {
        throw new Error('Method not implemented.');
    }

}

export class PeerJSGame implements GameConnection {
    connect(): void {
        throw new Error('Method not implemented.');
    }
    send<T>(clientId: number, data: T): void {
        throw new Error('Method not implemented.');
    }
    broadcast<T>(data: T): void {
        throw new Error('Method not implemented.');
    }
    on<T>(event: GameEvent, callback: (clientId: number, data: T) => void): void {
        throw new Error('Method not implemented.');
    }
}