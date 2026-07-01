<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { API_URL } from '$lib/config';
  import { auth } from '$lib/stores';

  interface AboutConfig {
    id: number;
    sejarah: string;
    visi: string;
    misi: string;
    fasilitas: string;
    kontak: string;
    image_url: string | null;
    status: 'active' | 'inactive';
  }

  let about: AboutConfig | null = null;
  let loading = true;
  let error: string | null = null;
  let successMessage: string | null = null;
  let sejarah = '';
  let visi = '';
  let misi = '';
  let fasilitas = '';
  let kontak = '';
  let alamat = '';
  let mapsEmbed = '';
  let token: string | null = null;
  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = null;
  let startNumber = 1;

  function setOrderedListStart(field: string) {
    const contentDiv = document.getElementById(field);
    if (!contentDiv) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer as HTMLElement;
    if (element.nodeType === 3) element = element.parentElement as HTMLElement;

    const list = element.closest('ol');
    if (list && contentDiv.contains(list)) {
      list.setAttribute('start', startNumber.toString());
      handleContentChange(field);
    }
  }

  onMount(async () => {
    const storedToken = get(auth).token;
    const currentUser = get(auth).user;
    
    if (!storedToken || !currentUser) {
      goto('/login');
      return;
    }
    
    if (currentUser.role !== 'admin') {
      goto('/dashboard');
      return;
    }
    
    token = storedToken;
    await fetchAboutData();
  });

  async function fetchAboutData() {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/about`, {
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

      const data = await response.json();
      if (data) {
        about = data;
        sejarah = data.sejarah || '';
        visi = data.visi || '';
        misi = data.misi || '';
        fasilitas = data.fasilitas || '';
        // Assuming current data.kontak structure is simple text or HTML. 
        // We'll keep it as is for now but split address if possible. 
        // Since I don't know the exact format, I will just fix the binding for now.
        kontak = data.kontak || ''; 
        alamat = ''; // Need to extract if possible, but let's leave empty for now as it was incorrect.

        // Extract Google Maps embed from kontak content if available
        if (data.kontak) {
          const iframeMatch = data.kontak.match(/<iframe[^>]*>[\s\S]*?<\/iframe>/);
          if (iframeMatch) {
            mapsEmbed = iframeMatch[0];
            // Remove iframe from kontak for the address field
            kontak = data.kontak.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/, '').trim();
          } else {
            // If no iframe found, show original kontak
            mapsEmbed = '';
          }
        } else {
          mapsEmbed = '';
        }

        // Initialize content in the contenteditable divs after the DOM is ready
        setTimeout(initializeContentDivs, 0);
      }
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
    } else {
      selectedImage = null;
      imagePreviewUrl = null;
    }
  }

  function formatText(command: string, field: string, value: string = '') {
    try {
      const contentDiv = document.getElementById(field);
      if (!contentDiv) {
        console.error('Content div not found for field:', field);
        return;
      }

      contentDiv.focus();

      // Handle list commands with standard execCommand
      if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        document.execCommand(command, false, undefined);
      } else {
        // For other commands (bold, italic, underline, justify), use execCommand
        document.execCommand(command, false, value);
      }
    } catch (e) {
      console.error('Error in formatText:', e);
      // Fallback to basic execCommand if the advanced method fails
      document.execCommand(command, false, value);
    }

    // Update the content variable
    handleContentChange(field);
  }

  function toggleList(listType: 'ul' | 'ol', contentDiv: HTMLElement) {
    // First check if we're already inside a list of this type
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      // No selection, proceed with creating list
    } else {
      const range = selection.getRangeAt(0);
      let element = range.startContainer as HTMLElement;

      // Traverse up to find if we're in a list context
      while (element && element !== contentDiv) {
        if (element.tagName === 'LI') {
          // We're in a list item, so we need to convert it back to a paragraph
          convertListToParagraph(contentDiv);
          return;
        }
        element = element.parentElement as HTMLElement;
      }
    }

    // If content div is empty, create a default paragraph
    if (contentDiv.innerHTML.trim() === '' || contentDiv.innerHTML.trim() === '<br>') {
      contentDiv.innerHTML = '<p><br></p>';
    }

    // Get all block elements that should be converted to list items
    const blocks = Array.from(contentDiv.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6'));

    if (blocks.length > 0) {
      // Create a new list element
      const list = document.createElement(listType);

      // Convert each block to a list item
      blocks.forEach(block => {
        const listItem = document.createElement('li');
        listItem.innerHTML = block.innerHTML || '<br>';
        list.appendChild(listItem);
        block.remove(); // Remove the original block
      });

      // Insert the list at the beginning of contentDiv
      if (contentDiv.firstChild) {
        contentDiv.insertBefore(list, contentDiv.firstChild);
      } else {
        contentDiv.appendChild(list);
      }
    } else {
      // If no blocks found, create an empty list
      const list = document.createElement(listType);
      const listItem = document.createElement('li');
      listItem.innerHTML = '<br>';
      list.appendChild(listItem);
      contentDiv.appendChild(list);
    }
  }

  function convertListToParagraph(contentDiv: HTMLElement) {
    // Find any list elements and convert them back to paragraphs
    const lists = contentDiv.querySelectorAll('ul, ol');

    lists.forEach(list => {
      const listItems = Array.from(list.querySelectorAll('li'));

      // Convert each list item to a paragraph and insert it before the list
      listItems.forEach(li => {
        const p = document.createElement('p');
        p.innerHTML = li.innerHTML || '<br>';

        // Insert the paragraph before the list
        list.parentNode?.insertBefore(p, list);
      });

      // Remove the original list
      list.remove();
    });
  }

  function handleContentChange(field: string) {
    const contentDiv = document.getElementById(field);
    if (!contentDiv) return;

    const content = contentDiv.innerHTML;

    // Update the corresponding variable based on the field
    switch(field) {
      case 'sejarah':
        sejarah = content;
        break;
      case 'visi':
        visi = content;
        break;
      case 'misi':
        misi = content;
        break;
      case 'fasilitas':
        fasilitas = content;
        break;
      case 'kontak':
        kontak = content;
        break;
    }
  }

  // Initialize content in the contenteditable divs when the component mounts
  function initializeContentDivs() {
    const fields = ['sejarah', 'visi', 'misi', 'fasilitas', 'kontak'];

    fields.forEach(field => {
      const contentDiv = document.getElementById(field);
      if (contentDiv) {
        let content = '';

        switch(field) {
          case 'sejarah':
            content = sejarah;
            break;
          case 'visi':
            content = visi;
            break;
          case 'misi':
            content = misi;
            break;
          case 'fasilitas':
            content = fasilitas;
            break;
          case 'kontak':
            content = kontak;
            break;
        }

        contentDiv.innerHTML = content;
      }
    });
  }

  async function handleSubmit() {
    if (!token) return;
    
    successMessage = null;
    error = null;

    try {
      // Update content from the contenteditable divs before submission
      handleContentChange('sejarah');
      handleContentChange('visi');
      handleContentChange('misi');
      handleContentChange('fasilitas');
      handleContentChange('kontak');

      // Combine address, contacts, and Google Maps embed for the kontak field
      let finalKontak = '';
      if (alamat) {
        finalKontak += `<p class="font-semibold">Alamat:</p><p>${alamat}</p><br/>`;
      }
      if (kontak) {
        finalKontak += `<p class="font-semibold">Informasi Kontak:</p><p>${kontak}</p>`;
      }
      if (mapsEmbed) {
        finalKontak += `<div class="mt-6">${mapsEmbed}</div>`;
      }

      const formData = new FormData();
      formData.append('sejarah', sejarah);
      formData.append('visi', visi);
      formData.append('misi', misi);
      formData.append('fasilitas', fasilitas);
      formData.append('kontak', finalKontak);
      formData.append('status', 'active'); // Always active now

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_URL}/api/admin/about`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      successMessage = 'Konfigurasi tentang kami berhasil disimpan!';
      await fetchAboutData();
    } catch (e: any) {
      error = e.message || 'Terjadi kesalahan saat menyimpan data';
    }
  }
