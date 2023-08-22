import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';

export const host = {
    connect: async () => {
        const peer = new Peer();

        console.log(peer);

        return new Promise<{ conn: DataConnection, peer: Peer }>((resolve, reject) => {
            peer.on('connection', (conn) => conn.on('open', () => resolve({ conn, peer })));
            peer.on('error', reject);
        });
    }
}

export const client = {
    connect: async (id: string) => {
        const peer = new Peer();

        return new Promise<DataConnection>((resolve, reject) => {
            const conn = peer.connect(id);

            conn.on('open', () => resolve(conn));
            conn.on('error', reject);
        });
    }
}