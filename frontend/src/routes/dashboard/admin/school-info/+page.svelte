<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { getAuthHeaders, apiRequest } from '$lib/api';
  import { API_URL, getImageUrl } from '$lib/config';

  interface SchoolInfo {
    id?: number;
    school_name: string;
    school_moto: string;
    logo_url?: string | null;
  }

  const schoolInfoStore = getContext<Writable<SchoolInfo | null>>('schoolInfoStore');

  let schoolInfo: SchoolInfo = {
    school_name: '',
    school_moto: '',
    logo_url: null
  };

  let loading = true;
  let saving = false;
  let error: string | null = null;
  let success: string | null = null;
  let selectedLogo: File | null = null;
  let logoPreview: string | null = null;
  let logoToDelete: boolean = false;

  // Load school info on mount
  onMount(async () => {
    try {
      const response = await apiRequest('/api/admin/school-info', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        schoolInfo = data;
        logoToDelete = false; // Reset delete flag when data is loaded
      }
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  // Handle form input changes
  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const name = target.name;
    const value = target.value;

    schoolInfo = { ...schoolInfo, [name]: value };
    logoToDelete = false; // Reset delete flag when text fields are changed
  }

  // Handle logo selection
  function handleLogoChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      selectedLogo = target.files[0];
      logoToDelete = false; // Reset delete flag when a new logo is selected

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        logoPreview = event.target?.result as string;
      };
      reader.readAsDataURL(selectedLogo);
    }
  }

  // Handle form submission
  async function handleSubmit(e: Event) {
    e.preventDefault();
    saving = true;
    error = null;
    success = null;

    try {
      const formData = new FormData();
      formData.append('school_name', schoolInfo.school_name);
      formData.append('school_moto', schoolInfo.school_moto);

      if (selectedLogo) {
        formData.append('logo', selectedLogo);
      }

      // If logoToDelete is true, send a flag to delete the logo
      if (logoToDelete) {
        formData.append('delete_logo', 'true');
      }

      const response = await apiRequest('/api/admin/school-info', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        success = result.message;
        selectedLogo = null;
        logoPreview = null;
        logoToDelete = false; // Reset the flag after successful submission

        // Reload the data to update the display
        const updatedResponse = await apiRequest('/api/admin/school-info', {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          schoolInfo = { ...schoolInfo, ...updatedData };
          if (schoolInfoStore) {
            schoolInfoStore.set(updatedData);
          }
        }
      } else {
        const errorResult = await response.json();
        error = errorResult.message || 'An error occurred';
      }
    } catch (e: any) {
      error = e.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="max-w-4xl mx-auto">
  <section class="py-8">
    <div class="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
      <h1 class="text-3xl font-bold text-primary-800 mb-6">Pengaturan Informasi Sekolah</h1>
      
      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p class="text-primary-700">Memuat informasi sekolah...</p>
          </div>
        </div>
      {:else}
        {#if error}
          <div class="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            <p>Terjadi kesalahan: {error}</p>
          </div>
        {/if}
        
        {#if success}
          <div class="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            <p>{success}</p>
          </div>
        {/if}

        <form on:submit={handleSubmit} class="space-y-6">
          <!-- School Name Field -->
          <div>
            <label for="school_name" class="block text-sm font-medium text-gray-700 mb-2">
              Nama Sekolah
            </label>
            <input
              type="text"
              id="school_name"
              name="school_name"
              value={schoolInfo.school_name}
              on:input={handleInputChange}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Masukkan nama sekolah"
            />
          </div>

          <!-- School Moto Field -->
          <div>
            <label for="school_moto" class="block text-sm font-medium text-gray-700 mb-2">
              Moto Sekolah
            </label>
            <textarea
              id="school_moto"
              name="school_moto"
              value={schoolInfo.school_moto}
              on:input={handleInputChange}
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Masukkan moto sekolah"
            ></textarea>
          </div>

          <!-- Logo Upload Field -->
          <div>
            <label for="logo" class="block text-sm font-medium text-gray-700 mb-2">
              Logo Sekolah
            </label>

            <!-- Current Logo Display -->
            {#if schoolInfo.logo_url || logoPreview}
              <div class="mb-4">
                <div class="flex items-center">
                  <img
                    src={logoPreview || getImageUrl(schoolInfo.logo_url)}
                    alt="Current Logo"
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                    class="w-16 h-16 object-contain border border-gray-300 rounded-lg mr-4"
                  />
                  <div class="text-gray-600">
                    <p class="text-sm">Logo saat ini</p>
                    <button
                      type="button"
                      on:click={() => {
                        schoolInfo.logo_url = null;
                        logoToDelete = true;
                      }}
                      class="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                    >
                      Hapus Logo
                    </button>
                  </div>
                </div>
              </div>
            {/if}

            <div class="flex items-center space-x-4">
              <div class="relative border-2 border-dashed border-gray-300 rounded-lg p-6 w-full text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  on:change={handleLogoChange}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div>
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">
                    <span class="font-medium text-primary-600 hover:text-primary-500">Klik untuk mengunggah</span> atau seret dan lepas
                  </p>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF hingga 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              class="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan Informasi Sekolah'}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </section>
</div>