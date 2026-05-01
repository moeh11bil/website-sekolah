<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { API_URL, getImageUrl } from '$lib/config';
  import type { Readable } from 'svelte/store';

  const siteName = getContext<Readable<string>>('siteNameStore');

  interface AboutPage {
    id: number;
    sejarah: string;
    visi: string;
    misi: string;
    fasilitas: string;
    kontak: string;
    image_url: string | null;
    status: 'active' | 'inactive';
  }

  let aboutPage: AboutPage | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/public/about`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.status === 'active') {
        aboutPage = data;
      }
      // If no data exists or status is inactive, we'll use default values below
    } catch (e: any) {
      error = e.message || 'Terjadi kesalahan saat memuat data';
    } finally {
      loading = false;
    }
  });

  // Default values to use when no data exists
  const getDefaultSejarah = () => {
    return aboutPage?.sejarah ?
      aboutPage.sejarah :
      `
      <p>Sekolah Modern didirikan pada tahun 2005 dengan tujuan untuk memberikan pendidikan berkualitas yang berbasis teknologi dan karakter. Awalnya hanya memiliki 3 kelas dengan jumlah siswa sekitar 60 orang, kini berkembang menjadi salah satu sekolah favorit di wilayah ini.</p>
      <p>Dengan komitmen untuk terus meningkatkan kualitas pendidikan, Sekolah Modern terus berinovasi dan mengembangkan kurikulum yang relevan dengan perkembangan zaman.</p>
      `;
  };

  const getDefaultVisi = () => {
    return aboutPage?.visi ?
      aboutPage.visi :
      `
      <p>Mewujudkan sekolah unggulan yang menghasilkan peserta didik yang berprestasi, berbudi pekerti luhur, religius, serta berwawasan global dan berjiwa kreatif-inovatif.</p>
      `;
  };

  const getDefaultMisi = () => {
    return aboutPage?.misi ?
      aboutPage.misi :
      `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Menyelenggarakan pendidikan yang bermutu dan relevan dengan kebutuhan zaman.</li>
        <li>Mengembangkan potensi peserta didik secara optimal sesuai bakat dan minatnya.</li>
        <li>Meningkatkan kualitas pendidik dan tenaga kependidikan secara berkelanjutan.</li>
        <li>Menyediakan sarana dan prasarana pendidikan yang memadai dan mutakhir.</li>
        <li>Membina hubungan yang harmonis dengan orang tua dan masyarakat.</li>
      </ol>
      `;
  };

  const getDefaultFasilitas = () => {
    return aboutPage?.fasilitas ?
      aboutPage.fasilitas :
      `
      <p>Sekolah Modern dilengkapi dengan berbagai fasilitas pendidikan mutakhir untuk mendukung proses belajar mengajar yang efektif dan menyenangkan:</p>
      <ul class="list-disc pl-5 space-y-2 mt-2">
        <li>Ruang kelas yang nyaman dengan peralatan interaktif</li>
        <li>Perpustakaan digital dengan koleksi buku lengkap</li>
        <li>Laboratorium komputer dan sains terpadu</li>
        <li>Lapangan olahraga dan ruang seni</li>
        <li>Canteen sehat dan area bermain yang aman</li>
        <li>Area hijau dan taman pembelajaran</li>
      </ul>
      `;
  };

  const getDefaultKontak = () => {
    return aboutPage?.kontak ?
      aboutPage.kontak :
      `
      <p class="mb-3"><strong>Alamat:</strong> Jl. Raya Bogor No. 12, Ciracas, Jakarta Timur, DKI Jakarta 13740</p>
      <p class="mb-3"><strong>Telepon:</strong> (021) 873-4567</p>
      <p class="mb-3"><strong>Email:</strong> info@sekolahmodern.sch.id</p>
      <p class="mb-3"><strong>Website:</strong> www.sekolahmodern.sch.id</p>
      <p class="mb-3"><strong>Jam Operasional:</strong> Senin - Sabtu, 07:00 - 16:00</p>
      <div class="mt-6">
        <iframe
          title="Peta Lokasi Sekolah"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.568407421035!2d106.840244314769!3d-6.18522649552174!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f44b0f0b0b0b%3A0x0b0b0b0b0b0b0b0b!2sMonumen%20Nasional!5e0!3m2!1sen!2sid!4v1678912345678!5m2!1sen!2sid"
          class="w-full h-64 rounded-lg shadow-md"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      `;
  };

  // Function to extract Google Maps embed from kontak content and separate it
  function extractMapEmbed(htmlString) {
    // Regular expression to match Google Maps iframe embed
    const mapRegex = /(<div[^>]*class="mt-6"[^>]*>[\s\S]*?<iframe[^>]*src="[^"]*google\.com\/maps\/embed[^>]*[^>]*>[\s\S]*?<\/iframe>[\s\S]*?<\/div>)/i;
    const match = htmlString.match(mapRegex);
    if (match) {
      let embedContent = match[1];
      // Ensure the iframe has appropriate classes for responsiveness
      embedContent = embedContent.replace(/<iframe/, '<iframe class="w-full rounded-lg"');
      // Remove the embed part from the original content
      const textContent = htmlString.replace(mapRegex, '');
      return { textContent: textContent.trim(), embedContent };
    }
    return { textContent: htmlString, embedContent: null };
  }

  // Function to get kontak text without map (for the left side)
  const getKontakText = () => {
    if (aboutPage?.kontak) {
      const { textContent } = extractMapEmbed(aboutPage.kontak);
      return textContent;
    }
    return getDefaultKontak().replace(/<div class="mt-6">[\s\S]*?<\/div>/, '');
  };

  // Function to get map embed (for the right side)
  const getMapEmbed = () => {
    if (aboutPage?.kontak) {
      const { embedContent } = extractMapEmbed(aboutPage.kontak);
      return embedContent;
    }
    // Extract from default content if needed
    let defaultContent = getDefaultKontak();
    const match = defaultContent.match(/(<div class="mt-6">[\s\S]*?<\/iframe>[\s\S]*?<\/div>)/);
    if (match) {
      let embedContent = match[1];
      // Ensure the iframe has appropriate classes for responsiveness
      embedContent = embedContent.replace(/<iframe/, '<iframe class="w-full rounded-lg"');
      return embedContent;
    }
    return null;
  };

  const hasContent = () => {
    return aboutPage &&
           (aboutPage.sejarah || aboutPage.visi || aboutPage.misi || aboutPage.fasilitas || aboutPage.kontak);
  };
</script>

<svelte:head>
  <title>Tentang Kami - {$siteName}</title>
  <meta name="description" content="Informasi tentang sejarah, visi, misi, fasilitas, dan kontak sekolah kami." />
  <style>
    .prose ul {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: disc;
    }
    .prose ol {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: decimal;
    }
    .prose li {
      margin: 0.25rem 0;
      display: list-item;
    }
  </style>
</svelte:head>

<div class="max-w-6xl mx-auto">
  <header class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-bold text-primary-800 mb-4">Tentang Kami</h1>
    <p class="text-lg text-primary-600 max-w-2xl mx-auto">Informasi lengkap tentang sekolah kami, sejarah, visi, misi, fasilitas, dan cara menghubungi kami.</p>
    <div class="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full mt-4"></div>
  </header>

  <section class="py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p class="text-primary-700">Memuat informasi tentang kami...</p>
        </div>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <div class="inline-block bg-red-100 text-red-700 px-6 py-4 rounded-lg">
          <p>Terjadi kesalahan: {error}</p>
        </div>
      </div>
    {:else}
      <div class="space-y-12">
        <!-- Gambar (jika ada) -->
        {#if aboutPage?.image_url}
          <div class="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={getImageUrl(aboutPage.image_url)} 
              alt="Gambar Sekolah" 
              class="w-full h-96 object-cover"
            />
          </div>
        {/if}

        <!-- Sejarah -->
        <div class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-8 border border-primary-100">
          <div class="flex items-center mb-6">
            <div class="bg-primary-100 p-3 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-primary-800">Sejarah Sekolah</h2>
          </div>
          <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {@html getDefaultSejarah()}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Visi -->
          <div class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-8 border border-primary-100">
            <div class="flex items-center mb-6">
              <div class="bg-primary-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-primary-800">Visi Sekolah</h2>
            </div>
            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {@html getDefaultVisi()}
            </div>
          </div>

          <!-- Misi -->
          <div class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-8 border border-primary-100">
            <div class="flex items-center mb-6">
              <div class="bg-primary-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-primary-800">Misi Sekolah</h2>
            </div>
            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {@html getDefaultMisi()}
            </div>
          </div>
        </div>

        <!-- Fasilitas -->
        <div class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-8 border border-primary-100">
          <div class="flex items-center mb-6">
            <div class="bg-primary-100 p-3 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-primary-800">Fasilitas Sekolah</h2>
          </div>
          <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {@html getDefaultFasilitas()}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Kontak -->
          <div class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-8 border border-primary-100">
            <div class="flex items-center mb-6">
              <div class="bg-primary-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-primary-800">Kontak Sekolah</h2>
            </div>
            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {@html getKontakText()}
            </div>
          </div>

          <!-- Lokasi & Peta -->
          {#if getMapEmbed()}
          <div class="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-8 border border-primary-100">
            <div class="flex items-center mb-6">
              <div class="bg-primary-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-primary-800">Lokasi & Peta</h2>
            </div>
            <div class="mt-4 overflow-hidden rounded-lg">
              {@html getMapEmbed()}
            </div>
          </div>
          {/if}
        </div>
      </div>
    {/if}
  </section>
</div>