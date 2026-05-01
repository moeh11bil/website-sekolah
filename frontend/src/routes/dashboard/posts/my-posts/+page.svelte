<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Writable } from 'svelte/store';
  import type { User as UserType } from '../../../+layout.svelte';
  import { API_URL } from '$lib/config';

  const user = getContext<Writable<UserType | null>>('userStore');

  interface Post {
    id: number;
    title: string;
    status: 'draft' | 'pending_approval' | 'published';
    created_at: string;
    author?: string; // Only for admin
  }

  let posts: Post[] = [];
  let loading = true;
  let error: string | null = null;
  let token: string | null = null;
  let currentUserRole: string | null = null;

  onMount(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token = storedToken;
      currentUserRole = JSON.parse(storedUser).role;
      fetchMyPosts();
    } else {
      goto('/login');
    }
  });

  async function fetchMyPosts() {
    if (!token) return;
    loading = true;
    error = null;
    try {
      const response = await fetch(`${API_URL}/api/posts/my-posts`, {
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
      posts = await response.json();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function deletePost(id: number) {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
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

      posts = posts.filter(p => p.id !== id);
      alert('Postingan berhasil dihapus.');
    } catch (e: any) {
      error = e.message;
      alert(`Gagal menghapus postingan: ${e.message}`);
    }
  }
</script>

<svelte:head>
  <title>Postingan Saya - Dashboard</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Postingan Saya</h2>

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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-lg">Anda belum memiliki postingan.</p>
      <a href="/dashboard/posts/create" class="mt-4 inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200">
        Buat Postingan Pertama
      </a>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-primary-100">
      <table class="min-w-full">
        <thead class="bg-primary-50">
          <tr>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">ID</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Judul</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Status</th>
            {#if currentUserRole === 'admin'}
              <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Penulis</th>
            {/if}
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Dibuat</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-100">
          {#each posts as post}
            <tr class="hover:bg-primary-50 transition-colors duration-150">
              <td class="py-3 px-4 text-gray-700">{post.id}</td>
              <td class="py-3 px-4 text-gray-700 font-medium">{post.title}</td>
              <td class="py-3 px-4">
                {#if post.status === 'draft'}
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                    {post.status}
                  </span>
                {:else if post.status === 'pending_approval'}
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium capitalize">
                    {post.status}
                  </span>
                {:else if post.status === 'published'}
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                    {post.status}
                  </span>
                {/if}
              </td>
              {#if currentUserRole === 'admin'}
                <td class="py-3 px-4 text-gray-600">{post.author}</td>
              {/if}
              <td class="py-3 px-4 text-gray-600">{new Date(post.created_at).toLocaleDateString()}</td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <a href="/dashboard/posts/edit/{post.id}" class="bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </a>
                  <button on:click={() => deletePost(post.id)} class="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
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
  {/if}
</div>
