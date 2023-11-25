<script lang="ts">
	import type { DiceRequest } from '$lib/types';

	export let diceCount: number;
	export let dice: DiceRequest;
	let rolls: number[] = [];

	$: {
		if (dice) {
			rolls = dice.result.rolls;
		} else {
			rolls = Array(diceCount).fill(0);
		}
	}
</script>

<p>
	Result:
	{#each rolls as roll}
		<p class="chip {dice ? 'variant-ghost-primary' : 'variant-filled-error'} mx-2">
			{roll}
		</p>
	{/each}
</p>
