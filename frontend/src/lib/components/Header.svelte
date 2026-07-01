<script lang="ts">
  import { getContext } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import type { Writable } from 'svelte/store';
  import type { User, SchoolInfo } from '$lib/types';
  import { API_URL, getImageUrl } from '$lib/config';

  const user = getContext<Writable<User | null>>('userStore');
  const schoolInfoStore = getContext<Writable<SchoolInfo | null>>('schoolInfoStore');

  let schoolData: SchoolInfo | null = null;
  let unsubscribe: (() => void) | null = null;
  let currentPath = '';

  async function fetchSchoolInfo() {
    if (!browser) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/public/school-info`);
      if (response.ok) {
        const data = await response.json();
        schoolData = data;
        schoolInfoStore.set(data);
      }
    } catch (e) {
      console.error('Failed to fetch school info', e);
    }
  }

  onMount(() => {
    unsubscribe = schoolInfoStore.subscribe(value => {
      schoolData = value;
    });
    if ($page.url) {
      currentPath = $page.url.pathname;
    }
  });

  $: if (browser && schoolInfoStore && !schoolData) {
    fetchSchoolInfo();
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  let showLogoutModal = false;

  function confirmLogout() {
    showLogoutModal = true;
    mobileMenuOpen = false;
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('logoutSuccess', 'true');
    if (user) {
      user.set(null);
    }
    window.location.href = '/login';
  }

  let isScrolled = false;

  function handleScroll() {
    isScrolled = window.scrollY > 20;
  }

  let mobileMenuOpen = false;
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  $: if (currentPath) {
    mobileMenuOpen = false;
  }

  function isActive(currentPath: string, targetPath: string): boolean {
    const current = currentPath.replace(/\/$/, '') || '/';
    const target = targetPath.replace(/\/$/, '') || '/';
    
    if (target === '/') {
      return current === '/';
    }
    
    return current === target || current.startsWith(target + '/');
  }
</script>

<header class="text-white p-4 sticky top-0 z-50 transition-all duration-300 {isScrolled ? 'bg-primary-700/30 backdrop-blur-lg' : 'bg-primary-700 shadow-lg'}">
  <nav class="container mx-auto flex justify-between items-center">
    {#if schoolData}
      <a href="/" class="text-xl md:text-2xl font-bold tracking-tight flex items-center">
        {#if schoolData.logo_url}
          <img
            src={getImageUrl(schoolData.logo_url)}
            alt={schoolData.school_name || 'Logo'}
            width="32"
            height="32"
            fetchpriority="high"
            decoding="async"
            class="w-8 h-8 rounded-full mr-2 object-contain border border-white"
          />
        {:else}
          <span class="bg-white text-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">S</span>
        {/if}
        <span class="truncate max-w-[150px] sm:max-w-none">{schoolData.school_name || 'Sekolah Modern'}</span>
      </a>
    {:else}
      <a href="/" class="text-xl md:text-2xl font-bold tracking-tight flex items-center">
        <span class="bg-white text-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">S</span>
        Sekolah Modern
      </a>
    {/if}

    <!-- Mobile Menu Button -->
    <button 
      on:click={toggleMobileMenu}
      class="lg:hidden p-2 rounded-md hover:bg-primary-800 focus:outline-none transition-colors"
      aria-label="Toggle menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {#if mobileMenuOpen}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        {/if}
      </svg>
    </button>

    <!-- Desktop Navigation -->
    <ul class="hidden lg:flex space-x-6 items-center">
      <li>
        <a href="/" 
           class="hover:text-primary-100 transition-colors duration-200 border-b-2 {isActive($page.url.pathname, '/') ? 'border-white text-white' : 'border-transparent text-primary-50'}">
          Beranda
        </a>
      </li>
      <li>
        <a href="/tentang-kami" 
           class="hover:text-primary-100 transition-colors duration-200 border-b-2 {isActive($page.url.pathname, '/tentang-kami') ? 'border-white text-white' : 'border-transparent text-primary-50'}">
          Tentang Kami
        </a>
      </li>
      <li>
        <a href="/blog" 
           class="hover:text-primary-100 transition-colors duration-200 border-b-2 {isActive($page.url.pathname, '/blog') ? 'border-white text-white' : 'border-transparent text-primary-50'}">
          Blog
        </a>
      </li>
      <li>
        <a href="/galeri" 
           class="hover:text-primary-100 transition-colors duration-200 border-b-2 {isActive($page.url.pathname, '/galeri') ? 'border-white text-white' : 'border-transparent text-primary-50'}">
          Galeri
        </a>
      </li>
      {#if $user}
        <li>
          <a href="/dashboard/{$user.role}" 
             class="hover:text-primary-100 transition-colors duration-200 border-b-2 {isActive($page.url.pathname, '/dashboard') ? 'border-white text-white' : 'border-transparent text-primary-50'} capitalize">
            Dashboard
          </a>
        </li>
        <li>
          <button on:click={confirmLogout} class="bg-primary-800 hover:bg-primary-900 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
            Logout
          </button>
        </li>
      {:else}
        <li>
          <a href="/login" class="bg-white text-primary-700 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
            Login
          </a>
        </li>
      {/if}
    </ul>
  </nav>

  <!-- Mobile Navigation Overlay -->
  {#if mobileMenuOpen}
    <div class="lg:hidden absolute top-full left-0 w-full bg-primary-700 shadow-xl border-t border-primary-500 animate-in slide-in-from-top duration-200">
      <ul class="flex flex-col p-4 space-y-4">
        <li>
          <a href="/" class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Beranda
          </a>
        </li>
        <li>
          <a href="/tentang-kami" class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/tentang-kami') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Tentang Kami
          </a>
        </li>
        <li>
          <a href="/blog" class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/blog') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Blog
          </a>
        </li>
        <li>
          <a href="/galeri" class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/galeri') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Galeri
          </a>
        </li>
        {#if $user}
          <li>
            <a href="/dashboard/{$user.role}" class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/dashboard') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors capitalize">
              Dashboard {$user.role}
            </a>
          </li>
          <li>
            <button on:click={confirmLogout} class="w-full text-left py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
              Logout
            </button>
          </li>
        {:else}
          <li>
            <a href="/login" class="block py-2 px-4 rounded-lg bg-white text-primary-700 text-center font-bold hover:bg-primary-50 transition-colors">
              Login
            </a>
          </li>
        {/if}
      </ul>
    </div>
  {/if}

  {#if showLogoutModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Konfirmasi Logout</h2>
        <p class="text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari akun Anda?</p>
        <div class="flex space-x-4">
          <button on:click={() => showLogoutModal = false} class="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium">Batal</button>
          <button on:click={handleLogout} class="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold">Logout</button>
        </div>
      </div>
    </div>
  {/if}
</header>
