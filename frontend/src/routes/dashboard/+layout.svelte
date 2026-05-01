<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores';
  import Sidebar from './Sidebar.svelte';

  $: currentRole = $auth.user?.role;

  // Cek autentikasi secara reaktif
  $: if (!$auth.isAuthenticated && typeof window !== 'undefined') {
    goto('/login');
  }
</script>

<div class="container mx-auto p-4 md:p-8 bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-xl mt-6 mb-8">
  {#if currentRole}
    <div class="flex items-center mb-8">
      <div class="bg-primary-100 p-3 rounded-xl mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <div>
        <h1 class="text-3xl md:text-4xl font-bold text-primary-800 capitalize">Dashboard {currentRole}</h1>
        <p class="text-primary-600">Kelola konten dan aktivitas Anda sebagai {currentRole}</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <Sidebar />
      <div class="w-full lg:w-3/4 bg-gradient-to-b from-white to-primary-50 p-6 rounded-2xl shadow-lg border border-primary-100">
        <slot />
      </div>
    </div>
  {:else}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="ml-4 text-primary-600">Memuat...</p>
    </div>
  {/if}
</div>
