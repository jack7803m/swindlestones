import { hash, seededRandom, verifyServer } from './crypto';
import { getGameConnection } from './stores';
import { GameEvent, type RandomRequest, type RandomResponse } from './types';

export async function rollDice(count: number, sides: number): Promise<number[]> {
	// TODO: split this into more coherent functions
	// Generate a random 32-character secret
	const cryptoSecret = new Uint8Array(16);
	crypto.getRandomValues(cryptoSecret);
	const secret = Array.from(cryptoSecret)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	// Get the hash and nonce from the server
	const res = await fetch('api/dice/random', {
		method: 'POST',
		body: JSON.stringify({ secret } as RandomRequest)
	});

	if (!res.ok) {
		throw new Error('Failed to get random nonce from server');
	}

	const randomResponse: RandomResponse = await res.json();

	// Verify the server's response
	if (!(await verifyServer(randomResponse.result, randomResponse.signature))) {
		throw new Error('Failed to verify server response signature');
	}

	// Sanity check: verify the hash
	if (randomResponse.result.hash !== (await hash(secret))) {
		console.log(randomResponse.result.hash);
		console.log(await hash(secret));
		throw new Error('Failed to verify server response hash');
	}

	const gameConnection = await getGameConnection();

	// Exchange nonce with every other client
	const nonce = randomResponse.result.nonce;
	gameConnection.broadcast(GameEvent.NonceExchange, { nonce });

	// TODO: Implement nonce exchange, once you have every other client's nonce then continue

	// Exchange full response object with every other client
	randomResponse;
	// TODO: Implement response exchange, once you have every other client's response then continue

	// Verify signatures of all responses
	// TODO: Implement signature verification, once you have verified all signatures then continue

	// Combine all hashes + our secret and hash them together
	// TODO: sort in some deterministic order
	const combined = JSON.stringify({ secret, ...randomResponse.result });
	// TODO: Implement hash combination

	// Use the combined hash to seed the RNG
	const rng = await seededRandom(combined);

	// generate the dice rolls
	const rolls = new Array(count).fill(0).map(() => (rng.random() % sides) + 1);

	// send ready signal to all other clients; once all clients are ready, return the rolls to the frontend
	// TODO: Implement ready signal

	return rolls;
}
