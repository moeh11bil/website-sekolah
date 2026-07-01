<script lang="ts">
  import { getContext } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import type { Writable } from 'svelte/store';
  import type { AboutPage, SchoolInfo } from '$lib/types';
  import { API_URL } from '$lib/config';

  const aboutStore = getContext<Writable<AboutPage | null>>('aboutStore');
  const schoolInfoStore = getContext<Writable<SchoolInfo | null>>('schoolInfoStore');

  let aboutData: AboutPage | null = null;
  let schoolInfo: SchoolInfo | null = null;
  let loading = true;
  let unsubscribeAbout: (() => void) | null = null;
  let unsubscribeSchoolInfo: (() => void) | null = null;

  async function fetchData() {
    if (!browser) return;
    try {
      const [aboutRes, schoolRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/public/about`),
        fetch(`${API_URL}/api/admin/public/school-info`)
      ]);
      if (aboutRes.ok) {
        const about = await aboutRes.json();
        aboutStore.set(about);
      }
      if (schoolRes.ok) {
        const school = await schoolRes.json();
        schoolInfoStore.set(school);
      }
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  }

  onMount(() => {
    unsubscribeAbout = aboutStore.subscribe(value => {
      aboutData = value;
      loading = false;
    });
    unsubscribeSchoolInfo = schoolInfoStore.subscribe(value => {
      schoolInfo = value;
      loading = false;
    });
  });

  onDestroy(() => {
    if (unsubscribeAbout) unsubscribeAbout();
    if (unsubscribeSchoolInfo) unsubscribeSchoolInfo();
  });

  // Reactive variable for contact information
  let contactInfo: { alamat?: string, telepon?: string, email?: string } | null = null;

  $: {
    if (aboutData?.kontak) {
      // Create a temporary DOM element to parse the kontak HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(aboutData.kontak, 'text/html');

      const info: { alamat?: string, telepon?: string, email?: string } = {};

      // Look for common patterns in the contact HTML, checking both div and p elements
      const elements = Array.from(doc.querySelectorAll('div, p, span'));
      elements.forEach(el => {
        let text = el.innerHTML || '';
        const textContent = el.textContent || '';
        const lowerText = textContent.toLowerCase();

        if (lowerText.includes('alamat') || textContent.includes('Jl.') || textContent.includes('Km.')) {
          // Extract the full address line
          info.alamat = textContent.replace(/^(Alamat\s*:?\s*)/i, '').trim();
        } else if (textContent.includes('No HP') || textContent.includes('Telepon') || textContent.includes('Telp') || textContent.includes('Phone')) {
          info.telepon = textContent.replace(/^(No HP\s*:?\s*)/i, '').replace(/^(Telepon\s*:?\s*)/i, '').replace(/^(Telp\s*:?\s*)/i, '').trim();
        } else if (lowerText.includes('email') || textContent.includes('@')) {
          info.email = textContent.replace(/^(Email\s*:?\s*)/i, '').trim();
        }
      });

      contactInfo = info;
    } else {
      contactInfo = null;
    }
  }
</script>

<footer class="bg-gradient-to-r from-primary-800 to-primary-900 text-primary-100 p-8 mt-12 shadow-lg">
  <div class="container mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        {#if schoolInfo}
          <h3 class="text-lg font-semibold mb-4 text-white">{schoolInfo.school_name || 'Sekolah Modern'}</h3>
          <p class="text-primary-200">{schoolInfo.school_moto || 'Pendidikan Masa Depan, Mulai dari Sini.'}</p>
        {:else}
          <h3 class="text-lg font-semibold mb-4 text-white">Sekolah Modern</h3>
          <p class="text-primary-200">Pendidikan Masa Depan, Mulai dari Sini.</p>
        {/if}
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-4 text-white">Tautan</h3>
        <ul class="space-y-2">
          <li><a href="/" class="text-primary-200 hover:text-white transition-colors">Beranda</a></li>
          <li><a href="/tentang-kami" class="text-primary-200 hover:text-white transition-colors">Tentang Kami</a></li>
          <li><a href="/blog" class="text-primary-200 hover:text-white transition-colors">Blog</a></li>
          <li><a href="/galeri" class="text-primary-200 hover:text-white transition-colors">Galeri</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-4 text-white">Kontak</h3>
        {#if loading}
          <p class="text-primary-200">Memuat kontak...</p>
        {:else if aboutData && contactInfo}
          <address class="not-italic text-primary-200">
            {#if contactInfo.alamat}
              <p>{contactInfo.alamat}</p>
            {/if}
            {#if contactInfo.telepon}
              <p class="mt-2">{contactInfo.telepon}</p>
            {/if}
            {#if contactInfo.email}
              <p>{contactInfo.email}</p>
            {/if}
          </address>
        {:else}
          <address class="not-italic text-primary-200">
            <p>Jl. Pendidikan No. 123</p>
            <p>Kota Edukatif, Indonesia</p>
            <p class="mt-2">Telepon: (021) 1234-5678</p>
            <p>Email: info@sekolahmodern.sch.id</p>
          </address>
        {/if}
      </div>
    </div>
    <div class="border-t border-primary-700 mt-8 pt-6 text-center text-primary-300">
      {#if schoolInfo}
        <p>&copy; {new Date().getFullYear()} {schoolInfo.school_name || 'Sekolah Modern'}. Hak Cipta Dilindungi.</p>
        <p class="mt-1">Dibangun dengan ❤️ oleh Tim Pengembang</p>
      {:else}
        <p>&copy; {new Date().getFullYear()} Sekolah Modern. Hak Cipta Dilindungi.</p>
        <p class="mt-1">Dibangun dengan ❤️ oleh Tim Pengembang</p>
      {/if}
    </div>
  </div>
</footer>
