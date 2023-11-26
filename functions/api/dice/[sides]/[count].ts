import { sign } from '$keys/sign';
import { DiceRequest, DiceResponse } from '../../types';
import { seededRandom } from '../../util';

// "Rolls dice" with the specified number of sides
// Returns the array of dice rolls plus a digital signature
// the request count, sides, and request time, and result array are signed with the private key
// the client can verify the signature with the public key 

/**
 * Handles the POST request for rolling dice.
 * 
 * @returns A {@link Response} object containing a {@link DiceResponse} object with the result of the dice roll and its signature.
 */
export const onRequestPost: PagesFunction<unknown> = async (context) => {
    const sides: number = parseInt(context.params.sides as string);
    const count: number = parseInt(context.params.count as string);

    if (isNaN(sides) || sides < 1 || sides > 999) return new Response('Bad Request', { status: 400 });
    if (isNaN(count) || count < 1 || count > 999) return new Response('Bad Request', { status: 400 });

    let nonce, sigs;
    try {
        const body: DiceRequest = await context.request.json();
        nonce = body.nonce!;
        sigs = body.sigs!;
    } catch (e) {
        return new Response('Bad Request', { status: 400 });
    }

    // hash nonce and sigs to get seed
    const seed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ nonce, sigs })));
    // convert hash to a number (first 32 bits since we can only seed with 32 bits)
    const seedView = new DataView(seed);
    const seedNumber = seedView.getUint32(0);

    // create a seeded random number generator
    const random = seededRandom(seedNumber);

    // roll the dice
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(random.gen() * sides) + 1);
    }

    const result = {
        sides: sides,
        count: count,
        nonce: nonce,
        sigs: sigs,
        time: Date.now(),
        rolls: rolls
    }

    // sign the result
    const signature = await sign(result);

    const response: DiceResponse = {
        result,
        signature
    }

    // return the result and signature
    return new Response(JSON.stringify(response));
};