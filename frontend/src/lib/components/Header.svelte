<script lang="ts">
  import { getContext } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import type { Writable } from 'svelte/store';
  import type { User, SchoolInfo } from '$lib/types';
  import { auth } from '$lib/stores';
  import { API_URL, getImageUrl } from '$lib/config';

  const user = getContext<Writable<User | null>>('userStore');
  const schoolInfoStore = getContext<Writable<SchoolInfo | null>>('schoolInfoStore');

  let schoolData: SchoolInfo | null = null;
  let unsubscribe: (() => void) | null = null;

  // Reactive: closes the mobile menu automatically whenever the route changes
  $: currentPath = $page.url.pathname;

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
    window.addEventListener('click', handleWindowClick);
    window.addEventListener('keydown', handleWindowKeydown);

    // Cleanup only runs in the browser (never during SSR render)
    return () => {
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('keydown', handleWindowKeydown);
    };
  });

  $: if (browser && schoolInfoStore && !schoolData) {
    fetchSchoolInfo();
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  const roleLabels: Record<User['role'], string> = {
    admin: 'Administrator',
    teacher: 'Guru',
    student: 'Siswa'
  };

  $: displayName = $user?.full_name || $user?.username || '';
  $: displayRole = $user ? roleLabels[$user.role] || $user.role : '';
  $: initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();

  let showLogoutModal = false;
  let userMenuOpen = false;
  let userMenuRef: HTMLElement | null = null;

  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
  }

  function closeUserMenu() {
    userMenuOpen = false;
  }

  // Close the user dropdown when clicking outside of it
  function handleWindowClick(event: MouseEvent) {
    if (userMenuOpen && userMenuRef && !userMenuRef.contains(event.target as Node)) {
      userMenuOpen = false;
    }
  }

  // Close the user dropdown with the Escape key
  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') userMenuOpen = false;
  }

  function confirmLogout() {
    showLogoutModal = true;
    mobileMenuOpen = false;
    userMenuOpen = false;
  }

  function handleLogout() {
    localStorage.setItem('logoutSuccess', 'true');
    auth.logout(); // clears localStorage + updates the auth store (user store follows)
    window.location.href = '/';
  }

  let isScrolled = false;

  function handleScroll() {
    isScrolled = window.scrollY > 20;
  }

  let mobileMenuOpen = false;
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  $: if (currentPath) {
    mobileMenuOpen = false;
    userMenuOpen = false;
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
        <li class="pl-5 border-l border-white/20 relative" bind:this={userMenuRef}>
          <button
            type="button"
            on:click={toggleUserMenu}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          >
            <span class="w-9 h-9 flex-shrink-0 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-xs font-bold text-white select-none" aria-hidden="true">
              {initials}
            </span>
            <span class="flex flex-col items-start leading-tight text-left min-w-0">
              <span class="text-sm font-semibold text-white max-w-[170px] truncate" title={displayName}>
                {displayName}
              </span>
              <span class="text-[11px] font-medium text-primary-200 capitalize">
                {displayRole}
              </span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary-200 transition-transform duration-200 {userMenuOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if userMenuOpen}
            <div role="menu" class="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
              <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 mb-1">
                <span class="w-10 h-10 flex-shrink-0 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold text-white select-none" aria-hidden="true">
                  {initials}
                </span>
                <div class="min-w-0 leading-tight">
                  <p class="text-sm font-semibold text-gray-900 truncate" title={displayName}>{displayName}</p>
                  <p class="text-xs text-gray-500 capitalize">{displayRole}</p>
                </div>
              </div>
              <a
                href="/dashboard/{$user.role}"
                on:click={closeUserMenu}
                role="menuitem"
                class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors capitalize"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </a>
              <button
                type="button"
                on:click={confirmLogout}
                role="menuitem"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          {/if}
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
          <a href="/" on:click={closeMobileMenu} class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Beranda
          </a>
        </li>
        <li>
          <a href="/tentang-kami" on:click={closeMobileMenu} class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/tentang-kami') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Tentang Kami
          </a>
        </li>
        <li>
          <a href="/blog" on:click={closeMobileMenu} class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/blog') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Blog
          </a>
        </li>
        <li>
          <a href="/galeri" on:click={closeMobileMenu} class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/galeri') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors">
            Galeri
          </a>
        </li>
        {#if $user}
          <li class="flex items-center gap-3 bg-primary-800/60 border border-white/10 rounded-lg px-4 py-3">
            <span class="w-9 h-9 flex-shrink-0 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-xs font-bold text-white select-none" aria-hidden="true">
              {initials}
            </span>
            <span class="min-w-0 leading-tight">
              <span class="block text-sm font-semibold text-white truncate" title={displayName}>{displayName}</span>
              <span class="block text-[11px] text-primary-200 capitalize">{displayRole}</span>
            </span>
          </li>
          <li>
            <a href="/dashboard/{$user.role}" on:click={closeMobileMenu} class="block py-2 px-4 rounded-lg {isActive($page.url.pathname, '/dashboard') ? 'bg-primary-800 text-white font-bold' : 'text-primary-100 hover:bg-primary-600'} transition-colors capitalize">
              Dashboard
            </a>
          </li>
          <li>
            <button on:click={confirmLogout} class="w-full text-left py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
              Logout
            </button>
          </li>
        {:else}
          <li>
            <a href="/login" on:click={closeMobileMenu} class="block py-2 px-4 rounded-lg bg-white text-primary-700 text-center font-bold hover:bg-primary-50 transition-colors">
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
