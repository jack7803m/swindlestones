import { verifyServer } from "./crypto";
import type { DiceRequest } from "./types";

export async function rollDice(count: number, sides = 4): Promise<DiceRequest> {

    return fetch(`api/dice/${sides}/${count}`).catch((err) => {
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