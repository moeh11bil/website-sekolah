<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { API_URL } from '$lib/config';
  import type { Readable } from 'svelte/store';
  import { auth } from '$lib/stores';
  import { get } from 'svelte/store';

  const siteName = getContext<Readable<string>>('siteNameStore');

  interface QuickLink {
    id: number;
    title: string;
    url: string;
    icon?: string;
  }

  let links: QuickLink[] = [];
  let title = '';
  let url = '';
  let editingId: number | null = null;
  let loading = true;
  let successMessage = '';
  let errorMessage = '';
  let showDeleteModal = false;
  let linkToDelete: number | null = null;

  async function fetchLinks() {
    try {
      const res = await fetch(`${API_URL}/api/quick-links`);
      if (res.ok) links = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (!title || !url) {
      errorMessage = 'Nama dan URL wajib diisi';
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `${API_URL}/api/quick-links/${editingId}` : `${API_URL}/api/quick-links`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get(auth).token}`
        },
        body: JSON.stringify({ title, url })
      });

      if (res.ok) {
        successMessage = editingId ? 'Layanan berhasil diperbarui' : 'Layanan berhasil ditambahkan';
        title = '';
        url = '';
        editingId = null;
        errorMessage = '';
        fetchLinks();
        
        // Clear success message after 3 seconds
        setTimeout(() => { successMessage = ''; }, 3000);
      } else {
        const data = await res.json();
        errorMessage = data.message || 'Gagal menyimpan data';
      }
    } catch (e) {
      console.error(e);
      errorMessage = 'Terjadi kesalahan pada server';
    }
  }

  function startEdit(link: QuickLink) {
    editingId = link.id;
    title = link.title;
    url = link.url;
    errorMessage = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    editingId = null;
    title = '';
    url = '';
    errorMessage = '';
  }

  function confirmDelete(id: number) {
    linkToDelete = id;
    showDeleteModal = true;
  }

  async function deleteLinkConfirm() {
    if (!linkToDelete) return;
    showDeleteModal = false;

    try {
      const res = await fetch(`${API_URL}/api/quick-links/${linkToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${get(auth).token}`
        }
      });
      if (res.ok) {
        successMessage = 'Layanan berhasil dihapus';
        fetchLinks();
        setTimeout(() => { successMessage = ''; }, 3000);
      }
    } catch (e) {
      console.error(e);
    }
    linkToDelete = null;
  }

  function cancelDelete() {
    showDeleteModal = false;
    linkToDelete = null;
  }

  onMount(() => {
    const user = get(auth).user;
    if (!user || user.role !== 'admin') {
      goto('/login');
      return;
    }
    fetchLinks();
  });
</script>

<div class="max-w-4xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Manajemen Layanan Digital</h1>
  </div>

  {#if successMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
      <span class="block sm:inline">{successMessage}</span>
    </div>
  {/if}

  {#if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <span class="block sm:inline">{errorMessage}</span>
    </div>
  {/if}

  <!-- Form Tambah/Edit -->
  <div class="bg-white p-6 rounded-xl shadow-md mb-8 border border-primary-100">
    <h2 class="text-lg font-semibold mb-4 text-primary-700">
      {editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}
    </h2>
    <form on:submit|preventDefault={handleSubmit}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="title">Nama Layanan</label>
          <input id="title" type="text" bind:value={title} placeholder="Contoh: Perpustakaan Digital" 
                 class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="url">URL Layanan</label>
          <input id="url" type="url" bind:value={url} placeholder="https://..." 
                 class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button type="submit" 
                class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md">
          {editingId ? 'Perbarui Layanan' : 'Simpan Layanan'}
        </button>
        {#if editingId}
          <button type="button" on:click={cancelEdit}
                  class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-all shadow-md">
            Batal
          </button>
        {/if}
      </div>
    </form>
  </div>

  <!-- Daftar Link -->
  <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    <table class="w-full text-left">
      <thead class="bg-primary-50">
        <tr>
          <th class="px-6 py-3 text-sm font-bold text-primary-700 uppercase">Nama Layanan</th>
          <th class="px-6 py-3 text-sm font-bold text-primary-700 uppercase">URL</th>
          <th class="px-6 py-3 text-sm font-bold text-primary-700 uppercase">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#if loading}
          <tr><td colspan="3" class="px-6 py-4 text-center">Memuat data...</td></tr>
        {:else if links.length === 0}
          <tr><td colspan="3" class="px-6 py-4 text-center">Belum ada layanan digital.</td></tr>
        {:else}
          {#each links as link}
            <tr class="hover:bg-gray-50 transition-colors {editingId === link.id ? 'bg-primary-50' : ''}">
              <td class="px-6 py-4 font-medium text-gray-800">{link.title}</td>
              <td class="px-6 py-4 text-sm text-primary-600 truncate max-w-xs">
                <a href={link.url} target="_blank" rel="noopener noreferrer" class="hover:underline">{link.url}</a>
              </td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <button on:click={() => startEdit(link)}
                          class="bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button on:click={() => confirmDelete(link.id)}
                          class="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

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
        <p class="text-gray-600 text-center mb-6">Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div class="flex flex-col sm:flex-row sm:justify-center gap-3">
          <button
            on:click={cancelDelete}
            class="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
          >
            Batal
          </button>
          <button
            on:click={deleteLinkConfirm}
            class="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition-colors duration-200"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
