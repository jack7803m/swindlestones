<script lang="ts">
	import DiceNumbers from './DiceNumbers.svelte';

	import { rollDice } from '$lib/dice';
	import type { DiceRequest } from '$lib/types';

	const diceCount = 5;
	const diceSides = 4;

	let dice: DiceRequest;

	async function roll() {
		dice = await rollDice(diceCount, diceSides);
	}
</script>

<div class="space-y-5 variant-filled-surface card p-4">
	<button class="btn variant-filled w-full" on:click={roll}>Roll</button>
	<DiceNumbers {dice} {diceCount} />
</div>
