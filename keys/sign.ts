// @ts-expect-error - typescript loves whining
import * as privatekey from './priv.json';

export async function sign(result: unknown): Promise<string> {

    // import the private key
    const key = await crypto.subtle.importKey(
        'jwk',
        privatekey,
        { name: 'ECDSA', namedCurve: 'P-384' },
        true,
        ['sign']);
    
    // sign the result
    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-384' } },
        key,
        new TextEncoder().encode(JSON.stringify(result)));
        
    // return the signature as a base64 string
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}