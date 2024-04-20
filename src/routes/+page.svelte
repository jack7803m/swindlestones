<script lang="ts">
	import DiceRoller from '$lib/DiceRoller.svelte';
	import { gameConnection } from '$lib/stores';
	import { GameEvent } from '$lib/types';
	import { getToastStore } from '@skeletonlabs/skeleton';
	
	let lobbyName: string = '';

	let textToSend: string;
	let selectedClient: string;

	const toastStore = getToastStore();

	$: connected = $gameConnection.ready();

	function create() {
		$gameConnection.connect(true);
	}

	function join() {
		$gameConnection.connect(true, lobbyName);
	}

	function sendText() {
		if (!selectedClient) {
			toastStore.trigger({
				message: 'No client selected'
			});
			return;
		}

		// $gameConnection.send(selectedClient, GameEvent.RoundStart, textToSend);
	}

	function broadcast() {
		// $gameConnection.broadcast(GameEvent.RoundStart, textToSend);
	}
</script>

<div class="container h-full mx-auto flex flex-col justify-center items-center gap-10">
	<div class="card variant-filled-surface space-x-2 p-4 flex relative">
		<button class="btn variant-filled" on:click={create}>Create</button>
		<div class="flex flex-col">
			<button class="btn variant-filled" on:click={join}>Connect</button>
			<input
				type="text"
				bind:value={lobbyName}
				class="input p-2"
				placeholder="Lobby to join (leave empty to create)"
			/>
		</div>
	</div>
	<div class="card variant-filled-surface space-y-2 p-4">
		<button
			class="btn variant-filled w-full"
			on:click={sendText}
			disabled={!connected || !selectedClient}>Send</button
		>
		<button class="btn variant-filled w-full" on:click={broadcast} disabled={!connected}
			>Broadcast</button
		>

		<select class="input p-2" bind:value={selectedClient} disabled={!connected}>
			{#each $gameConnection.players.keys() as c}
				<option value={c}>{c}</option>
			{/each}
		</select>

		<input
			type="text"
			bind:value={textToSend}
			class="input p-2"
			placeholder="Text to send"
			disabled={!connected}
		/>
	</div>
	<DiceRoller />
</div>
