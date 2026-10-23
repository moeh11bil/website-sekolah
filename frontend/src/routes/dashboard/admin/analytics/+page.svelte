<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { API_URL } from '$lib/config';
  import { auth } from '$lib/stores';
  import { toast } from '$lib/toast';

  interface DailyStat {
    date: string;
    views: number;
    uniqueVisitors: number;
  }

  interface PageStat {
    path: string;
    views: number;
    uniqueVisitors: number;
    lastViewedAt: string | null;
  }

  interface StatsResponse {
    totals: { views: number; uniqueVisitors: number };
    today: { views: number; uniqueVisitors: number };
    daily: DailyStat[];
    pages: PageStat[];
  }

  let stats: StatsResponse | null = null;
  let loading = true;
  let error: string | null = null;
  let token: string | null = null;
  let lastUpdated: Date | null = null;
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  let showResetModal = false;
  let resetting = false;

  const REFRESH_INTERVAL = 60 * 1000;

  const pageLabels: Record<string, string> = {
    '/': 'Beranda',
    '/blog': 'Blog',
    '/galeri': 'Galeri',
    '/tentang-kami': 'Tentang Kami',
    '/login': 'Login',
    '/dashboard/admin/analytics': 'Statistik Pengunjung'
  };

  function pageLabel(path: string): string {
    if (pageLabels[path]) return pageLabels[path];
    // Contoh: /blog/5 -> Detail Blog #5
    const match = path.match(/^\/blog\/(.+)$/);
    if (match) return `Detail Blog #${match[1]}`;
    return path;
  }

  function formatNumber(value: number): string {
    return value.toLocaleString('id-ID');
  }

  function formatDate(value: string): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatDateTime(value: string | null): string {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function dayLabel(dateString: string): string {
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  $: maxDailyViews = stats ? Math.max(1, ...stats.daily.map(d => d.views)) : 1;
  $: maxPageViews = stats && stats.pages.length ? Math.max(...stats.pages.map(p => p.views)) : 1;

  async function fetchStats() {
    if (!token) return;
    error = null;
    try {
      const response = await fetch(`${API_URL}/api/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      stats = await response.json();
      lastUpdated = new Date();
    } catch (e: any) {
      error = e.message || 'Gagal memuat statistik';
    } finally {
      loading = false;
    }
  }

  async function resetStats() {
    if (!token || resetting) return;
    resetting = true;
    try {
      const response = await fetch(`${API_URL}/api/analytics/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showResetModal = false;
      toast.success('Statistik pengunjung berhasil direset.');
      await fetchStats(); // segarkan angka (termasuk yang tampil di beranda)
    } catch (e: any) {
      toast.error(e.message || 'Gagal mereset statistik');
    } finally {
      resetting = false;
    }
  }

  onMount(() => {
    const storedToken = get(auth).token;
    if (storedToken) {
      token = storedToken;
      fetchStats();
      // Auto-refresh tiap 1 menit agar angka tetap terkini
      refreshTimer = setInterval(fetchStats, REFRESH_INTERVAL);
    } else {
      goto('/login');
    }
  });

  onDestroy(() => {
    if (refreshTimer) clearInterval(refreshTimer);
  });
</script>

<svelte:head>
  <title>Statistik Pengunjung</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 class="text-2xl md:text-3xl font-bold text-primary-800">Statistik Pengunjung</h1>
    <p class="text-gray-500 mt-1">Pantau berapa orang yang mengakses website dan halaman mana yang paling sering dibuka.</p>
  </div>
  <div class="flex items-center gap-2">
    <button
      on:click={() => (showResetModal = true)}
      disabled={loading}
      class="inline-flex items-center gap-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 font-medium py-2 px-4 rounded-lg shadow transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Reset Statistik
    </button>
    <button
      on:click={fetchStats}
      disabled={loading}
      class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 {loading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Muat Ulang
    </button>
  </div>
</div>

{#if loading && !stats}
  <div class="flex items-center justify-center py-20">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    <p class="ml-4 text-primary-700">Memuat statistik...</p>
  </div>
{:else if error && !stats}
  <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg" role="alert">
    {error}
    <button on:click={fetchStats} class="ml-3 underline font-semibold">Coba lagi</button>
  </div>
{:else if stats}
  {#if error}
    <div class="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-4" role="alert">
      Gagal memperbarui: {error}
    </div>
  {/if}

  <!-- Ringkasan -->
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-2xl shadow-md border border-primary-100 p-5">
      <p class="text-sm text-gray-500">Total Kunjungan</p>
      <p class="text-3xl font-bold text-primary-700 mt-1">{formatNumber(stats.totals.views)}</p>
      <p class="text-xs text-gray-400 mt-1">sejak pertama kali dicatat</p>
    </div>
    <div class="bg-white rounded-2xl shadow-md border border-primary-100 p-5">
      <p class="text-sm text-gray-500">Pengunjung Unik</p>
      <p class="text-3xl font-bold text-primary-700 mt-1">{formatNumber(stats.totals.uniqueVisitors)}</p>
      <p class="text-xs text-gray-400 mt-1">orang berbeda (berdasarkan perangkat)</p>
    </div>
    <div class="bg-white rounded-2xl shadow-md border border-primary-100 p-5">
      <p class="text-sm text-gray-500">Kunjungan Hari Ini</p>
      <p class="text-3xl font-bold text-emerald-600 mt-1">{formatNumber(stats.today.views)}</p>
      <p class="text-xs text-gray-400 mt-1">{formatNumber(stats.today.uniqueVisitors)} pengunjung unik hari ini</p>
    </div>
    <div class="bg-white rounded-2xl shadow-md border border-primary-100 p-5">
      <p class="text-sm text-gray-500">Halaman Tercatat</p>
      <p class="text-3xl font-bold text-primary-700 mt-1">{formatNumber(stats.pages.length)}</p>
      <p class="text-xs text-gray-400 mt-1">
        {#if lastUpdated}
          diperbarui {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        {/if}
      </p>
    </div>
  </div>

  <!-- Grafik 14 hari -->
  <div class="bg-white rounded-2xl shadow-md border border-primary-100 p-6 mb-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-primary-800">Kunjungan 14 Hari Terakhir</h2>
      <div class="flex items-center gap-4 text-xs text-gray-500">
        <span class="inline-flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-primary-500 inline-block"></span> Kunjungan
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-emerald-400 inline-block"></span> Pengunjung unik
        </span>
      </div>
    </div>

    {#if stats.daily.length === 0}
      <p class="text-gray-500 text-sm py-8 text-center">Belum ada data kunjungan dalam 14 hari terakhir.</p>
    {:else}
      <div class="flex items-end gap-2 sm:gap-3 overflow-x-auto pb-2" style="min-height: 200px;">
        {#each stats.daily as day}
          <div class="flex flex-col items-center gap-1 flex-1 min-w-[36px] h-full justify-end" title="{dayLabel(day.date)}: {formatNumber(day.views)} kunjungan, {formatNumber(day.uniqueVisitors)} pengunjung unik">
            <div class="flex items-end gap-0.5 w-full justify-center" style="height: 160px;">
              <div
                class="w-3 sm:w-4 rounded-t bg-primary-500 transition-all"
                style="height: {Math.max(2, Math.round((day.views / maxDailyViews) * 100))}%"
              ></div>
              <div
                class="w-3 sm:w-4 rounded-t bg-emerald-400 transition-all"
                style="height: {Math.max(2, Math.round((day.uniqueVisitors / maxDailyViews) * 100))}%"
              ></div>
            </div>
            <span class="text-[10px] text-gray-500 whitespace-nowrap">{dayLabel(day.date)}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Tabel per halaman -->
  <div class="bg-white rounded-2xl shadow-md border border-primary-100 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-primary-800">Kunjungan Per Halaman / Link</h2>
      <p class="text-sm text-gray-500">Bahan pengecekan: halaman mana yang paling banyak diakses.</p>
    </div>

    {#if stats.pages.length === 0}
      <p class="text-gray-500 text-sm p-6 text-center">Belum ada data kunjungan.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-primary-50 text-primary-800 text-left">
            <tr>
              <th class="px-6 py-3 font-semibold">Halaman / Link</th>
              <th class="px-6 py-3 font-semibold text-right">Kunjungan</th>
              <th class="px-6 py-3 font-semibold text-right">Pengunjung Unik</th>
              <th class="px-6 py-3 font-semibold w-40">Porsi</th>
              <th class="px-6 py-3 font-semibold">Terakhir Diakses</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each stats.pages as pageStat (pageStat.path)}
              <tr class="hover:bg-primary-50/50 transition-colors">
                <td class="px-6 py-3">
                  <span class="font-medium text-gray-800">{pageLabel(pageStat.path)}</span>
                  <span class="block text-xs text-gray-400 font-mono">{pageStat.path}</span>
                </td>
                <td class="px-6 py-3 text-right font-semibold text-primary-700">{formatNumber(pageStat.views)}</td>
                <td class="px-6 py-3 text-right text-gray-600">{formatNumber(pageStat.uniqueVisitors)}</td>
                <td class="px-6 py-3">
                  <div class="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      class="bg-primary-500 h-2.5 rounded-full"
                      style="width: {Math.max(2, Math.round((pageStat.views / maxPageViews) * 100))}%"
                    ></div>
                  </div>
                </td>
                <td class="px-6 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(pageStat.lastViewedAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
{/if}

<!-- Modal konfirmasi reset -->
{#if showResetModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-800">Reset Statistik?</h2>
      </div>
      <p class="text-gray-600 mb-6">
        Seluruh data kunjungan akan <strong>terhapus permanen</strong> — termasuk angka yang tampil di halaman beranda,
        grafik 14 hari, dan tabel per halaman. Data baru akan mulai dicatat kembali dari nol.
      </p>
      <div class="flex space-x-4">
        <button
          on:click={() => (showResetModal = false)}
          disabled={resetting}
          class="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium disabled:opacity-60"
        >
          Batal
        </button>
        <button
          on:click={resetStats}
          disabled={resetting}
          class="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {#if resetting}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Menghapus...
          {/if}
          Ya, Reset
        </button>
      </div>
    </div>
  </div>
{/if}
