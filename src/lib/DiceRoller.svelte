<script lang="ts">
	import DiceNumbers from './DiceNumbers.svelte';

	import { rollDice } from '$lib/dice';
	import type { DiceRequest } from '$lib/types';

	const diceCount = 5;

	let dice: DiceRequest;
	let rolls: number[] = [];

	$: {
		if (dice) {
			rolls = dice.result.rolls;
		} else {
			rolls = Array(diceCount).fill(0);
		}
	}

	async function roll() {
		dice = await rollDice(diceCount);
	}
</script>

<div class="space-y-5 variant-filled-surface card p-4">
	<button class="btn variant-filled w-full" on:click={roll}>Roll</button>
	<DiceNumbers {dice} />
</div>
