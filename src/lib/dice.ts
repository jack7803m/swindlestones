import { verifyServer } from "./crypto";
import type { DiceRequest } from "./types";

export async function rollDice(count: number, sides: number): Promise<DiceRequest> {

    return fetch(`api/dice/${sides}/${count}`, {
        method: 'POST', body: JSON.stringify({
            nonce: 'nonce',
            sigs: ['sigs']
        })
    }).catch((err) => {
        console.error(err);
        return err;
    }).then(async (res: Response) => {
        if (res.ok) {
            const diceRequest: DiceRequest = await res.json();
            console.log(await verifyServer(diceRequest.result, diceRequest.signature));
            return diceRequest;
        } else {
            throw new Error('Dice Roll Error: ' + res.statusText);
        }
    });
} 