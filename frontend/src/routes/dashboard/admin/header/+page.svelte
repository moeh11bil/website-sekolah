<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { API_URL, getImageUrl } from '$lib/config';
  import { auth } from '$lib/stores';

  interface HeaderConfig {
    id: number;
    title: string;
    subtitle: string;
    image_url: string | null;
    cta_text: string;
    cta_link: string;
    status: 'active' | 'inactive';
  }

  let header: HeaderConfig | null = null;
  let loading = true;
  let error: string | null = null;
  let successMessage: string | null = null;
  let title = '';
  let subtitle = '';
  let cta_link = '';
  let status: 'active' | 'inactive' = 'active';
  let token: string | null = null;
  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = null;

  onMount(async () => {
    const storedToken = get(auth).token;
    const currentUser = get(auth).user;
    
    if (!storedToken || !currentUser) {
      goto('/login');
      return;
    }
    
    if (currentUser.role !== 'admin') {
      goto('/dashboard');
      return;
    }
    
    token = storedToken;
    await fetchHeaderData();
  });

  async function fetchHeaderData() {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/header`, {
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

      const data = await response.json();
      if (data) {
        header = data;
        title = data.title || '';
        subtitle = data.subtitle || '';
        cta_link = data.cta_link || '';
        status = data.status || 'active';
      }
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(selectedImage);
    } else {
      selectedImage = null;
      imagePreviewUrl = null;
    }
  }

  async function handleSubmit() {
    if (!token) return;
    
    successMessage = null;
    error = null;
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('cta_link', cta_link);
      formData.append('status', status);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_URL}/api/admin/header`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      successMessage = 'Konfigurasi header berhasil disimpan!';
      await fetchHeaderData();
    } catch (e: any) {
      error = e.message || 'Terjadi kesalahan saat menyimpan data';
    }
  }
</script>

<svelte:head>
  <title>Manajemen Header Beranda - Dashboard Admin</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Manajemen Header Beranda</h2>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-primary-700">Memuat konfigurasi header...</p>
      </div>
    </div>
  {:else}
    <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">
      {#if error}
        <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
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

      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-6">
          <label for="title" class="block text-gray-700 text-sm font-semibold mb-2">Judul Header</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <input
              type="text"
              id="title"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={title}
              placeholder="Masukkan judul header"
              required
            />
          </div>
        </div>

        <div class="mb-6">
          <label for="subtitle" class="block text-gray-700 text-sm font-semibold mb-2">Subjudul</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <textarea
              id="subtitle"
              class="block w-full pl-10 pr-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-32"
              bind:value={subtitle}
              placeholder="Masukkan subjudul header..."
            ></textarea>
          </div>
        </div>


        <div class="mb-6">
          <label for="cta_link" class="block text-gray-700 text-sm font-semibold mb-2">Link Pendaftaran</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="text"
              id="cta_link"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={cta_link}
              placeholder="https://pendaftaran.sekolah.sch.id"
            />
          </div>
        </div>

        <div class="mb-6">
          <label for="status" class="block text-gray-700 text-sm font-semibold mb-2">Status</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <select
              id="status"
              class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
              bind:value={status}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label for="image" class="block text-gray-700 text-sm font-semibold mb-2">Gambar Header</label>
          <div class="flex flex-col sm:flex-row sm:items-start gap-6">
            <!-- File input container -->
            <div class="flex-1">
              <div class="relative">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  on:change={handleImageChange}
                />
                <div class="p-6 border-2 border-dashed border-primary-200 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[120px]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p class="text-primary-700 font-medium">Pilih gambar atau seret ke sini</p>
                  <p class="text-gray-500 text-sm mt-1">JPG, PNG, GIF hingga 5MB</p>
                </div>
              </div>
              
              {#if selectedImage}
                <p class="mt-2 text-sm text-gray-600">
                  File dipilih: <span class="font-medium">{selectedImage.name}</span>
                </p>
              {/if}
            </div>
            
            <!-- Image preview -->
            {#if imagePreviewUrl || header?.image_url}
              <div class="sm:w-48 flex-shrink-0">
                <div class="rounded-xl overflow-hidden border border-primary-200 shadow-md bg-white">
                  <img 
                    src={imagePreviewUrl || getImageUrl(header?.image_url)} 
                    alt="Header Preview" 
                    loading="lazy"
                    decoding="async"
                    class="w-full h-48 object-cover" 
                  />
                  <div class="p-3 bg-gray-50">
                    <p class="text-xs text-gray-500 truncate">
                      {imagePreviewUrl ? selectedImage?.name : 'Gambar Saat Ini'}
                    </p>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="submit"
            class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>