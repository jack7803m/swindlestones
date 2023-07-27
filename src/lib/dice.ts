import type { DiceRequest } from "./types";

export async function rollDice(count: number, sides = 4): Promise<DiceRequest> {

    return fetch(`api/dice/${sides}/${count}`).catch((err) => {
        console.error(err);
        return err;
    }).then((res: Response) => {
        console.log(res);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('Network response was not ok?');
        }
    });
} 