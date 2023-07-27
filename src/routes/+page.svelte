<script async script lang="ts">
	import '../app.css';

	import { signInWithPopup, signOut, type User } from 'firebase/auth';
	import { auth, getSearchResults, provider, uploadFiles } from '$lib/util';
	import { get } from 'svelte/store';
	import FilePreview from '../components/filePreview.svelte';

	let user: User | null = null;
	auth.onAuthStateChanged((u) => (user = u));

	let files: FileList;
	let uploadingStatus: Promise<number>;
	$: files && (() => (uploadingStatus = uploadFiles(files)))();

	let input: string = '';
	let query: string = '';

	let results: object[];
	$: results && console.log(results);

	let selectedFile: any = { id: '' };
</script>

<!-- AUTH stuff -->
<section>
	<div class="flex p-3 gap-3">
		{#if user}
			<button on:click={() => signOut(auth)}>sign out</button>
			<p>{user.displayName}</p>
		{:else}
			<button on:click={() => signInWithPopup(auth, provider)}>sign in</button>
		{/if}
	</div>
</section>

<main class="mx-auto max-w-[800px] mt-20 gap-5 grid">
	<h1 class="text-4xl">semantic search</h1>

	<!-- Upload files -->
	{#if user}
		<div>
			<input bind:files type="file" accept=".txt,.jpg,.png" multiple />
			{#await uploadingStatus}
				...uploading
			{:then progress}
				done
			{/await}
		</div>
	{/if}

	<!-- Search bar -->
	<section>
		<div class="grid grid-cols-[5fr_1fr]">
			<input type="text" bind:value={input} />
			<button on:click={() => (query = input)}>search</button>
		</div>
	</section>

	<!-- Search results -->
	<section>
		{#await getSearchResults(query)}
			<p>...loading</p>
		{:then results}
			<div class="grid grid-cols-2">
				<div>
					<h2>{query === '' ? 'files' : 'results'}</h2>
					<ul>
						{#each results as result}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<li
								class={`hover:text-blue-500 ${selectedFile.id == result.id ? 'text-red-500' : ''}`}
								on:click={() => (selectedFile = result)}
							>
								{result.name}
							</li>
						{/each}
					</ul>
				</div>
				<FilePreview file={selectedFile} />
			</div>
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</section>
</main>
