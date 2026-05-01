<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Writable } from 'svelte/store';
  import type { User as UserType } from '../../../+layout.svelte';
  import { API_URL } from '$lib/config';

  const user = getContext<Writable<UserType | null>>('userStore');

  interface User {
    id: number;
    username: string;
    full_name: string;
    role: string;
  }

  let users: User[] = [];
  let loading = true;
  let error: string | null = null;
  let token: string | null = null;
  let showDeleteModal = false;
  let userToDelete: number | null = null;

  onMount(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token = storedToken;
      fetchUsers();
    } else {
      goto('/login');
    }
  });

  async function fetchUsers() {
    if (!token) return;
    loading = true;
    error = null;
    try {
      const response = await fetch(`${API_URL}/api/users?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login'); // Unauthorized or forbidden, redirect to login
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
      }
      users = data;
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function confirmDelete(id: number) {
    userToDelete = id;
    showDeleteModal = true;
  }

  async function deleteUser() {
    if (!userToDelete || !token) return;
    showDeleteModal = false;

    try {
      const response = await fetch(`${API_URL}/api/users/${userToDelete}`, {
        method: 'DELETE',
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

      users = users.filter(u => u.id !== userToDelete);
      error = null; // Clear any previous error
    } catch (e: any) {
      error = e.message;
    }
    userToDelete = null;
  }

  function cancelDelete() {
    showDeleteModal = false;
    userToDelete = null;
  }
</script>

<svelte:head>
  <title>Manajemen Pengguna - Dashboard Admin</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
    <h2 class="text-2xl font-bold text-primary-800 mb-4 sm:mb-0">Manajemen Pengguna</h2>
    <a href="/dashboard/admin/users/create" class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Tambah Pengguna
    </a>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-primary-700">Memuat pengguna...</p>
      </div>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Error: {error}</span>
    </div>
  {:else if users.length === 0}
    <div class="bg-primary-50 border border-primary-100 text-primary-700 px-4 py-8 rounded-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-lg">Tidak ada pengguna yang terdaftar.</p>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-primary-100">
      <table class="min-w-full">
        <thead class="bg-primary-50">
          <tr>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">ID</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Username</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Nama Lengkap</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Role</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-100">
          {#each users as user}
            <tr class="hover:bg-primary-50 transition-colors duration-150">
              <td class="py-3 px-4 text-gray-700">{user.id}</td>
              <td class="py-3 px-4 text-gray-700 font-medium">{user.username}</td>
              <td class="py-3 px-4 text-gray-700">{user.full_name || '-'}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium capitalize">
                  {user.role}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <a href="/dashboard/admin/users/edit/{user.id}" class="bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </a>
                  <button on:click={() => confirmDelete(user.id)} class="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if} <!-- Penutup dari conditional utama: {#if loading}...{/if} -->

    <!-- Delete Confirmation Modal -->
    {#if showDeleteModal}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-primary-200">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-center text-gray-800 mb-2">Konfirmasi Penghapusan</h3>
          <p class="text-gray-600 text-center mb-6">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
          <div class="flex flex-col sm:flex-row sm:justify-center gap-3">
            <button
              on:click={cancelDelete}
              class="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              on:click={deleteUser}
              class="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition-colors duration-200"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    {/if} <!-- End of delete modal conditional -->

</div>
