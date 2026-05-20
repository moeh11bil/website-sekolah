<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { API_URL } from '$lib/config';
  import type { Readable } from 'svelte/store';

  const siteName = getContext<Readable<string>>('siteNameStore');

  import { getImageUrl } from '$lib/config';

  interface Post {
    id: number;
    title: string;
    content_snippet: string;
    author: string;
    category_name: string;
    published_at: string;
    image_url?: string | null;
  }

  interface Pagination {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    limit: number;
  }

  let posts: Post[] = [];
  let loading = true;
  let error: string | null = null;
  let pagination: Pagination | null = null;
  let searchTerm = '';
  let debouncedSearchTerm = '';
  let currentPage = 1;
  let searchTimeout: number | null = null;

  function handleSearchInput() {
    // Clear previous timeout
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
    }

    // Set new timeout for 300ms delay
    searchTimeout = window.setTimeout(() => {
      debouncedSearchTerm = searchTerm;
      currentPage = 1; // Reset to first page when search changes
      loadPosts();
    }, 300);
  }

  async function loadPosts() {
    loading = true;
    error = null;

    try {
      // Build URL with search parameter and pagination
      let url = `${API_URL}/api/posts?page=${currentPage}`;
      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        url += `&search=${encodeURIComponent(debouncedSearchTerm.trim())}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      posts = result.posts;
      pagination = result.pagination;
    } catch (e: any) {
      error = e.message;
      console.error('Error loading posts:', e);
    } finally {
      loading = false;
    }
  }

  async function goToPage(page: number) {
    if (pagination && page >= 1 && page <= pagination.totalPages && !loading) {
      currentPage = page;
      loadPosts();
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Function to generate page numbers with ellipsis for long pagination
  function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
    const delta = 2; // Number of pages to show around current page
    const paginationNumbers: (number | string)[] = [];

    // Always show first page
    if (totalPages <= 7) {
      // If there are 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        paginationNumbers.push(i);
      }
    } else {
      // Show first page, current page with context, and last page
      const left = Math.max(1, currentPage - delta);
      const right = Math.min(totalPages, currentPage + delta);

      if (left > 1) {
        paginationNumbers.push(1);
        if (left > 2) {
          paginationNumbers.push('...');
        }
      }

      for (let i = left; i <= right; i++) {
        paginationNumbers.push(i);
      }

      if (right < totalPages) {
        if (right < totalPages - 1) {
          paginationNumbers.push('...');
        }
        paginationNumbers.push(totalPages);
      }
    }

    return paginationNumbers;
  }

  onMount(() => {
    loadPosts();
  });
</script>

<svelte:head>
  <title>Blog - {$siteName}</title>
  <meta name="description" content="Baca artikel dan berita terbaru dari sekolah kami." />
</svelte:head>

<div class="max-w-6xl mx-auto">
  <header class="mb-12 text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-primary-800 mb-4">Blog Sekolah</h1>
    <p class="text-lg text-primary-600 max-w-2xl mx-auto">Baca artikel dan berita terbaru dari sekolah kami tentang pendidikan, kegiatan siswa, dan perkembangan akademik.</p>
    <div class="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full mt-4"></div>
  </header>

  <!-- Search Bar -->
  <div class="mb-10 max-w-2xl mx-auto">
    <div class="relative">
      <input
        type="text"
        placeholder="Cari artikel blog..."
        class="w-full px-6 py-4 pr-14 rounded-full border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md"
        bind:value={searchTerm}
        on:input={handleSearchInput}
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  </div>

  <section class="py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p class="text-primary-700">Memuat postingan blog...</p>
        </div>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <div class="inline-block bg-red-100 text-red-700 px-6 py-4 rounded-lg">
          <p>Terjadi kesalahan: {error}</p>
        </div>
      </div>
    {:else if posts.length === 0}
      <div class="text-center py-12">
        {#if debouncedSearchTerm}
          <div class="inline-block bg-primary-100 text-primary-700 px-6 py-4 rounded-lg">
            <p>Tidak ditemukan postingan blog untuk pencarian "<strong>{debouncedSearchTerm}</strong>".</p>
          </div>
        {:else}
          <div class="inline-block bg-primary-100 text-primary-700 px-6 py-4 rounded-lg">
            <p>Belum ada postingan blog yang diterbitkan.</p>
          </div>
        {/if}
      </div>
    {:else}
      {#if debouncedSearchTerm}
        <div class="mb-8 text-center">
          <p class="text-lg text-primary-700">Menemukan {pagination?.totalPosts} hasil untuk "<strong>{debouncedSearchTerm}</strong>"</p>
        </div>
      {/if}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each posts as post (post.id)}
          <a href="/blog/{post.id}" class="block bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-primary-100 overflow-hidden">
            {#if post.image_url}
              <div class="h-48 overflow-hidden">
                <img
                  src={getImageUrl(post.image_url)}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
              </div>
            {/if}
            <div class="p-6">
              <div class="flex justify-between items-start mb-3">
                <span class="text-xs font-semibold px-3 py-1 bg-primary-100 text-primary-700 rounded-full uppercase tracking-wider">
                  {post.category_name || 'Uncategorized'}
                </span>
                <span class="text-xs text-gray-500">{new Date(post.published_at).toLocaleDateString()}</span>
              </div>
              <h2 class="text-xl font-bold text-primary-800 mb-3 line-clamp-2">{post.title}</h2>
              <div class="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none">
                {@html post.content_snippet + '...'}
              </div>
              <div class="flex items-center pt-4 border-t border-primary-100">
                <div class="bg-primary-200 rounded-full w-8 h-8 flex items-center justify-center text-primary-700 font-bold mr-3">
                  {post.author.charAt(0)}
                </div>
                <span class="text-sm text-gray-600">Oleh: {post.author}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>

      <!-- Pagination Controls -->
      {#if pagination && pagination.totalPages > 1}
        <div class="mt-12 flex justify-center">
          <nav class="flex items-center space-x-1" aria-label="Pagination">
            {#if pagination?.hasPrevPage && pagination.prevPage !== null}
              <button
                on:click={() => goToPage(pagination.prevPage)}
                class="px-4 py-2 text-primary-700 bg-white border border-primary-200 rounded-l-lg hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}

            <!-- Page numbers -->
            {#each generatePageNumbers(pagination.currentPage, pagination.totalPages) as pageNum}
              {#if pageNum === '...'}
                <span class="px-4 py-2 text-gray-500">...</span>
              {:else}
                <button
                  on:click={() => goToPage(Number(pageNum))}
                  class:active={pageNum === pagination.currentPage}
                  class="px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {#if pageNum === pagination.currentPage}
                    <span class="font-bold text-primary-700 bg-primary-100 border-primary-300">{pageNum}</span>
                  {:else}
                    <span class="text-primary-700 hover:bg-primary-50 border-primary-200">{pageNum}</span>
                  {/if}
                </button>
              {/if}
            {/each}

            {#if pagination?.hasNextPage && pagination.nextPage !== null}
              <button
                on:click={() => goToPage(pagination.nextPage)}
                class="px-4 py-2 text-primary-700 bg-white border border-primary-200 rounded-r-lg hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}
          </nav>
        </div>
      {/if}
    {/if}
  </section>
</div>

<style>
  :global(.prose ul) {
    list-style-type: disc;
    padding-left: 1rem;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  :global(.prose ol) {
    list-style-type: decimal;
    padding-left: 1rem;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  :global(.prose li) {
    margin-top: 0.125rem;
    margin-bottom: 0.125rem;
  }
</style>
