export { verifyServer } from "$keys/verify";

/**
 * Creates a cryptographic object for signing data using ECDSA algorithm with P-384 curve.
 * @returns An object containing the public key and a sign function.
 */
export async function createCrypto() {
    const { privateKey, publicKey: _publicKey } = await crypto.subtle.generateKey(
        {
            name: 'ECDSA',
            namedCurve: 'P-384'
        },
        true,
        ['sign', 'verify']
    );

    const publicKey = JSON.stringify(await crypto.subtle.exportKey('jwk', _publicKey));

    /**
     * Signs the provided data using the private key.
     * @param data - The data to be signed.
     * @returns The signature as a base64 string.
     */
    async function sign(data: unknown) {
        // sign the data
        const signature = await crypto.subtle.sign(
            { name: 'ECDSA', hash: { name: 'SHA-384' } },
            privateKey,
            new TextEncoder().encode(JSON.stringify(data)));

        // return the signature as a base64 string
        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    return {
        publicKey,
        sign,
    }
}

/**
 * Verifies the signature of the given data using the provided public key.
 * @param data - The data to be verified.
 * @param signature - The signature to be verified.
 * @param publicKey - The public key used for verification.
 * @returns A boolean indicating whether the signature is valid or not.
 * @throws {TypeError} If the publicKey is invalid.
 */
export async function verify(data: unknown, signature: string, publicKey: string): Promise<boolean> {

    // TODO: TypeError raised if publicKey is invalid
    // import the public key
    const key = await crypto.subtle.importKey(
        'jwk',
        JSON.parse(publicKey),
        { name: 'ECDSA', namedCurve: 'P-384' },
        true,
        ['verify']);

    // verify the signature
    const valid: boolean = await crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-384' } },
        key,
        new Uint8Array(atob(signature).split('').map(c => c.charCodeAt(0))),
        new TextEncoder().encode(JSON.stringify(data)),
    );

    return valid;
}


/**
 * Calculates the SHA-384 hash of the provided data.
 * 
 * @param data - The data to be hashed.
 * @returns A Promise that resolves to the hashed data as a string.
 */
export async function hash(data: unknown): Promise<string> {
    return crypto.subtle.digest('SHA-384', new TextEncoder().encode(JSON.stringify(data)))
        .then(hash => btoa(String.fromCharCode(...new Uint8Array(hash))));
}

/**
 * Verifies the hash of the given data.
 * @param data The data to be hashed.
 * @param hashToVerify The hash to be verified against.
 * @returns A promise that resolves to a boolean indicating whether the hash is verified or not.
 */
export async function verifyHash(data: unknown, hashToVerify: string): Promise<boolean> {
    return hash(data).then(h => h === hashToVerify);
}