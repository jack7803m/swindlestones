import { readable, type Readable } from "svelte/store";
import { PeerJSGame } from "./connection";

export const gameConnection: Readable<PeerJSGame> = readable(new PeerJSGame())

export async function getGameConnection(): Promise<PeerJSGame> {
    return new Promise<PeerJSGame>((resolve, reject) => {
        gameConnection.subscribe((connection) => {
            if (connection) {
                resolve(connection);
            } else {
                reject(new Error('Failed to get game connection'));
            }
        });
    });
}