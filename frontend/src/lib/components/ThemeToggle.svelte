<script lang="ts">
  import { onMount } from 'svelte';
  import { themes, applyTheme, getCurrentTheme, saveCurrentTheme } from '$lib/theme';
  import { browser } from '$app/environment';

  let selectedTheme = 'emerald'; // default
  let themeNames = Object.keys(themes);

  onMount(() => {
    if (browser) {
      selectedTheme = getCurrentTheme();
      const theme = themes[selectedTheme];
      applyTheme(theme);
    }
  });

  function changeTheme(themeName: string) {
    selectedTheme = themeName;
    const theme = themes[themeName];
    applyTheme(theme);
    saveCurrentTheme(themeName);
    
    // Update semua komponen di halaman
    const root = document.documentElement;
    root.setAttribute('data-theme', themeName);
  }
</script>

<div class="flex items-center space-x-2">
  <span class="text-sm text-gray-600 mr-2">Tema:</span>
  {#each themeNames as themeName, i}
    <button
      on:click={() => changeTheme(themeName)}
      class="w-6 h-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
      class:border-2={selectedTheme === themeName}
      style="background-color: {themes[themeName].primary.DEFAULT};"
      aria-label="Ganti tema ke {themes[themeName].name}"
    />
  {/each}
</div>