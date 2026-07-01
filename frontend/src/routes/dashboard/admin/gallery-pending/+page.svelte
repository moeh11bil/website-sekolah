<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { User } from '$lib/types';
  import { API_URL, getImageUrl } from '$lib/config';
  import { auth } from '$lib/stores';

  interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image_url: string;
    category: string;
    status: 'active' | 'inactive';
    created_by: number;
    created_at: string;
    updated_at: string;
    username: string; // added by JOIN query
  }

  const userStore = getContext<Writable<User | null>>('userStore');
  let galleryItems: GalleryItem[] = [];
  let loading = true;
  let error: string | null = null;
  let currentUser: User | null = null;

  async function loadGalleryItems() {
    try {
      const response = await fetch(`${API_URL}/api/admin/gallery`, {
        headers: {
          'Authorization': `Bearer ${get(auth).token || ''}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const items = await response.json();
      // Filter only inactive items (pending approval)
      galleryItems = items.filter((item: GalleryItem) => item.status === 'inactive');
    } catch (e: any) {
      error = e.message;
      console.error("Error loading gallery items:", e);
    } finally {
      loading = false;
    }
  }

  async function approveGallery(id: number) {
    try {
      const response = await fetch(`${API_URL}/api/admin/gallery/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${get(auth).token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Remove the approved item from the list
      galleryItems = galleryItems.filter(item => item.id !== id);
      
      alert('Galeri berhasil disetujui dan diaktifkan');
    } catch (e: any) {
      error = e.message;
      alert("Gagal menyetujui galeri: " + e.message);
      console.error("Error approving gallery:", e);
    }
  }

  async function rejectGallery(id: number) {
    try {
      const response = await fetch(`${API_URL}/api/admin/gallery/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${get(auth).token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Remove the rejected item from the list
      galleryItems = galleryItems.filter(item => item.id !== id);
      
      alert('Galeri berhasil ditolak dan dinonaktifkan');
    } catch (e: any) {
      error = e.message;
      alert("Gagal menolak galeri: " + e.message);
      console.error("Error rejecting gallery:", e);
    }
  }

  onMount(async () => {
    if (browser) {
      try {
        currentUser = get(userStore);
        
        if (!currentUser || currentUser.role !== 'admin') {
          window.location.href = '/login';
          return;
        }
        
        await loadGalleryItems();
      } catch (e) {
        console.error("Component initialization error:", e);
        loading = false;
      }
    }
  });
</script>

<div class="max-w-6xl mx-auto">
  <h1 class="text-2xl font-bold text-gray-800 mb-6">Galeri Menunggu Persetujuan</h1>
  
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-primary-700">Memuat galeri menunggu persetujuan...</p>
      </div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <div class="inline-block bg-red-100 text-red-700 px-6 py-4 rounded-lg">
        <p>Terjadi kesalahan: {error}</p>
      </div>
    </div>
  {:else if galleryItems.length === 0}
    <div class="text-center py-12">
      <div class="inline-block bg-primary-100 text-primary-700 px-6 py-4 rounded-lg">
        <p>Tidak ada galeri menunggu persetujuan.</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each galleryItems as item (item.id)}
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {#if item.image_url}
            <img 
              src={getImageUrl(item.image_url)} 
              alt={item.title}
              loading="lazy"
              decoding="async"
              class="w-full h-48 object-cover"
            />
          {:else}
            <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span class="text-gray-500">No Image</span>
            </div>
          {/if}
          
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-800 mb-1">{item.title}</h3>
            <p class="text-sm text-gray-600 mb-2">Oleh: {item.username}</p>
            <p class="text-gray-700 text-sm mb-3">{item.description}</p>
            <p class="text-xs text-gray-500 mb-4">Kategori: {item.category || 'Umum'}</p>
            <p class="text-xs text-gray-500">Dibuat: {new Date(item.created_at).toLocaleDateString()}</p>
            
            <div class="flex space-x-2 mt-4">
              <button 
                on:click={() => approveGallery(item.id)}
                class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Setujui
              </button>
              <button 
                on:click={() => rejectGallery(item.id)}
                class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>