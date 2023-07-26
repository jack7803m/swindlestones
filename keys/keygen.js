// Generates a new ECDSA key pair at (technically prior to) build time and saves it to the keys directory
// Private key is saved as `private` and used to sign the API response
// Public key is saved as `public` and used to verify the API response on the client

import fs from 'fs';
import crypto from 'crypto';

crypto.subtle.generateKey(
    {
        name: 'ECDSA',
        namedCurve: 'P-384'
    },
    true,
    ['sign', 'verify']
).then((keyPair) => {
    crypto.subtle.exportKey('jwk', keyPair.privateKey).then((privateKey) => {
        fs.writeFileSync('./keys/private.txt', JSON.stringify(privateKey));
    });
    crypto.subtle.exportKey('jwk', keyPair.publicKey).then((publicKey) => {
        fs.writeFileSync('./keys/public.txt', JSON.stringify(publicKey));
    });
});
