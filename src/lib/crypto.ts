export { verifyServer } from '$keys/verify';

/**
 * Verifies the signature of the given data using the provided public key.
 * @param data - The data to be verified.
 * @param signature - The signature to be verified.
 * @param publicKey - The public key used for verification.
 * @returns A boolean indicating whether the signature is valid or not.
 * @throws {TypeError} If the publicKey is invalid.
 */
export async function verify(
	data: unknown,
	signature: string,
	publicKey: string
): Promise<boolean> {
	// TODO: TypeError raised if publicKey is invalid
	// import the public key
	const key = await crypto.subtle.importKey(
		'jwk',
		JSON.parse(publicKey),
		{ name: 'ECDSA', namedCurve: 'P-384' },
		true,
		['verify']
	);

	// verify the signature
	const valid: boolean = await crypto.subtle.verify(
		{ name: 'ECDSA', hash: { name: 'SHA-384' } },
		key,
		new Uint8Array(
			atob(signature)
				.split('')
				.map((c) => c.charCodeAt(0))
		),
		new TextEncoder().encode(JSON.stringify(data))
	);

	return valid;
}

/**
 * Calculates the SHA-256 hash of the provided data.
 *
 * @param data - The data to be hashed.
 * @returns A Promise that resolves to the hashed data as a string.
 */
export async function hash(data: unknown): Promise<string> {
	return hashRaw(data).then((hash) => btoa(String.fromCharCode(...new Uint8Array(hash))));
}

/**
 * Calculates the SHA-256 hash of the provided data.
 *
 * @param data - The data to be hashed.
 * @returns A Promise that resolves to the hashed data as an ArrayBuffer.
 */
export async function hashRaw(data: unknown): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)));
}

/**
 * Verifies the hash of the given data.
 * @param data The data to be hashed.
 * @param hashToVerify The hash to be verified against.
 * @returns A promise that resolves to a boolean indicating whether the hash is verified or not.
 */
export async function verifyHash(data: unknown, hashToVerify: string): Promise<boolean> {
	return hash(data).then((h) => h === hashToVerify);
}

/**
 * Creates a function to generate random values from a seed.
 * @param seed The seed to be used for generating random values. Any string is valid: it will be hashed to create the seed.
 * @returns A promise that resolves to an object with a function that generates random values.
 */
export async function seededRandom(seed: string) {
	const hash = await hashRaw(seed);

    let a = new DataView(hash).getUint32(0, false);
    let b = new DataView(hash).getUint32(4, false);
    let c = new DataView(hash).getUint32(8, false);
    let d = new DataView(hash).getUint32(12, false);

    // sfc32, adapted from post on https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
	function random() {
		a |= 0;
		b |= 0;
		c |= 0;
		d |= 0;
		const t = (((a + b) | 0) + d) | 0;
		d = (d + 1) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
    }

    return {
        random
    }
}
