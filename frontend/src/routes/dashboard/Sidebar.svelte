<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores';

  let expandedSections: Record<string, boolean> = {
    system: false,
    website: false,
    gallery: false,
    posts: false
  };

  // Variable to toggle the entire sidebar on mobile
  let showMobileMenu = false;

  function toggleSection(section: string) {
    expandedSections[section] = !expandedSections[section];
  }

  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }

  // Reactive role for sidebar logic
  $: currentRole = $auth.user?.role;

  // Auto-expand sections based on current path
  $: {
    const path = $page.url.pathname;
    if (path.includes('/admin/users') || path.includes('/admin/categories')) expandedSections.system = true;
    if (path.includes('/admin/header') || path.includes('/admin/about') || path.includes('/admin/school-info') || path.includes('/admin/theme') || path.includes('/admin/quick-links') || path.includes('/admin/staff-testimonials')) expandedSections.website = true;
    if (path.includes('/admin/gallery')) expandedSections.gallery = true;
    if (path.includes('/dashboard/posts')) expandedSections.posts = true;
  }
</script>

<aside class="w-full lg:w-64 bg-white lg:bg-gradient-to-b lg:from-white lg:to-primary-50 p-4 rounded-2xl shadow-lg border border-primary-100 mb-6 lg:mb-0 transition-all duration-300">
  <!-- Mobile Toggle Button -->
  <button 
    on:click={toggleMobileMenu}
    class="lg:hidden w-full flex items-center justify-between py-2 px-4 bg-primary-600 text-white rounded-xl mb-2 shadow-md"
  >
    <span class="flex items-center font-bold">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      {showMobileMenu ? 'Sembunyikan Menu' : 'Tampilkan Menu Dashboard'}
    </span>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform duration-300 {showMobileMenu ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <div class="{showMobileMenu ? 'block' : 'hidden'} lg:block">
    <h2 class="hidden lg:flex text-lg font-semibold text-primary-700 mb-6 items-center px-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      Navigasi Cepat
    </h2>

    <div class="space-y-3">
      {#if currentRole === 'admin'}
        <!-- System Management -->
        <div class="border-b border-primary-50 lg:border-none pb-2 lg:pb-0">
          <button
            on:click={() => toggleSection('system')}
            class="w-full flex items-center justify-between py-2 px-3 rounded-lg {expandedSections.system ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-50'} font-medium transition-colors duration-200"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manajemen Sistem
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 {expandedSections.system ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {#if expandedSections.system}
            <ul class="mt-1 ml-6 space-y-1 border-l-2 border-primary-200 pl-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <li>
                <a href="/dashboard/admin/users" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/users' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Pengguna
                </a>
              </li>
              <li>
                <a href="/dashboard/admin/categories" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/categories' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Kategori
                </a>
              </li>
            </ul>
          {/if}
        </div>

        <!-- Website Settings -->
        <div class="border-b border-primary-50 lg:border-none pb-2 lg:pb-0">
          <button
            on:click={() => toggleSection('website')}
            class="w-full flex items-center justify-between py-2 px-3 rounded-lg {expandedSections.website ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-50'} font-medium transition-colors duration-200"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Pengaturan Website
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 {expandedSections.website ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {#if expandedSections.website}
            <ul class="mt-1 ml-6 space-y-1 border-l-2 border-primary-200 pl-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <li>
                <a href="/dashboard/admin/header" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/header' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Header Beranda
                </a>
              </li>
              <li>
                <a href="/dashboard/admin/about" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/about' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="/dashboard/admin/school-info" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/school-info' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Info Sekolah
                </a>
              </li>
              <li>
                <a href="/dashboard/admin/theme" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/theme' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Pengaturan Tema
                </a>
              </li>
              <li>
                <a href="/dashboard/admin/quick-links" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/quick-links' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102 1.101" />
                  </svg>
                  Layanan Digital
                </a>
              </li>
              <li>
                <a href="/dashboard/admin/staff-testimonials" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/staff-testimonials' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Testimoni Guru & Stap
                </a>
              </li>
            </ul>
          {/if}
        </div>

        <!-- Gallery Management -->
        <div class="border-b border-primary-50 lg:border-none pb-2 lg:pb-0">
          <button
            on:click={() => toggleSection('gallery')}
            class="w-full flex items-center justify-between py-2 px-3 rounded-lg {expandedSections.gallery ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-50'} font-medium transition-colors duration-200"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Kelola Galeri
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 {expandedSections.gallery ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {#if expandedSections.gallery}
            <ul class="mt-1 ml-6 space-y-1 border-l-2 border-primary-200 pl-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <li>
                <a href="/dashboard/admin/gallery" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/gallery' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Semua Galeri
                </a>
              </li>
              <li>
                <a href="/dashboard/admin/gallery-pending" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/admin/gallery-pending' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Menunggu Review
                </a>
              </li>
            </ul>
          {/if}
        </div>
      {/if}

      {#if currentRole}
        <!-- Posts Section -->
        <div class="border-b border-primary-50 lg:border-none pb-2 lg:pb-0">
          <button
            on:click={() => toggleSection('posts')}
            class="w-full flex items-center justify-between py-2 px-3 rounded-lg {expandedSections.posts ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-50'} font-medium transition-colors duration-200"
          >
            <span class="flex items-center text-left">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manajemen Postingan
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 {expandedSections.posts ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {#if expandedSections.posts}
            <ul class="mt-1 ml-6 space-y-1 border-l-2 border-primary-200 pl-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <li>
                <a href="/dashboard/posts/create" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/posts/create' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tulis Baru
                </a>
              </li>
              <li>
                <a href="/dashboard/posts/my-posts" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/posts/my-posts' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Postingan Saya
                </a>
              </li>
              {#if currentRole === 'admin'}
                <li>
                  <a href="/dashboard/posts/pending" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/posts/pending' ? 'bg-primary-500 text-white shadow-sm' : 'hover:bg-primary-50 text-gray-600'} transition-colors duration-200 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Persetujuan
                  </a>
                </li>
              {/if}
            </ul>
          {/if}
        </div>
      {/if}

      {#if currentRole === 'teacher' || currentRole === 'student'}
        <div class="pt-2">
          <a href="/dashboard/gallery" class="flex items-center w-full text-left py-2 px-3 rounded-lg truncate {$page.url.pathname === '/dashboard/gallery' ? 'bg-primary-500 text-white shadow-sm' : 'bg-primary-50 hover:bg-primary-100 text-primary-700'} transition-colors duration-200 text-sm font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Galeri Saya
          </a>
        </div>
      {/if}
    </div>
  </div>
</aside>

<style>
  /* Menghilangkan scrollbar tapi tetap bisa di-scroll */
  .animate-in {
    animation-duration: 0.3s;
  }
</style>
