// @ts-expect-error - this is a nonstandard import for cloudflare functions
import publickey from '../../keys/public.txt';

// ! TEMPORARY ENDPOINT
// verifies the signature of the result
export const onRequestPut: PagesFunction<unknown> = async (context) => {
    const body: any = await context.request.json();
    const result = body.result;
    const signature = body.signature;

    // verify the signature
    const valid = await verify(result, signature);

    // return the result and signature
    return new Response(JSON.stringify({ valid }));
};

// sign the result with the private key
async function verify(result: any, signature: string): Promise<boolean> {

    // parse private key as JWK
    const jwk = JSON.parse(publickey);
    console.log(jwk)

    // import the public key
    const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
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