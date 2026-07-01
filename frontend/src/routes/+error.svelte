<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Halaman Tidak Ditemukan</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
  <div class="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mb-8">
    <span class="text-5xl font-bold text-primary-600">404</span>
  </div>
  <h1 class="text-3xl md:text-4xl font-bold text-primary-800 mb-4">Halaman Tidak Ditemukan</h1>
  <p class="text-lg text-gray-600 mb-8 max-w-md">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
  <a href="/" class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105">
    Kembali ke Beranda
  </a>
</div>
