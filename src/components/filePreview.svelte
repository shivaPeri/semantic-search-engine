<script lang="ts">
	export let file: any | null = null; // id of file in firestore
	console.log(file);
</script>

<section>
	<h2>file preview</h2>

	{#if file != null}
		<p class="text-sm mb-3">{file.description}</p>
		{#if file.type == 'image'}
			<img src={file.url} alt={file.name} />
		{:else}
			<a class="text-sm hover:underline" href={file.url}>source link</a>
		{/if}
	{/if}
</section>
