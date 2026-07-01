<script lang="ts">
  import { auth } from '$lib/stores';
  import type { User } from '$lib/types';
</script>

<div class="bg-white rounded-xl shadow-lg p-6">
  <h2 class="text-2xl font-bold text-primary-800 mb-4">Selamat Datang, {$auth.user?.full_name || $auth.user?.username || 'Admin'}!</h2>
  <p class="text-gray-700 mb-6">Ini adalah dashboard admin. Gunakan navigasi di samping untuk mengelola pengguna, kategori, dan postingan.</p>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
    <a href="/dashboard/admin/users" class="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl shadow-md border border-primary-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
      <div class="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-primary-800 mb-2">Manajemen Pengguna</h3>
      <p class="text-gray-600 text-sm">Kelola akun pengguna dan hak akses</p>
    </a>

    <a href="/dashboard/admin/categories" class="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl shadow-md border border-primary-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
      <div class="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-primary-800 mb-2">Manajemen Kategori</h3>
      <p class="text-gray-600 text-sm">Atur kategori untuk postingan blog</p>
    </a>

    <a href="/dashboard/posts/pending" class="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl shadow-md border border-primary-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
      <div class="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-primary-800 mb-2">Postingan Menunggu</h3>
      <p class="text-gray-600 text-sm">Tinjau dan setujui postingan</p>
    </a>

    <a href="/dashboard/admin/school-info" class="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl shadow-md border border-primary-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
      <div class="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-primary-800 mb-2">Info Sekolah</h3>
      <p class="text-gray-600 text-sm">Atur nama, logo, dan moto sekolah</p>
    </a>

    <a href="/dashboard/admin/staff-testimonials" class="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl shadow-md border border-primary-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
      <div class="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-primary-800 mb-2">Testimoni Guru & Stap</h3>
      <p class="text-gray-600 text-sm">Kelola carousel testimoni</p>
    </a>
  </div>
</div>
