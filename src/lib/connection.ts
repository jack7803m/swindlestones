import Peer, { type DataConnection } from 'peerjs';
import type { GameEvent, GameMessage, JoinLobbyRequest, JoinLobbyResponse, Player } from './types';


// my attempt at a signal-type object. 
// does not provide reactivity or derived signals, mainly just an easy way to await a callback
type Signal<T> = {
    (): T;
    set: (data: T) => void;
    update: (fn: (data: T) => T) => void;
    check: (val: T) => Promise<void>;
    checkFor: (fn: (data: T) => boolean) => Promise<void>;
}

function signal<T>(data: T): Signal<T> {
    let _data: T = data;

    let listeners: ((data: T) => boolean)[] = [];

    function set(data: T): void {
        _data = data;

        listeners = listeners.filter((fn) => {
            if (fn(data)) {
                return false;
            }
            return true;
        });
    }

    async function checkFor(fn: (data: T) => boolean): Promise<void> {
        return new Promise((resolve) => {
            // if already true, resolve
            if (fn(_data)) {
                resolve();
            }
            else {
                // otherwise, add a listener that resolves this promise when true
                listeners.push((data) => {
                    if (fn(data)) {
                        resolve();
                        return true;
                    }
                    return false;
                });
            }
        });
    }

    function get() {
        return _data;
    }

    get.set = set;
    get.update = (fn: (data: T) => T) => set(fn(_data));
    get.check = async (val: T) => checkFor((data) => data === val);
    get.checkFor = checkFor;

    return get;
}

export class PeerJSGame {
    public lobbyId!: string;
    public players: Map<string, Player> = new Map();
    public ready: Signal<boolean> = signal(false);

    private peer!: Peer;
    private callbacks: Map<GameEvent, { callback: ((clientId: string, data: any) => void), lifetime: number }[]> = new Map();

    /**
     * Establishes a connection with the server and other clients.
     * @param {boolean} pub - Indicates whether the client is a public player.
     * @param {string} id - Optional. The ID of the lobby to join, if undefined creates a new lobby.
     * @returns {Promise<void>} - A promise that resolves when the connection is established.
     */
    async connect(pub: boolean, id?: string): Promise<void> {
        this.peer = new Peer();
        this.peer.once('open', (id) => {
            console.log('My peer ID is: ' + id);
            this.ready.set(true);
        });

        await this.ready.check(true);
        
        const url = '/api/lobby/join' + (id ? '/' + id : '');
        const response: JoinLobbyResponse = await (await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: this.peer.id,
                pub: pub
            } as JoinLobbyRequest)
        })).json();

        for (const clientId of response.clientIds) {
            if (clientId === this.peer.id) continue;
            const conn = this.peer.connect(clientId);
            conn.once('open', () => {
                this.players.set(clientId, {
                    id: conn.peer,
                    diceCount: 0,
                    name: '',
                    publicKey: '',
                    connection: conn,
                    roundData: {
                        nonceHash: ''
                    }
                });
            });
            conn.on('data', (data: any) => {
                this.handleCallbacks(this.parse(data), conn);
            });
        }

        this.peer.on('connection', (conn) => {
            this.players.set(conn.peer, {
                id: conn.peer,
                diceCount: 0,
                name: '',
                publicKey: '',
                connection: conn,
                roundData: {
                    nonceHash: ''
                }
            });

            conn.on('data', (data: any) => {
                this.handleCallbacks(this.parse(data), conn);
            });
        })
    }

    /**
     * Sends a game event with data to a specific client.
     * 
     * @param clientId - The ID of the client to send the event to.
     * @param event - The game event to send.
     * @param data - The data associated with the event.
     */
    send(clientId: string, event: GameEvent, data: any): void {
        if (!this.ready()) throw new Error('Peer not initialized; call connect() first');

        const conn = this.players.get(clientId)?.connection;
        if (!conn) throw new Error('Client not found');

        conn.send(JSON.stringify({
            event: event,
            details: data
        } as GameMessage));
    }

    /**
     * Broadcasts a game event and its data to all connected players.
     * @param event The game event to broadcast.
     * @param data The data associated with the game event.
     */
    broadcast(event: GameEvent, data: any): void {
        if (!this.ready()) throw new Error('Peer not initialized; call connect() first');

        for (const player of this.players.values()) {
            player.connection.send(JSON.stringify({
                event: event,
                details: data
            } as GameMessage));
        }
    }

    /**
     * Registers a callback function to be executed when a specific game event occurs.
     * 
     * @template T - The type of data expected in the callback.
     * @param event - The game event to listen for.
     * @param callback - The callback function to be executed when the event occurs.
     * @param lifetime - Optional. The amount of time the callback will be called. If not specified, the callback will have an indefinite lifetime.
     */
    on<T>(event: GameEvent, callback: (clientId: string, data: T) => void, lifetime?: number): void {
        if (!this.ready()) throw new Error('Peer not initialized; call connect() first');

        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        if (this.callbacks.get(event)!.some((val) => val.callback === callback)) return;

        this.callbacks.get(event)!.push({ callback: callback, lifetime: lifetime ?? -1 });
    }

    /**
     * Registers a one-time event listener for the specified event.
     * 
     * @template T - The type of data expected from the event.
     * @param {GameEvent} event - The event to listen for.
     * @param {(clientId: string, data: T) => void} callback - The callback function to be executed when the event is triggered.
     * @returns {void}
     */
    once<T>(event: GameEvent, callback: (clientId: string, data: T) => void): void {
        this.on(event, callback, 1);
    }

    private parse(data: string): GameMessage {
        const message: GameMessage = JSON.parse(data);

        // TODO: validate message
        console.log('Received message:', message);

        return message;
    }

    /**
     * Handles the callbacks for a given game message received from a given connection.
     * @param message The game message to handle callbacks for.
     * @param connection The connection associated with the callbacks.
     */
    private handleCallbacks(message: GameMessage, connection: DataConnection): void {
        for (const callback of this.callbacks.get(message.event) || []) {
            if (!callback.lifetime) continue;
            callback.callback(connection.peer, message.details);
            callback.lifetime--;
        }

        this.callbacks.set(message.event, this.callbacks.get(message.event)!.filter((val) => val.lifetime !== 0));
    }
}