</script>

<svelte:head>
  <title>Manajemen Tentang Kami - Dashboard Admin</title>
  <style>
    #sejarah ul, #visi ul, #misi ul, #fasilitas ul, #kontak ul {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: disc; /* Explicitly set disc for ul */
    }
    #sejarah ol, #visi ol, #misi ol, #fasilitas ol, #kontak ol {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: decimal; /* Explicitly set decimal for ol */
    }
    #sejarah li, #visi li, #misi li, #fasilitas li, #kontak li {
      margin: 0.25rem 0;
      display: list-item; /* Ensure li elements display as list items */
    }
  </style>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Manajemen Tentang Kami</h2>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-primary-700">Memuat konfigurasi tentang kami...</p>
      </div>
    </div>
  {:else}
    <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">
      {#if error}
        <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      {/if}

      {#if successMessage}
        <div class="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-6">
          <label id="sejarah-label" class="block text-gray-700 text-sm font-semibold mb-2">Sejarah Sekolah</label>

          <!-- WYSIWYG Toolbar -->
          <div class="mb-2 flex flex-wrap gap-1 p-2 border border-primary-200 rounded-lg bg-white shadow-sm">
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('bold', 'sejarah')}
              title="Bold"
            >
              <span class="font-bold">B</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('italic', 'sejarah')}
              title="Italic"
            >
              <span class="italic">I</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('underline', 'sejarah')}
              title="Underline"
            >
              <span class="underline">U</span>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertUnorderedList', 'sejarah')}
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertOrderedList', 'sejarah')}
              title="Numbered List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <div class="flex items-center gap-1">
              <input type="number" bind:value={startNumber} class="w-12 p-1 border rounded text-sm" min="1" title="Start Number">
              <button type="button" on:click={() => setOrderedListStart('sejarah')} class="px-2 py-1 bg-primary-100 hover:bg-primary-200 rounded text-xs font-bold text-primary-800">Set</button>
            </div>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyLeft', 'sejarah')}
              title="Align Left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyCenter', 'sejarah')}
              title="Align Center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M9 18h6" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyRight', 'sejarah')}
              title="Align Right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 12h12M13 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyFull', 'sejarah')}
              title="Justify"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('formatBlock', 'sejarah', '<h2>')}
              title="Heading"
            >
              H
            </button>
          </div>

          <!-- Content editor -->
          <div
            id="sejarah"
            contenteditable="true"
            aria-labelledby="sejarah-label"
            class="block w-full pl-4 pr-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-48 overflow-y-auto"
            on:input={() => handleContentChange('sejarah')}
            on:blur={() => handleContentChange('sejarah')}
            placeholder="Masukkan sejarah sekolah..."
          ></div>
          <p class="text-xs text-gray-500 mt-2">
            Gunakan toolbar di atas untuk memformat konten Anda (bold, italic, list, dll.)
          </p>
        </div>

        <div class="mb-6">
          <label id="visi-label" class="block text-gray-700 text-sm font-semibold mb-2">Visi Sekolah</label>

          <!-- WYSIWYG Toolbar -->
          <div class="mb-2 flex flex-wrap gap-1 p-2 border border-primary-200 rounded-lg bg-white shadow-sm">
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('bold', 'visi')}
              title="Bold"
            >
              <span class="font-bold">B</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('italic', 'visi')}
              title="Italic"
            >
              <span class="italic">I</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('underline', 'visi')}
              title="Underline"
            >
              <span class="underline">U</span>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertUnorderedList', 'visi')}
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertOrderedList', 'visi')}
              title="Numbered List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <div class="flex items-center gap-1">
              <input type="number" bind:value={startNumber} class="w-12 p-1 border rounded text-sm" min="1" title="Start Number">
              <button type="button" on:click={() => setOrderedListStart('visi')} class="px-2 py-1 bg-primary-100 hover:bg-primary-200 rounded text-xs font-bold text-primary-800">Set</button>
            </div>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyLeft', 'visi')}
              title="Align Left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyCenter', 'visi')}
              title="Align Center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M9 18h6" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyRight', 'visi')}
              title="Align Right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 12h12M13 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyFull', 'visi')}
              title="Justify"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Content editor -->
          <div
            id="visi"
            contenteditable="true"
            aria-labelledby="visi-label"
            class="block w-full pl-4 pr-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-32 overflow-y-auto"
            on:input={() => handleContentChange('visi')}
            on:blur={() => handleContentChange('visi')}
            placeholder="Masukkan visi sekolah..."
          ></div>
          <p class="text-xs text-gray-500 mt-2">
            Gunakan toolbar di atas untuk memformat konten Anda (bold, italic, list, dll.)
          </p>
        </div>

        <div class="mb-6">
          <label id="misi-label" class="block text-gray-700 text-sm font-semibold mb-2">Misi Sekolah</label>

          <!-- WYSIWYG Toolbar -->
          <div class="mb-2 flex flex-wrap gap-1 p-2 border border-primary-200 rounded-lg bg-white shadow-sm">
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('bold', 'misi')}
              title="Bold"
            >
              <span class="font-bold">B</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('italic', 'misi')}
              title="Italic"
            >
              <span class="italic">I</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('underline', 'misi')}
              title="Underline"
            >
              <span class="underline">U</span>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertUnorderedList', 'misi')}
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertOrderedList', 'misi')}
              title="Numbered List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <div class="flex items-center gap-1">
              <input type="number" bind:value={startNumber} class="w-12 p-1 border rounded text-sm" min="1" title="Start Number">
              <button type="button" on:click={() => setOrderedListStart('misi')} class="px-2 py-1 bg-primary-100 hover:bg-primary-200 rounded text-xs font-bold text-primary-800">Set</button>
            </div>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyLeft', 'misi')}
              title="Align Left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyCenter', 'misi')}
              title="Align Center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M9 18h6" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyRight', 'misi')}
              title="Align Right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 12h12M13 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyFull', 'misi')}
              title="Justify"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Content editor -->
          <div
            id="misi"
            contenteditable="true"
            aria-labelledby="misi-label"
            class="block w-full pl-4 pr-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-40 overflow-y-auto"
            on:input={() => handleContentChange('misi')}
            on:blur={() => handleContentChange('misi')}
            placeholder="Masukkan misi sekolah..."
          ></div>
          <p class="text-xs text-gray-500 mt-2">
            Gunakan toolbar di atas untuk memformat konten Anda (bold, italic, list, dll.)
          </p>
        </div>

        <div class="mb-6">
          <label id="fasilitas-label" class="block text-gray-700 text-sm font-semibold mb-2">Fasilitas Sekolah</label>

          <!-- WYSIWYG Toolbar -->
          <div class="mb-2 flex flex-wrap gap-1 p-2 border border-primary-200 rounded-lg bg-white shadow-sm">
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('bold', 'fasilitas')}
              title="Bold"
            >
              <span class="font-bold">B</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('italic', 'fasilitas')}
              title="Italic"
            >
              <span class="italic">I</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('underline', 'fasilitas')}
              title="Underline"
            >
              <span class="underline">U</span>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertUnorderedList', 'fasilitas')}
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertOrderedList', 'fasilitas')}
              title="Numbered List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <div class="flex items-center gap-1">
              <input type="number" bind:value={startNumber} class="w-12 p-1 border rounded text-sm" min="1" title="Start Number">
              <button type="button" on:click={() => setOrderedListStart('fasilitas')} class="px-2 py-1 bg-primary-100 hover:bg-primary-200 rounded text-xs font-bold text-primary-800">Set</button>
            </div>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyLeft', 'fasilitas')}
              title="Align Left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyCenter', 'fasilitas')}
              title="Align Center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M9 18h6" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyRight', 'fasilitas')}
              title="Align Right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 12h12M13 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyFull', 'fasilitas')}
              title="Justify"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Content editor -->
          <div
            id="fasilitas"
            contenteditable="true"
            aria-labelledby="fasilitas-label"
            class="block w-full pl-4 pr-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-40 overflow-y-auto"
            on:input={() => handleContentChange('fasilitas')}
            on:blur={() => handleContentChange('fasilitas')}
            placeholder="Masukkan informasi fasilitas sekolah..."
          ></div>
          <p class="text-xs text-gray-500 mt-2">
            Gunakan toolbar di atas untuk memformat konten Anda (bold, italic, list, dll.)
          </p>
        </div>

        <div class="mb-6">
          <label id="kontak-label" class="block text-gray-700 text-sm font-semibold mb-2">Kontak Sekolah</label>

          <!-- WYSIWYG Toolbar -->
          <div class="mb-2 flex flex-wrap gap-1 p-2 border border-primary-200 rounded-lg bg-white shadow-sm">
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('bold', 'kontak')}
              title="Bold"
            >
              <span class="font-bold">B</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('italic', 'kontak')}
              title="Italic"
            >
              <span class="italic">I</span>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('underline', 'kontak')}
              title="Underline"
            >
              <span class="underline">U</span>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertUnorderedList', 'kontak')}
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('insertOrderedList', 'kontak')}
              title="Numbered List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <div class="flex items-center gap-1">
              <input type="number" bind:value={startNumber} class="w-12 p-1 border rounded text-sm" min="1" title="Start Number">
              <button type="button" on:click={() => setOrderedListStart('kontak')} class="px-2 py-1 bg-primary-100 hover:bg-primary-200 rounded text-xs font-bold text-primary-800">Set</button>
            </div>
            <div class="border-l border-primary-200 h-6 my-auto"></div>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyLeft', 'kontak')}
              title="Align Left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyCenter', 'kontak')}
              title="Align Center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M9 18h6" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyRight', 'kontak')}
              title="Align Right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 12h12M13 18h7" />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 rounded hover:bg-primary-100 text-gray-700"
              on:click={() => formatText('justifyFull', 'kontak')}
              title="Justify"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Content editor -->
          <div
            id="kontak"
            contenteditable="true"
            aria-labelledby="kontak-label"
            class="block w-full pl-4 pr-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-32 overflow-y-auto"
            on:input={() => handleContentChange('kontak')}
            on:blur={() => handleContentChange('kontak')}
            placeholder="Masukkan informasi kontak sekolah..."
          ></div>
          <p class="text-xs text-gray-500 mt-2">
            Gunakan toolbar di atas untuk memformat konten Anda (bold, italic, list, dll.)
          </p>
        </div>

        <!-- Google Maps Integration -->
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-semibold mb-2">Alamat & Lokasi</label>
          <div class="space-y-4">
            <div>
              <label for="alamat-input" class="block text-gray-700 text-sm mb-1">Alamat Lengkap</label>
              <input
                type="text"
                id="alamat-input"
                class="block w-full px-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-200 sm:text-sm transition-all duration-200 bg-white"
                bind:value={alamat}
                placeholder="Contoh: Jl. Raya Bogor No. 12, Ciracas, Jakarta Timur, DKI Jakarta"
              />
              <p class="text-xs text-gray-500 mt-1">Masukkan alamat lengkap sekolah Anda</p>
            </div>

            <div>
              <label class="block text-gray-700 text-sm mb-1">Embed Google Maps</label>
              <textarea
                id="maps-embed"
                class="block w-full px-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-32"
                bind:value={mapsEmbed}
                placeholder="Tempelkan kode embed Google Maps di sini..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">Gunakan Google Maps, klik 'Share' -> 'Embed a map', lalu salin kode HTML-nya</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="submit"
            class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>