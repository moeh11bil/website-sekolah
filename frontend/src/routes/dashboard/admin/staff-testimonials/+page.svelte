<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { API_URL, getImageUrl } from '$lib/config';

  interface Staff {
    id: number;
    name: string;
    position: string;
    quote: string;
    image_url: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
  }

  let staffList: Staff[] = [];
  let loading = true;
  let error: string | null = null;
  let token: string | null = null;

  let showModal = false;
  let editingId: number | null = null;
  let formData = {
    name: '',
    position: '',
    quote: '',
    status: 'active' as 'active' | 'inactive',
    sort_order: 0
  };
  let formError = '';
  let formSuccess = '';
  let showToast = false;
  let toastMessage = '';
  let toastTimeout: ReturnType<typeof setTimeout>;

  function showSuccessToast(message: string) {
    toastMessage = message;
    showToast = true;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = null;

  let showDeleteModal = false;
  let staffToDelete: number | null = null;

  onMount(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token = storedToken;
      fetchStaff();
    } else {
      goto('/login');
    }
  });

  async function fetchStaff() {
    if (!token) return;
    loading = true;
    error = null;
    try {
      const response = await fetch(`${API_URL}/api/admin/staff-testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      staffList = await response.json();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(selectedImage);
    }
  }

  function openAddModal() {
    editingId = null;
    formData = {
      name: '',
      position: '',
      quote: '',
      status: 'active',
      sort_order: 0
    };
    selectedImage = null;
    imagePreviewUrl = null;
    formError = '';
    formSuccess = '';
    showModal = true;
  }

  function openEditModal(staff: Staff) {
    editingId = staff.id;
    formData = {
      name: staff.name,
      position: staff.position,
      quote: staff.quote,
      status: staff.status,
      sort_order: staff.sort_order
    };
    selectedImage = null;
    imagePreviewUrl = staff.image_url ? getImageUrl(staff.image_url) : null;
    formError = '';
    formSuccess = '';
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingId = null;
    formData = {
      name: '',
      position: '',
      quote: '',
      status: 'active',
      sort_order: 0
    };
    selectedImage = null;
    imagePreviewUrl = null;
    formError = '';
  }

  async function handleSubmit() {
    if (!formData.name || !formData.position || !formData.quote) {
      formError = 'Nama, posisi, dan kutipan wajib diisi';
      return;
    }

    if (!token) return;

    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId 
      ? `${API_URL}/api/admin/staff-testimonials/${editingId}` 
      : `${API_URL}/api/admin/staff-testimonials`;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('name', formData.name);
      formDataUpload.append('position', formData.position);
      formDataUpload.append('quote', formData.quote);
      formDataUpload.append('status', formData.status);
      formDataUpload.append('sort_order', formData.sort_order.toString());
      
      if (selectedImage) {
        formDataUpload.append('image', selectedImage);
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan data');
      }

      formSuccess = editingId ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!';
      showSuccessToast(formSuccess);
      fetchStaff();
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (e: any) {
      formError = e.message;
    }
  }

  function confirmDelete(id: number) {
    staffToDelete = id;
    showDeleteModal = true;
  }

  async function deleteStaff() {
    if (!staffToDelete || !token) return;
    showDeleteModal = false;

    try {
      const response = await fetch(`${API_URL}/api/admin/staff-testimonials/${staffToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus data');
      }

      fetchStaff();
    } catch (e: any) {
      error = e.message;
    }
    staffToDelete = null;
  }

  function cancelDelete() {
    showDeleteModal = false;
    staffToDelete = null;
  }
</script>

<svelte:head>
  <title>Testimoni Guru & Stap - Dashboard Admin</title>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6">
  <!-- Toast Notification -->
  {#if showToast}
    <div class="fixed top-4 right-4 z-50 animate-slide-in">
      <div class="bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-lg shadow-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-medium">{toastMessage}</span>
      </div>
    </div>
  {/if}

  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
    <h2 class="text-2xl font-bold text-primary-800 mb-4 sm:mb-0">Testimoni Guru & Stap</h2>
    <button 
      on:click={openAddModal}
      class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Tambah Testimoni
    </button>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-primary-700">Memuat data...</p>
      </div>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Error: {error}</span>
    </div>
  {:else if staffList.length === 0}
    <div class="bg-primary-50 border border-primary-100 text-primary-700 px-4 py-8 rounded-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-lg">Belum ada testimoni yang ditambahkan.</p>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-primary-100">
      <table class="min-w-full">
        <thead class="bg-primary-50">
          <tr>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">No</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Foto</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Nama</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Posisi</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Kutipan</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Status</th>
            <th class="py-3 px-4 text-left text-sm font-semibold text-primary-700 border-b border-primary-100">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-100">
          {#each staffList as staff, index}
            <tr class="hover:bg-primary-50 transition-colors duration-150">
              <td class="py-3 px-4 text-gray-700">{index + 1}</td>
              <td class="py-3 px-4">
                <div class="flex-shrink-0 w-16 h-16">
                  {#if staff.image_url}
                    <img 
                      src={getImageUrl(staff.image_url)} 
                      alt={staff.name}
                      loading="lazy"
                      decoding="async"
                      class="w-full h-full rounded-xl object-cover object-center border-2 border-primary-200 shadow-sm"
                    />
                  {:else}
                    <div class="w-full h-full rounded-xl bg-primary-200 flex items-center justify-center text-primary-600 font-bold text-xl border-2 border-primary-300">
                      {staff.name.charAt(0)}
                    </div>
                  {/if}
                </div>
              </td>
              <td class="py-3 px-4 text-gray-700 font-medium">{staff.name}</td>
              <td class="py-3 px-4 text-gray-700">{staff.position}</td>
              <td class="py-3 px-4 text-gray-600 max-w-xs truncate">{staff.quote}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 {staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} rounded-full text-xs font-medium capitalize">
                  {staff.status}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <button 
                    on:click={() => openEditModal(staff)}
                    class="bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    on:click={() => confirmDelete(staff.id)}
                    class="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Add/Edit Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-primary-200 max-h-[90vh] overflow-y-auto">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        {editingId ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
      </h3>

      {#if formError}
        <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
          {formError}
        </div>
      {/if}

      {#if formSuccess}
        <div class="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4">
          {formSuccess}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="name">Nama Lengkap</label>
            <input 
              id="name" 
              type="text" 
              bind:value={formData.name} 
              placeholder="Contoh: Dr. Ahmad Wijaya, S.Pd., M.Pd."
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="position">Posisi/Jabatan</label>
            <input 
              id="position" 
              type="text" 
              bind:value={formData.position} 
              placeholder="Contoh: Kepala Sekolah"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="quote">Kutipan/Testimoni</label>
            <textarea 
              id="quote" 
              bind:value={formData.quote} 
              placeholder="Tulis kutipan atau testimoni..."
              rows="4"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              required
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Foto (opsional)</label>
            <div class="relative">
              <input
                type="file"
                id="image"
                accept="image/*"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                on:change={handleImageChange}
              />
              <div class="p-4 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-200 cursor-pointer text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p class="text-primary-700 text-sm font-medium">Pilih foto atau seret ke sini</p>
                <p class="text-gray-500 text-xs mt-1">JPG, PNG, GIF hingga 5MB</p>
              </div>
            </div>
            {#if selectedImage}
              <p class="mt-2 text-sm text-gray-600">
                File dipilih: <span class="font-medium">{selectedImage.name}</span>
              </p>
            {/if}
          </div>

          <!-- Image Preview -->
          {#if imagePreviewUrl}
            <div class="mb-4 flex justify-center">
              <div class="relative w-40 h-40">
                <img 
                  src={imagePreviewUrl} 
                  alt="Preview" 
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover object-center rounded-2xl border-4 border-primary-200 shadow-md"
                />
              </div>
            </div>
          {/if}

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="status">Status</label>
              <select 
                id="status" 
                bind:value={formData.status}
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="sort_order">Urutan</label>
              <input 
                id="sort_order" 
                type="number" 
                bind:value={formData.sort_order} 
                min="0"
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
          <button 
            type="button" 
            on:click={closeModal}
            class="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
          >
            Batal
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary-500 text-white font-bold rounded-lg shadow hover:bg-primary-600 transition-colors duration-200"
          >
            {editingId ? 'Perbarui' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-primary-200">
      <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-center text-gray-800 mb-2">Konfirmasi Penghapusan</h3>
      <p class="text-gray-600 text-center mb-6">Apakah Anda yakin ingin menghapus testimoni ini? Tindakan ini tidak dapat dibatalkan.</p>
      <div class="flex flex-col sm:flex-row sm:justify-center gap-3">
        <button
          on:click={cancelDelete}
          class="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
        >
          Batal
        </button>
        <button
          on:click={deleteStaff}
          class="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition-colors duration-200"
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out forwards;
  }
</style>
