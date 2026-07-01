<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { browser } from '$app/environment';
  import { themes, applyTheme } from '$lib/theme';
  import { API_URL } from '$lib/config';
  import { auth } from '$lib/stores';

  let selectedTheme = 'emerald';
  let themeNames = Object.keys(themes);
  let isClient = false;
  let loading = true;
  let error: string | null = null;
  let isAdmin = false;

  // Get the user context and check role
  onMount(async () => {
    if (browser) {
      isClient = true;

      try {
        const currentUser = get(auth).user;
        if (!currentUser) {
          window.location.href = '/login';
          return;
        }

        if (currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }

        isAdmin = true;

        // Load current theme from server
        try {
          const response = await fetch(`${API_URL}/api/admin/theme`, {
            headers: {
              'Authorization': `Bearer ${get(auth).token || ''}`
            }
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Redirect to login if unauthorized
              window.location.href = '/login';
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          selectedTheme = data.theme || 'emerald';

          // Apply the theme
          const theme = themes[selectedTheme];
          applyTheme(theme);

          // Update DOM attribute
          const root = document.documentElement;
          root.setAttribute('data-theme', selectedTheme);
        } catch (e: any) {
          // If theme fetch fails, try to continue with default
          console.error("Error loading theme, using default:", e);

          // Apply default theme
          const theme = themes[selectedTheme];
          applyTheme(theme);

          // Update DOM attribute
          const root = document.documentElement;
          root.setAttribute('data-theme', selectedTheme);
        } finally {
          loading = false;
        }
      } catch (e) {
        console.error("Error in component initialization:", e);
        loading = false;
      }
    }
  });

  async function changeTheme(themeName: string) {
    if (!browser) return; // Only run in browser

    // Verify user is admin using stored data
    if (!isAdmin) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/theme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get(auth).token || ''}`
        },
        body: JSON.stringify({ theme: themeName })
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      selectedTheme = themeName;
      const theme = themes[themeName];
      applyTheme(theme);

      // Update semua komponen di halaman
      const root = document.documentElement;
      root.setAttribute('data-theme', themeName);
    } catch (e: any) {
      error = e.message;
      console.error("Error changing theme:", e);
    }
  }
</script>

<div class="max-w-4xl mx-auto">
  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Pengaturan Tema</h1>
    
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Pilih Tema Warna</h2>
      <p class="text-gray-600 mb-6">Pilih tema warna yang akan diterapkan ke seluruh situs.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each themeNames as themeName, i}
          <div
            role="button"
            tabindex="0"
            class="border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            class:border-2={selectedTheme === themeName}
            class:border-primary-500={selectedTheme === themeName}
            on:click={() => changeTheme(themeName)}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                changeTheme(themeName);
              }
            }}
          >
            <div class="flex items-center mb-3">
              <div
                class="w-5 h-5 rounded-full mr-2 border"
                style="background-color: {themes[themeName].primary.DEFAULT};"
              ></div>
              <span class="font-medium text-gray-800">{themes[themeName].name}</span>
            </div>

            <div class="flex space-x-2">
              <div
                class="w-6 h-6 rounded-full border"
                style="background-color: {themes[themeName].primary[500]};"
              ></div>
              <div
                class="w-6 h-6 rounded-full border"
                style="background-color: {themes[themeName].primary[300]};"
              ></div>
              <div
                class="w-6 h-6 rounded-full border"
                style="background-color: {themes[themeName].accent[500]};"
              ></div>
              <div
                class="w-6 h-6 rounded-full border"
                style="background-color: {themes[themeName].accent[300]};"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 class="font-medium text-gray-800 mb-2">Pratinjau Tema</h3>
      <p class="text-gray-600 text-sm mb-4">Contoh elemen dengan tema yang dipilih:</p>
      
      <div class="space-y-3">
        <div class="p-3 rounded bg-primary-100 text-primary-800 border border-primary-200">
          Contoh elemen dengan warna utama
        </div>
        <button class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors">
          Contoh tombol utama
        </button>
        <div class="p-3 rounded bg-accent-100 text-accent-800 border border-accent-200">
          Contoh elemen dengan warna aksen
        </div>
      </div>
    </div>
  </div>
</div>