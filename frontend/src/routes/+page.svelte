<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { API_URL, getImageUrl, formatLinkUrl } from '$lib/config';
  import StaffTestimonialCarousel from '$lib/components/StaffTestimonialCarousel.svelte';
  import type { Readable } from 'svelte/store';

  const siteName = getContext<Readable<string>>('siteNameStore');

  interface HeaderConfig {
    title: string;
    subtitle: string;
    image_url: string | null;
    cta_link: string;
    status: 'active' | 'inactive';
  }

  interface QuickLink {
    id: number;
    title: string;
    url: string;
    icon?: string;
  }

  let headerData: HeaderConfig | null = null;
  let quickLinks: QuickLink[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const [headerRes, linksRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/public/header`),
        fetch(`${API_URL}/api/quick-links`)
      ]);
      
      if (headerRes.ok) {
        const data = await headerRes.json();
        if (data && data.status === 'active') headerData = data;
      }

      if (linksRes.ok) {
        quickLinks = await linksRes.json();
      }
    } catch (e: any) {
      error = e.message || 'Terjadi kesalahan saat memuat konten';
    } finally {
      loading = false;
    }
  });

  const getTitle = () => {
    return headerData?.title || 'Pendidikan Masa Depan, Mulai dari Sini.';
  };

  const getSubtitle = () => {
    return headerData?.subtitle || 'Mencetak generasi unggul yang siap menghadapi tantangan global dengan pendekatan modern dan inovatif.';
  };
</script>

<svelte:head>
  <title>Beranda - {$siteName}</title>
  <meta name="description" content="Selamat datang di {$siteName} - Pendidikan masa depan dimulai di sini." />
</svelte:head>

<!-- Hero Section -->
{#if loading}
  <section class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 md:py-32 overflow-hidden rounded-xl shadow-2xl mb-12 flex items-center justify-center min-h-[500px]">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p class="text-xl">Memuat konten utama...</p>
    </div>
  </section>
{:else if error}
  <section class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 md:py-32 overflow-hidden rounded-xl shadow-2xl mb-12">
    <div class="container mx-auto text-center px-4">
      <h1 class="text-3xl md:text-4xl font-bold mb-4">Gagal Memuat Konten</h1>
      <p class="text-lg mb-8">{error}</p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <a href="/tentang-kami" class="bg-white text-primary-700 hover:bg-primary-50 font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  </section>
{:else}
  <section class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 md:py-32 overflow-hidden rounded-xl shadow-2xl mb-12">
    {#if headerData?.image_url}
      <img
        src={getImageUrl(headerData.image_url)}
        alt=""
        fetchpriority="high"
        class="absolute inset-0 w-full h-full object-cover opacity-20"
      />
    {/if}
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
    <div class="container mx-auto text-center relative z-10 px-4">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-serif">
        {getTitle()}
      </h1>
      <p class="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
        {getSubtitle()}
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <a href="/tentang-kami" class="bg-white text-primary-700 hover:bg-primary-50 font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          Pelajari Lebih Lanjut
        </a>
        <a href="/galeri" class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-700 font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105">
          Lihat Galeri
        </a>
      </div>
    </div>
  </section>
{/if}

<!-- Layanan Digital Section -->
{#if quickLinks.length > 0}
<section class="mb-12">
  <div class="text-center mb-10">
    <h2 class="text-3xl font-bold text-primary-800 font-serif">Layanan Digital</h2>
    <div class="h-1 w-20 bg-primary-500 mx-auto mt-4 rounded-full"></div>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each quickLinks as link}
      <a href={formatLinkUrl(link.url)} target="_blank" rel="noopener noreferrer" 
         class="group bg-white p-6 rounded-2xl shadow-lg border border-primary-50 hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl flex items-center">
        <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-primary-800 group-hover:text-primary-600 transition-colors">{link.title}</h3>
          <p class="text-sm text-gray-500">Klik untuk membuka layanan &rarr;</p>
        </div>
      </a>
    {/each}
  </div>
</section>
{/if}

<!-- Staff Testimonial Carousel -->
<StaffTestimonialCarousel />

<!-- Content Summary Sections (Placeholders) -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
  <div class="bg-gradient-to-br from-white to-primary-50 p-8 rounded-2xl shadow-xl text-center border border-primary-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
    <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
    <h2 class="text-2xl font-semibold text-primary-800 mb-3">Visi & Misi</h2>
    <p class="text-gray-600 mb-4">Komitmen kami untuk mencetak pemimpin masa depan dengan integritas dan inovasi.</p>
    <a href="/tentang-kami" class="inline-block text-primary-600 hover:text-primary-800 font-medium mt-2">Baca Selengkapnya &rarr;</a>
  </div>
  <div class="bg-gradient-to-br from-white to-primary-50 p-8 rounded-2xl shadow-xl text-center border border-primary-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
    <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </div>
    <h2 class="text-2xl font-semibold text-primary-800 mb-3">Berita Terbaru</h2>
    <p class="text-gray-600 mb-4">Ikuti perkembangan dan kegiatan terbaru melalui blog kami.</p>
    <a href="/blog" class="inline-block text-primary-600 hover:text-primary-800 font-medium mt-2">Kunjungi Blog &rarr;</a>
  </div>
  <div class="bg-gradient-to-br from-white to-primary-50 p-8 rounded-2xl shadow-xl text-center border border-primary-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
    <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <h2 class="text-2xl font-semibold text-primary-800 mb-3">Galeri Kami</h2>
    <p class="text-gray-600 mb-4">Lihat momen-momen indah dan kegiatan siswa di galeri foto.</p>
    <a href="/galeri" class="inline-block text-primary-600 hover:text-primary-800 font-medium mt-2">Lihat Galeri &rarr;</a>
  </div>
</section>

<!-- Call to Action (Updated to use dynamic link for registration) -->
<section class="bg-gradient-to-r from-primary-500 to-primary-600 p-10 rounded-2xl text-center shadow-2xl mb-12">
  <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Bergabunglah Bersama Kami!</h2>
  <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">Daftarkan putra/putri Anda dan jadilah bagian dari komunitas Sekolah Modern yang inovatif.</p>
  <a href={headerData?.cta_link || '/register'} class="bg-white text-primary-700 hover:bg-primary-50 font-bold py-4 px-10 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl inline-block">
    Daftar Sekarang
  </a>
</section>
