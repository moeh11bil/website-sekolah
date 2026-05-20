<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { page } from '$app/stores';
  import { API_URL, getImageUrl } from '$lib/config';
  import type { Readable } from 'svelte/store';

  const siteName = getContext<Readable<string>>('siteNameStore');

  interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    category_name: string;
    published_at: string;
    image_url: string | null;
  }

  let post: Post | null = null;
  let loading = true;
  let error: string | null = null;

  $: postId = $page.params.id; // Get ID from URL parameters

  onMount(async () => {
    if (!postId) {
      error = 'Post ID is missing.';
      loading = false;
      return;
    }

    try {
      // Try to include authorization token if available
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      post = await response.json();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{post ? post.title : 'Post'} - {$siteName}</title>
  <meta name="description" content={post ? post.content.substring(0, 150) : 'Detail blog post'} />
</svelte:head>

<div class="max-w-4xl mx-auto">
  <section class="py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p class="text-primary-700">Memuat postingan...</p>
        </div>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <div class="inline-block bg-red-100 text-red-700 px-6 py-4 rounded-lg">
          <p>Terjadi kesalahan: {error}</p>
        </div>
      </div>
    {:else if post}
      <article class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-8 border border-primary-100">
        <div class="mb-6">
          <span class="text-xs font-semibold px-3 py-1 bg-primary-100 text-primary-700 rounded-full uppercase tracking-wider">
            {post.category_name || 'Uncategorized'}
          </span>
        </div>

        {#if post.image_url}
          <div class="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={getImageUrl(post.image_url)}
              alt={post.title}
              width="1200"
              height="768"
              loading="lazy"
              decoding="async"
              class="w-full h-64 md:h-96 object-cover"
            />
          </div>
        {/if}

        <h1 class="text-3xl md:text-4xl font-bold text-primary-800 mb-4">{post.title}</h1>

        <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-primary-100">
          <div class="flex items-center">
            <div class="bg-primary-200 rounded-full w-10 h-10 flex items-center justify-center text-primary-700 font-bold mr-3">
              {post.author.charAt(0)}
            </div>
            <div>
              <p class="text-gray-700 font-medium">Oleh: <span class="text-primary-700">{post.author}</span></p>
              <p class="text-sm text-gray-500">Dipublikasikan: {new Date(post.published_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {@html post.content}
        </div>

        <div class="mt-12 pt-8 border-t border-primary-100">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <a href="/blog" class="text-primary-600 hover:text-primary-800 font-medium">
              ← Kembali ke Blog
            </a>
          </div>
        </div>
      </article>
    {:else}
      <div class="text-center py-12">
        <div class="inline-block bg-primary-100 text-primary-700 px-6 py-4 rounded-lg">
          <p>Postingan tidak ditemukan.</p>
        </div>
      </div>
    {/if}
  </section>
</div>

<style>
  :global(.prose ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  :global(.prose ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  :global(.prose li) {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
</style>
