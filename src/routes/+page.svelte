<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import { rollDice } from '$lib/dice';
	import type { DiceRequest } from '$lib/types';

	let dice: Promise<DiceRequest>;

	function roll() {
		dice = rollDice(5);
	}
</script>

<div class="container h-full mx-auto flex justify-center items-center space-x-10">
	<div class="space-y-5 variant-filled-surface card p-4">
		<button class="btn variant-filled w-full" on:click={roll}>Roll</button>
		{#if dice}
			<p>
				Result:
				{#await dice}
					<p>Rolling...</p>
				{:then result}
					{#each result.result.rolls as roll}
						<p class="chip variant-ghost-primary mx-2">
							{` ${roll} `}
						</p>
					{/each}
				{:catch error}
					<p>Error: {error.message}</p>
				{/await}
			</p>
		{/if}
	</div>
</div>
