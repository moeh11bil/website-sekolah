<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { writable, derived, type Writable, type Readable } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { themes, applyTheme, getCurrentTheme } from '$lib/theme';
  import { API_URL } from '$lib/config';
  import type { User, AboutPage, SchoolInfo } from '$lib/types';
  import "../app.css";

  // 1. Create the stores here in the root layout
  const user = writable<User | null>(null);
  const aboutData = writable<AboutPage | null>(null);
  const schoolInfo = writable<SchoolInfo | null>(null);

  // Derived store for site name (for titles)
  const siteName = derived(schoolInfo, ($schoolInfo) => {
    return $schoolInfo?.school_name || 'Sekolah Modern';
  });

  // 2. Set the stores in the context for all children to use
  setContext<Writable<User | null>>('userStore', user);
  setContext<Writable<AboutPage | null>>('aboutStore', aboutData);
  setContext<Writable<SchoolInfo | null>>('schoolInfoStore', schoolInfo);
  setContext<Readable<string>>('siteNameStore', siteName);

  // Function to handle logout
  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    user.set(null);
    aboutData.set(null);
    goto('/login');
  }

  // Apply theme on mount
  onMount(async () => {
    // Apply theme if in browser
    if (browser) {
      let themeName = getCurrentTheme(); // default to localStorage

      // Try to get theme from server
      try {
        const response = await fetch(`${API_URL}/api/admin/public/theme`);
        if (response.ok) {
          const data = await response.json();
          themeName = data.theme || themeName; // use server theme if available
        }
        // If the server request fails, we'll continue with the localStorage theme
      } catch (e) {
        console.error("Failed to fetch theme from server, using local storage", e);
        // Continue with localStorage theme
      }

      // Apply the theme
      const theme = themes[themeName] || themes['emerald'];
      applyTheme(theme);

      // Update DOM attribute
      const root = document.documentElement;
      root.setAttribute('data-theme', themeName);
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user.set(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Fetch about page data
    try {
      const response = await fetch(`${API_URL}/api/admin/public/about`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.status === 'active') {
          aboutData.set(data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch about page data", e);
    }

    // Fetch school info data
    try {
      const response = await fetch(`${API_URL}/api/admin/public/school-info`);
      if (response.ok) {
        const data = await response.json();
        schoolInfo.set(data);
      }
    } catch (e) {
      console.error("Failed to fetch school info data", e);
    }
  });
</script>

<svelte:head>
  <title>{$siteName}</title>
</svelte:head>

<div class="flex flex-col min-h-screen font-sans bg-gradient-to-b from-gray-50 to-white">
  <Header />
  <main class="flex-grow container mx-auto p-4 max-w-7xl">
    <slot />
  </main>
  <Footer />
</div>