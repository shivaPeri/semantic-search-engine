<script lang="ts">
	export let file: any | null = null; // id of file in firestore
	console.log(file);
</script>

<section>
	<h2>file preview</h2>

	{#if file != null}
		{#if file.type == 'image'}
			<img src={file.url} alt={file.name} />
		{/if}
		<p>{file.description}</p>
	{/if}
</section>
