import { sign } from '$keys/sign';
import { RandomRequest, RandomResponse, RandomResponseSchema } from '../types';

// Hashes a client secret and generates a random N.
// Used by the clients to guarantee trustworthiness

/**
 * Handles the POST request for rolling dice.
 *
 * @returns A {@link Response} object containing a {@link RandomResponse} object with the result and its signature.
 */
export const onRequestPost: PagesFunction<unknown> = async (context) => {
    
    // received from the client
    let secret: string;
    
	try {
		const body: RandomRequest = await context.request.json();
		secret = body.secret;
	} catch (e) {
		return new Response('Bad Request', { status: 400 });
	}

	if (!secret || secret.length !== 32) {
		return new Response('Bad Request', { status: 400 });
    }

	// hash client secret
	const hash = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(secret)
	);
	
    // generate random nonce
    const nonce = new Uint8Array(32);
    crypto.getRandomValues(nonce);

    // result object (convert arrays to hex strings)
    const result = {
        hash: Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join(''),
        nonce: Array.from(nonce).map((b) => b.toString(16).padStart(2, '0')).join('')
    };

	// sign the result
	const signature = await sign(result);

	const response: RandomResponse = {
		result,
		signature
    };
    
    RandomResponseSchema.validate(response);

	// return the result and signature
	return new Response(JSON.stringify(response));
};
