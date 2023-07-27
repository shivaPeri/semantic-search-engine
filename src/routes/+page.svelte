<script async script lang="ts">
	import '../app.css';

	import { signInWithPopup, signOut, type User } from 'firebase/auth';
	import { auth, getSearchResults, provider, uploadFile } from '$lib/util';
	import FilePreview from '../components/filePreview.svelte';

	let user: User | null = null;
	auth.onAuthStateChanged((u) => (user = u));

	let files: FileList;
	let uploadingStatus: number = 100;
	$: files &&
		(() => {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				// iteratatively upload files so that we can have a progress indicator
				uploadFile(file).then(() => (uploadingStatus = ((i + 1) / files.length) * 100));
			}
		})();

	let input: string = '';
	let query: string = '';

	$: resultsPromise = getSearchResults(query);

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
			{#if uploadingStatus < 100}
				<p>uploading... {uploadingStatus}%</p>
			{:else}
				<p>upload complete</p>
			{/if}
		</div>
	{/if}

	<!-- Search bar -->
	<section>
		<div class="grid grid-cols-[5fr_1fr]">
			<input type="text" bind:value={input} />
			<button
				on:click={() => {
					if (input === '') {
						resultsPromise = getSearchResults(query);
					} else {
						query = input;
					}
				}}>search</button
			>
		</div>
	</section>

	<!-- Search results -->
	<section>
		{#await resultsPromise}
			<p>...loading</p>
		{:then results}
			<div class="grid grid-cols-2">
				<div>
					<h2>{query === '' ? 'files' : 'results'}</h2>
					<ul class="overflow-auto h-[500px]">
						{#each results as result, i}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<li
								class={`hover:text-blue-500 ${
									selectedFile.id == result.id ? 'text-blue-500 font-bold' : ''
								}`}
								on:click={() => (selectedFile = result)}
							>
								{i}. {result.name}
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
