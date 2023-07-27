<script async script lang="ts">
  import { signInWithPopup, signOut, type User } from "firebase/auth";
  import { auth, getSearchResults, provider, uploadFiles } from "./lib/util";

  let user: User | null = null;
  auth.onAuthStateChanged((u) => (user = u));

  let files: FileList;
  $: files && uploadFiles(files);

  let query: string = "";

  let results: string[] = [];
</script>

<main>
  <h1>semantic search</h1>

  <!-- AUTH stuff -->
  <section>
    {#if user}
      <p>user: {user.displayName}</p>
      <img src={user.photoURL} alt={user.displayName} />
      <button on:click={() => signOut(auth)}>sign out</button>
    {:else}
      <button on:click={() => signInWithPopup(auth, provider)}>sign in</button>
    {/if}
  </section>

  <button on:click={() => getSearchResults(query)}>test</button>

  <!-- Search bar -->
  <section>
    <input type="text" bind:value={query} />
    <button on:click={() => console.log(query)}>search</button>

    {#if user}
      <input bind:files accept=".txt,.jpg,.png" multiple type="file" />
    {/if}
  </section>

  <!-- Search results -->
  <section>
    <ul>
      {#each results as result}
        <li>{result}</li>
      {/each}
    </ul>
  </section>
</main>
