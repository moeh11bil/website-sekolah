<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest, getAuthHeaders } from '$lib/api';
  import { auth } from '$lib/stores';
  import { API_URL } from '$lib/config';
  import { get } from 'svelte/store';

  interface Post {
    id: number;
    title: string;
    status: 'draft' | 'pending_approval' | 'published';
    created_at: string;
    author: string;
  }

  let posts: Post[] = [];
  let loading = true;
  let error: string | null = null;
  let token: string | null = null;
  let currentUserRole: string | null = null;

  onMount(() => {
    const currentUser = get(auth);
    if (!currentUser.isAuthenticated || !currentUser.user) {
      goto('/login');
      return;
    }
    currentUserRole = currentUser.user.role;
    token = currentUser.token;
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
      error = 'Anda tidak memiliki izin untuk mengakses halaman ini.';
      loading = false;
      return;
    }
    fetchPendingPosts();
  });

  async function fetchPendingPosts() {
    if (!token) return;
    loading = true;
    error = null;
    try {
      const response = await apiRequest(`${API_URL}/api/posts/my-posts`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allPosts: Post[] = await response.json();
      posts = allPosts.filter(p => p.status === 'pending_approval');

    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  let showConfirmModal = false;
  let postToApprove: number | null = null;
  let modalMessage = '';

  function openConfirmModal(id: number) {
    postToApprove = id;
    modalMessage = 'Apakah Anda yakin ingin menyetujui dan mempublikasikan postingan ini?';
    showConfirmModal = true;
  }

  function closeConfirmModal() {
    showConfirmModal = false;
    postToApprove = null;
  }

  async function approvePost() {
    if (!postToApprove || !token) return;

    try {
      const response = await apiRequest(`${API_URL}/api/posts/${postToApprove}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      posts = posts.filter(p => p.id !== postToApprove);
      modalMessage = 'Postingan berhasil disetujui dan dipublikasikan.';
      setTimeout(() => {
        closeConfirmModal();
      }, 1500);
    } catch (e: any) {
      modalMessage = `Gagal menyetujui postingan: ${e.message}`;
    }
  }
</script>

<svelte:head>
  <title>Postingan Menunggu Persetujuan - Dashboard</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Postingan Menunggu Persetujuan</h2>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-primary-700">Memuat postingan...</p>
      </div>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Error: {error}</span>
    </div>
  {:else if posts.length === 0}
    <div class="bg-primary-50 border border-primary-100 text-primary-700 px-4 py-8 rounded-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-lg">Tidak ada postingan yang menunggu persetujuan.</p>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-primary-100">
      <table class="min-w-full">
        <thead class="bg-primary-50">
          <tr>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">ID</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Judul</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Penulis</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Dibuat</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-100">
          {#each posts as post}
            <tr class="hover:bg-primary-50 transition-colors duration-150">
              <td class="py-3 px-4 text-gray-700">{post.id}</td>
              <td class="py-3 px-4 text-gray-700 font-medium">{post.title}</td>
              <td class="py-3 px-4 text-gray-600">{post.author}</td>
              <td class="py-3 px-4 text-gray-600">{new Date(post.created_at).toLocaleDateString()}</td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <a href="/dashboard/posts/edit/{post.id}" class="bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat & Edit
                  </a>
                  <button on:click={() => openConfirmModal(post.id)} class="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Setujui
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if showConfirmModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold text-gray-800">Konfirmasi Persetujuan</h3>
          <button
            on:click={closeConfirmModal}
            class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mb-6">
          <p class="text-gray-700">{modalMessage}</p>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            on:click={closeConfirmModal}
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200"
          >
            Batal
          </button>
          <button
            on:click={approvePost}
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Setujui
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
