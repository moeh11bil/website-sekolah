<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { API_URL } from '$lib/config';

  let categoryId: number;
  let originalName = ''; // Store original name for comparison
  let name = '';
  let slug = '';
  let errorMessage: string | null = null;
  let successMessage: string | null = null;
  let loading = false;
  let token: string | null = null;

  onMount(async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token = storedToken;
      categoryId = parseInt($page.params.id);
      if (isNaN(categoryId)) {
        errorMessage = 'Invalid Category ID.';
        loading = false;
        return;
      }
      await fetchCategoryDetails(categoryId);
    } else {
      goto('/login');
    }
  });

  // Generate slug from name
  function updateSlug() {
    if (name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim(); // Trim whitespace
    } else {
      slug = '';
    }
  }

  // Update slug when name changes (but not for the original name from the DB)
  $: if (name && name !== originalName) {
    updateSlug();
  }

  async function fetchCategoryDetails(id: number) {
    if (!token) return;
    loading = true;
    try {
      // Using the same endpoint structure as the category list page
      const response = await fetch(`${API_URL}/api/categories`, {
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

      const categories = await response.json();
      const category = categories.find((c: any) => c.id === id);

      if (category) {
        name = category.name;
        originalName = category.name; // Store original name
        slug = category.slug;
      } else {
        errorMessage = 'Kategori tidak ditemukan.';
      }
    } catch (e: any) {
      if (!errorMessage) {
        errorMessage = e.message || 'Failed to fetch category details.';
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
      // Using the same endpoint pattern as in the category list page
      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, slug }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      if (response.ok) {
        successMessage = data.message || 'Kategori berhasil diperbarui!';

        // Redirect to categories list after 1.5 seconds
        setTimeout(() => {
          goto('/dashboard/admin/categories');
        }, 1500);
      } else {
        errorMessage = data.message || 'Gagal memperbarui kategori.';
      }
    } catch (error: any) {
      console.error('Update category error:', error);
      errorMessage = 'Network error or server unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Kategori - Dashboard Admin</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6 max-w-2xl">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Edit Kategori</h2>

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

    {#if loading && !name}
      <div class="flex justify-center items-center h-64">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p class="text-primary-700">Memuat detail kategori...</p>
        </div>
      </div>
    {:else if !name && !loading}
      <div class="bg-primary-50 border border-primary-100 text-primary-700 px-4 py-8 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg">Kategori tidak ditemukan.</p>
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-6">
          <label for="name" class="block text-gray-700 text-sm font-semibold mb-2">Nama Kategori</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <input
              type="text"
              id="name"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={name}
              placeholder="Masukkan nama kategori"
              required
            />
          </div>
        </div>

        <div class="mb-8">
          <label for="slug" class="block text-gray-700 text-sm font-semibold mb-2">Slug</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="text"
              id="slug"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-gray-100 text-gray-600"
              bind:value={slug}
              placeholder="Slug akan diisi otomatis dari nama"
              readonly
            />
          </div>
          <p class="text-xs text-gray-500 mt-2">Slug akan diisi otomatis berdasarkan nama kategori. Hanya menggunakan huruf kecil, angka, dan tanda hubung (-)</p>
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
              Perbarui Kategori
            {/if}
          </button>
          <a href="/dashboard/admin/categories" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg shadow transition-all duration-200 flex items-center justify-center">
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
