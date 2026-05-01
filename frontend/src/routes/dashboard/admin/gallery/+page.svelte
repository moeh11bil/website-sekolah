<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { API_URL, getImageUrl } from '$lib/config';

  interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image_url: string;
    category: string;
    status: 'active' | 'inactive';
    created_at: string;
  }

  let items: GalleryItem[] = [];
  let loading = true;
  let error: string | null = null;
  let successMessage: string | null = null;
  let title = '';
  let description = '';
  let category = '';
  let status: 'active' | 'inactive' = 'active';
  let token: string | null = null;
  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = null;
  let editingItem: GalleryItem | null = null;

  onMount(async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken || !storedUser) {
      goto('/login');
      return;
    }
    
    const user = JSON.parse(storedUser);
    if (user.role !== 'admin') {
      goto('/dashboard');
      return;
    }
    
    token = storedToken;
    await fetchGalleryItems();
  });

  async function fetchGalleryItems() {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/gallery`, {
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

      items = await response.json();
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
      formData.append('description', description);
      formData.append('category', category);
      formData.append('status', status);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${API_URL}/api/admin/gallery/${editingItem.id}` : `${API_URL}/api/admin/gallery`;

      const response = await fetch(url, {
        method,
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
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      successMessage = editingItem ? 'Item galeri berhasil diperbarui!' : 'Item galeri baru berhasil ditambahkan!';
      
      // Reset form
      title = '';
      description = '';
      category = '';
      status = 'active';
      selectedImage = null;
      imagePreviewUrl = null;
      editingItem = null;
      
      await fetchGalleryItems();
    } catch (e: any) {
      error = e.message || 'Terjadi kesalahan saat menyimpan data';
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/gallery/${id}`, {
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

      successMessage = 'Item galeri berhasil dihapus!';
      await fetchGalleryItems();
    } catch (e: any) {
      error = e.message || 'Terjadi kesalahan saat menghapus data';
    }
  }

  function startEdit(item: GalleryItem) {
    editingItem = item;
    title = item.title;
    description = item.description;
    category = item.category;
    status = item.status;
    imagePreviewUrl = null;
    selectedImage = null;
  }

  function cancelEdit() {
    editingItem = null;
    title = '';
    description = '';
    category = '';
    status = 'active';
    selectedImage = null;
    imagePreviewUrl = null;
  }
</script>

<svelte:head>
  <title>Manajemen Galeri - Dashboard Admin</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6 max-w-6xl">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Manajemen Galeri</h2>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-primary-700">Memuat item galeri...</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form Section -->
      <div class="lg:col-span-1">
        <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">
          <h3 class="text-lg font-bold text-primary-800 mb-4">
            {editingItem ? 'Edit Item Galeri' : 'Tambah Item Galeri Baru'}
          </h3>

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
            <div class="mb-4">
              <label for="title" class="block text-gray-700 text-sm font-semibold mb-2">Judul</label>
              <input
                type="text"
                id="title"
                class="block w-full px-3 py-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
                bind:value={title}
                placeholder="Masukkan judul"
                required
              />
            </div>

            <div class="mb-4">
              <label for="category" class="block text-gray-700 text-sm font-semibold mb-2">Kategori</label>
              <input
                type="text"
                id="category"
                class="block w-full px-3 py-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
                bind:value={category}
                placeholder="Kategori galeri"
              />
            </div>

            <div class="mb-4">
              <label for="description" class="block text-gray-700 text-sm font-semibold mb-2">Deskripsi</label>
              <textarea
                id="description"
                class="block w-full px-3 py-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-24"
                bind:value={description}
                placeholder="Deskripsi gambar..."
              ></textarea>
            </div>

            <div class="mb-4">
              <label for="status" class="block text-gray-700 text-sm font-semibold mb-2">Status</label>
              <select
                id="status"
                class="block w-full px-3 py-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
                bind:value={status}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            <div class="mb-6">
              <label for="image" class="block text-gray-700 text-sm font-semibold mb-2">Gambar</label>
              <div class="relative">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  on:change={handleImageChange}
                />
                <div class="p-4 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-200 cursor-pointer text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p class="text-primary-700 text-sm font-medium">Pilih gambar atau seret ke sini</p>
                  <p class="text-gray-500 text-xs mt-1">JPG, PNG, GIF hingga 5MB</p>
                </div>
              </div>
              
              {#if selectedImage}
                <p class="mt-2 text-sm text-gray-600">
                  File dipilih: <span class="font-medium">{selectedImage.name}</span>
                </p>
              {/if}
            </div>
            
            <!-- Image preview -->
            {#if imagePreviewUrl}
              <div class="mb-4 rounded-lg overflow-hidden border border-primary-200 shadow-md bg-white">
                <img 
                  src={imagePreviewUrl} 
                  alt="Preview" 
                  class="w-full h-32 object-cover" 
                />
              </div>
            {/if}

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <button
                type="submit"
                class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {editingItem ? 'Perbarui' : 'Simpan'}
              </button>
              
              {#if editingItem}
                <button
                  type="button"
                  on:click={cancelEdit}
                  class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Batal
                </button>
              {/if}
            </div>
          </form>
        </div>
      </div>

      <!-- Gallery Items List -->
      <div class="lg:col-span-2">
        <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">
          <h3 class="text-lg font-bold text-primary-800 mb-4">Daftar Item Galeri</h3>
          
          {#if items.length === 0}
            <div class="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-600">Belum ada item galeri yang ditambahkan.</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {#each items as item (item.id)}
                <div class="border border-primary-100 rounded-lg overflow-hidden shadow-md bg-white">
                  <div class="h-32 overflow-hidden">
                    <img 
                      src={getImageUrl(item.image_url)} 
                      alt={item.title} 
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="p-4">
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="font-bold text-gray-800 truncate">{item.title}</h4>
                        <p class="text-xs text-gray-500">{item.category || 'Tidak ada kategori'}</p>
                      </div>
                      <span class={`text-xs px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                    
                    <p class="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                    
                    <div class="flex gap-2 mt-3">
                      <button 
                        on:click={() => startEdit(item)}
                        class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button 
                        on:click={() => deleteItem(item.id)}
                        class="text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded transition-colors duration-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>