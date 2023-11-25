import * as publickey from './pub.json';

export async function verifyServer(result: unknown, signature: string): Promise<boolean> {

    // import the public key
    const key = await crypto.subtle.importKey(
        'jwk',
        publickey,
        { name: 'ECDSA', namedCurve: 'P-384' },
        true,
        ['verify']);

    // verify the signature
    const valid: boolean = await crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-384' } },
        key,
        new Uint8Array(atob(signature).split('').map(c => c.charCodeAt(0))),
        new TextEncoder().encode(JSON.stringify(result)),
    );

    return valid;
}