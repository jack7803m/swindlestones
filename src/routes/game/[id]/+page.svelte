<script lang="ts">
	import { page } from '$app/stores';
	import { host } from "$lib/connection";

	$: console.log($page.params.id);

	host.connect();
</script>
