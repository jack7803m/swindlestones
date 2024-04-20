import { PeerJSGame } from './connection';
import { seededRandom, verifyServer } from './crypto';
import { getGameConnection } from './stores';
import {
	GameEvent,
	HashExchangeData,
	HashExchangeDataSchema,
	NonceExchangeData,
	NonceExchangeDataSchema,
	RoundReadyDataSchema
} from './types';
import { createLogger } from './util';

export class DiceGame {
	private myRoundData?: RoundData;

	private gameConnection?: PeerJSGame;

/**
 * Joins the game by establishing a game connection and setting up event listeners.
 * @returns {Promise<void>} A promise that resolves when the game connection is initialized.
 */
	public async joinGame() {
		this.gameConnection = await getGameConnection();

		// prep all listeners
		this.gameConnection.on(GameEvent.NonceExchange, (clientid, data) => {
			const player = this.gameConnection?.players.get(clientid);

			const logger = createLogger({
				event: GameEvent.NonceExchange,
				data,
				player,
				myRoundData: this.myRoundData
			});

			if (!player) {
				logger.error('Received message from player not in dictionary (!?)');
				return;
			}

			if (!player.active) {
				logger.warn('Received message from inactive player');
				return;
			}

			// Will throw an exception if cast fails
			const nonceData: NonceExchangeData = NonceExchangeDataSchema.cast(data);

			if (this.myRoundData?.roundIndex !== nonceData.roundIndex) {
				logger.error('Error: received data from different round');
				return;
			}

			if (player.roundData?.roundIndex !== this.myRoundData?.roundIndex) {
				logger.error('Error: round data not created on round start or client roundindex off');
				return;
			}

			player.roundData.nonce = nonceData.nonce;
		});

		this.gameConnection.on(GameEvent.HashExchange, async (clientid, data) => {
			const player = this.gameConnection?.players.get(clientid);

			const logger = createLogger({
				event: GameEvent.HashExchange,
				data,
				player,
				myRoundData: this.myRoundData
			});

			if (!player) {
				logger.error('Received message from player not in dictionary (!?)');
				return;
			}

			if (!player.active) {
				logger.warn('Received message from inactive player');
				return;
			}

			// will throw exception if cast fails
			const fullServerData: HashExchangeData = HashExchangeDataSchema.cast(data);

			if (this.myRoundData?.roundIndex !== fullServerData.roundIndex) {
				logger.error('Error: received data from different round');
				return;
			}

			if (player.roundData?.roundIndex !== this.myRoundData?.roundIndex) {
				logger.error('Error: round data not created on round start or client roundindex off');
				return;
			}

			if (player.roundData.nonce !== fullServerData.serverObject.result.nonce) {
				// TODO: this should be an error toast, not just in the console (discrepancy here indicates cheating)
				logger.error('Error: previously received nonce does not match server nonce for player');
				return;
			}

			// verify the signature
			if (
				!(await verifyServer(
					fullServerData.serverObject.result,
					fullServerData.serverObject.signature
				))
			) {
				// TODO: this should be an error toast, not just in the console (discrepancy here indicates cheating)
				logger.error('Error: cannot verify server signature on data received from player ');
				return;
			}

			player.roundData.hash = fullServerData.serverObject.result.hash;
			this.myRoundData.allHashes.push(fullServerData.serverObject.result.hash);
		});

		this.gameConnection.on(GameEvent.RoundReady, (clientid, data) => {
			const player = this.gameConnection?.players.get(clientid);

			const logger = createLogger({
				event: GameEvent.RoundReady,
				data,
				player,
				myRoundData: this.myRoundData
			});

			if (!player) {
				logger.error('Received message from player not in dictionary (!?)');
				return;
			}

			if (!player.active) {
				logger.warn('Received message from inactive player');
				return;
			}

			const readyData = RoundReadyDataSchema.cast(data);

			if (this.myRoundData?.roundIndex !== readyData.roundIndex) {
				logger.error('Error: received data from different round');
				return;
			}
		});
	}

	public roundStart(): void {
		this.myRoundData = new RoundData(this.myRoundData?.roundIndex ?? 1, 5, 4);
	}
}

/**
 * Represents the data for a round of the game.
 */
export class RoundData {
	diceCount: number;
	diceSides: number;
	roundIndex: number;

	// used just to store, not utilized by validation or generation
	nonce?: string;
	hash?: string;

	// used by dice generation
	secret?: string;
	allHashes: string[] = [];

	// stores the (supposed) current dice rolls
	// call `rollDice()` to fill this array
	// call `validate()` to check if the values in this array are legitimate
	dice: number[] = [];

	/**
	 * Creates a new instance of the `RoundData` class.
	 * @param diceCount The number of dice (for each player) in the round.
	 * @param diceSides The number of sides on each dice.
	 */
	constructor(roundIndex: number, diceCount: number, diceSides: number) {
		this.roundIndex = roundIndex;
		this.diceCount = diceCount;
		this.diceSides = diceSides;
	}

	/**
	 * Generates an array of random dice rolls.
	 * @returns A promise that resolves to an array of numbers representing the dice rolls.
	 */
	private async generateDiceRolls(): Promise<number[]> {
		if (!this.secret || !this.hash || this.allHashes.length === 0) return [];

		const combined = JSON.stringify({
			secret: this.secret,
			allHashes: this.allHashes.sort()
		});
		const rng = await seededRandom(combined);
		return new Array(this.diceCount).fill(0).map(() => (rng.random() % this.diceSides) + 1);
	}

	/**
	 * Rolls the dice and assigns the generated dice rolls to the `dice` property.
	 * @returns A promise that resolves when the dice rolls are generated.
	 */
	public async rollDice(): Promise<void> {
		this.dice = await this.generateDiceRolls();
	}

	/**
	 * Validates the game state.
	 * @returns A promise that resolves to a boolean indicating whether the game state is valid.
	 */
	public async validate(): Promise<boolean> {
		if (!this.secret || !this.hash || this.dice.length === 0) return false;

		const trueDice = await this.generateDiceRolls();
		return this.dice.every((d, i) => d === trueDice[i]);
	}
}
