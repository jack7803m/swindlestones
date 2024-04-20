export const durableObjectRequestURL = 'http://127.0.0.1/api/';

export async function hash(data: unknown): Promise<string> {
	return hashRaw(data).then((hash) => btoa(String.fromCharCode(...new Uint8Array(hash))));
}

export async function hashRaw(data: unknown): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)));
}
