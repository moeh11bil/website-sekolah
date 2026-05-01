<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount, getContext } from 'svelte';
  import { auth } from '$lib/stores';
  import { API_URL } from '$lib/config';
  import type { Readable } from 'svelte/store';

  const siteName = getContext<Readable<string>>('siteNameStore');

  let username = '';
  let password = '';
  let errorMessage: string | null = null;
  let successMessage: string | null = null;
  let loading = false;
  let isCheckingAuth = true;

  onMount(() => {
    if (localStorage.getItem('logoutSuccess') === 'true') {
        successMessage = 'Anda telah berhasil logout.';
        localStorage.removeItem('logoutSuccess');
        setTimeout(() => { successMessage = null; }, 3000);
    }
    auth.subscribe((state) => {
      if (state.isAuthenticated) {
        goto(`/dashboard/${state.user?.role}`);
        return;
      }
      isCheckingAuth = false;
    });
  });

  async function handleLogin() {
    loading = true;
    errorMessage = null;
    successMessage = null;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        successMessage = 'Login berhasil! Mengalihkan...';
        setTimeout(() => {
            auth.login(data.user, data.token);
            goto(`/dashboard/${data.user.role}`);
        }, 1500);
      } else {
        errorMessage = data.message || 'Login failed. Please check your credentials.';
      }
    } catch (error) {
      console.error('Login error:', error);
      errorMessage = 'Network error or server unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - {$siteName}</title>
</svelte:head>

{#if isCheckingAuth}
  <div class="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gradient-to-br from-primary-50 to-white p-4">
    <div class="flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p class="text-primary-700">Memeriksa status login...</p>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gradient-to-br from-primary-50 to-white p-4">
    <div class="bg-gradient-to-br from-white to-primary-50 p-8 rounded-2xl shadow-xl w-full max-w-md border border-primary-100">
      <div class="text-center mb-8">
        <div class="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-primary-800">Selamat Datang Kembali</h1>
        <p class="text-primary-600 mt-2">Silakan masuk ke akun Anda</p>
      </div>

      {#if errorMessage}
        <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      {/if}

      {#if successMessage}
        <div class="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      {/if}

      <form on:submit|preventDefault={handleLogin}>
        <div class="mb-5">
          <label for="username" class="block text-gray-700 text-sm font-semibold mb-2">Username</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              id="username"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={username}
              placeholder="Masukkan username Anda"
              required
            />
          </div>
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              id="password"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={password}
              placeholder="Masukkan password Anda"
              required
            />
          </div>
        </div>
        <div class="mb-4">
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            disabled={loading}
          >
            {#if loading}
              <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </div>
            {:else}
              Masuk
            {/if}
          </button>
        </div>
        <div class="text-center">
          <p class="text-gray-600 text-sm">Belum punya akun? Hubungi administrator untuk akses.</p>
        </div>
      </form>
    </div>
  </div>
{/if}
