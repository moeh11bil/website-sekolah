<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { API_URL, getImageUrl } from '$lib/config';
  import type { Readable } from 'svelte/store';

  const siteName = getContext<Readable<string>>('siteNameStore');

  interface GalleryItem {
    id: number;
    title: string;
    description: string;
    image_url: string;
    category: string;
    created_at: string;
  }

  let galleryItems: GalleryItem[] = [];
  let displayedItems: GalleryItem[] = [];
  let loading = true;
  let error: string | null = null;
  const itemsPerPage = 6;
  let currentPage = 0;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  function loadMoreItems() {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newItems = galleryItems.slice(startIndex, endIndex);

    displayedItems = [...displayedItems, ...newItems];
    currentPage++;
  }

  onMount(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/public/gallery`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      galleryItems = await response.json();

      // Load first set of items
      if (galleryItems.length > 0) {
        const initialItems = galleryItems.slice(0, itemsPerPage);
        displayedItems = initialItems;
        currentPage = 1;
      }
    } catch (e: any) {
      error = e.message || 'Terjadi kesalahan saat memuat galeri';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Galeri - {$siteName}</title>
  <meta name="description" content="Kumpulan foto dan video kegiatan sekolah." />
</svelte:head>

<div class="max-w-7xl mx-auto">
  <header class="mb-12 text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-primary-800 mb-4">Galeri Kami</h1>
    <p class="text-lg text-primary-600 max-w-2xl mx-auto">Lihat momen-momen terbaik dari kegiatan sekolah kami yang penuh makna dan kenangan.</p>
    <div class="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full mt-4"></div>
  </header>

  <section class="py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p class="text-primary-700">Memuat galeri...</p>
        </div>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <div class="inline-block bg-red-100 text-red-700 px-6 py-4 rounded-lg">
          <p>Terjadi kesalahan: {error}</p>
        </div>
      </div>
    {:else if galleryItems.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each displayedItems as item}
          <div class="group">
            <div class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl overflow-hidden border border-primary-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div class="relative overflow-hidden">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.title}
                  loading="lazy"
                  class="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div class="p-4 text-white">
                    <h3 class="font-bold text-lg">{item.title}</h3>
                    <p class="text-primary-200 text-sm">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </div>
              <div class="p-5">
                <h3 class="font-bold text-lg text-primary-800 mb-2">{item.title}</h3>
                <p class="text-gray-600">{item.description}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if displayedItems.length < galleryItems.length}
        <div class="text-center mt-12">
          <button
            class="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
            on:click={loadMoreItems}>
            Lihat Lebih Banyak
          </button>
        </div>
      {/if}
    {:else}
      <div class="text-center py-12">
        <div class="bg-primary-50 rounded-xl p-8 inline-block">
          <p class="text-lg text-primary-700">Belum ada galeri yang tersedia.</p>
          <p class="text-gray-600 mt-2">Galeri akan segera ditambahkan.</p>
        </div>
      </div>
    {/if}
  </section>
</div>
