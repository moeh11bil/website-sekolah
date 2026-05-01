<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount, getContext } from 'svelte';
  import { page } from '$app/stores';
  import type { Writable } from 'svelte/store';
  import type { User } from '../../../../../+layout.svelte';
  import { API_URL } from '$lib/config';

  const userStore = getContext<Writable<User | null>>('userStore');

  let userId: number;
  let username = '';
  let full_name = '';
  let role = '';
  let newPassword = ''; // Optional new password
  let errorMessage: string | null = null;
  let successMessage: string | null = null;
  let loading = false;
  let token: string | null = null;

  onMount(async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token = storedToken;
      userId = parseInt($page.params.id);
      if (isNaN(userId)) {
        errorMessage = 'Invalid User ID.';
        loading = false;
        return;
      }
      await fetchUserDetails(userId);
    } else {
      goto('/login');
    }
  });

  async function fetchUserDetails(id: number) {
    if (!token) return;
    loading = true;
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      const user = users.find((u: any) => String(u.id) === String(id));

      if (user) {
        username = user.username;
        full_name = user.full_name || '';
        role = user.role;
      } else {
        errorMessage = 'User not found.';
      }
    } catch (e: any) {
      if (!errorMessage) {
        errorMessage = e.message || 'Failed to fetch user details.';
      }
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    loading = true;
    errorMessage = null;
    successMessage = null;

    if (!token) {
      errorMessage = 'No authentication token found. Please log in again.';
      loading = false;
      return;
    }

    try {
      const body: { username: string; full_name: string; role: string; password?: string } = { username, full_name, role };
      if (newPassword) {
        body.password = newPassword;
      }

      // Using the same endpoint as in the users list page
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      if (response.ok) {
        successMessage = data.message || 'User updated successfully!';
        newPassword = ''; // Clear password field after successful update

        // Redirect to users list after 1.5 seconds
        setTimeout(() => {
          goto('/dashboard/admin/users');
        }, 1500);
      } else {
        errorMessage = data.message || 'Failed to update user.';
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      errorMessage = 'Network error or server unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Pengguna - Dashboard Admin</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6 max-w-2xl">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Edit Pengguna</h2>

  <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">
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

    {#if loading && !username}
      <div class="flex justify-center items-center h-64">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p class="text-primary-700">Memuat detail pengguna...</p>
        </div>
      </div>
    {:else if !username && !loading}
      <div class="bg-primary-50 border border-primary-100 text-primary-700 px-4 py-8 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg">Pengguna tidak ditemukan.</p>
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-6">
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
              placeholder="Masukkan username"
              required
            />
          </div>
        </div>

        <div class="mb-6">
          <label for="full_name" class="block text-gray-700 text-sm font-semibold mb-2">Nama Lengkap</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              id="full_name"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={full_name}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>
        </div>

        <div class="mb-6">
          <label for="newPassword" class="block text-gray-700 text-sm font-semibold mb-2">Password Baru (kosongkan jika tidak diubah)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              id="newPassword"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={newPassword}
              placeholder="Masukkan password baru (kosongkan jika tidak diubah)"
            />
          </div>
        </div>

        <div class="mb-8">
          <label for="role" class="block text-gray-700 text-sm font-semibold mb-2">Role</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <select
              id="role"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={role}
              required
            >
              <option value="student">Siswa</option>
              <option value="teacher">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="submit"
            class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            disabled={loading}
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memperbarui...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Perbarui Pengguna
            {/if}
          </button>
          <a href="/dashboard/admin/users" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg shadow transition-all duration-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Batal
          </a>
        </div>
      </form>
    {/if}
  </div>
</div>
