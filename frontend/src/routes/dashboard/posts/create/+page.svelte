<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount, getContext } from 'svelte';
  import { get } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import type { User } from '$lib/types';
  import { API_URL } from '$lib/config';
  import { auth } from '$lib/stores';

  const user = getContext<Writable<User | null>>('userStore');

  interface Category {
    id: number;
    name: string;
  }

  let title = '';
  let content = ''; // This will eventually be handled by a WYSIWYG editor
  let selectedCategory: number | null = null;
  let categories: Category[] = [];
  let errorMessage: string | null = null;
  let successMessage: string | null = null;
  let loading = false;
  let token: string | null = null;
  let currentUserRole: string | null = null;

  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = null;
  let startNumber = 1;
  let contentImageInput: HTMLInputElement;
  let contentImageUploading = false;

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

  function formatText(command: string, value: string = '') {

    try {
      const contentDiv = document.getElementById('content');
      if (!contentDiv) {
        console.error('Content div not found!');
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
    handleContentChange();
  }

  function toggleList(listType: 'ul' | 'ol', contentDiv: HTMLElement) {

    // First check if we're already inside a list of this type
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
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
    // For now, let's handle the most common scenario: convert all direct block children to list items
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

  function handleContentChange() {
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      content = contentDiv.innerHTML;
    }
  }

  function setOrderedListStart() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer as HTMLElement;
    if (element.nodeType === 3) element = element.parentElement as HTMLElement;

    const list = element.closest('ol');
    if (list) {
      list.setAttribute('start', startNumber.toString());
      handleContentChange();
    }
  }

  async function handleContentImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !token) return;

    contentImageUploading = true;
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/posts/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload gagal');

      const data = await response.json();
      const imgUrl = `${API_URL}${data.url}`;

      const contentDiv = document.getElementById('content');
      if (contentDiv) {
        contentDiv.focus();
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = file.name;
        img.className = 'max-w-full h-auto rounded-lg my-2';
        img.loading = 'lazy';

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.collapse(false);
          range.insertNode(img);
          range.setStartAfter(img);
          range.setEndAfter(img);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          contentDiv.appendChild(img);
        }

        const br = document.createElement('br');
        contentDiv.appendChild(br);
        handleContentChange();
      }
    } catch (e: any) {
      console.error('Image upload error:', e);
      alert('Gagal upload gambar: ' + e.message);
    } finally {
      contentImageUploading = false;
      if (contentImageInput) contentImageInput.value = '';
    }
  }

  function insertContentImage() {
    contentImageInput.click();
  }

  // Initialize content in the contenteditable div when the component mounts
  function initializeContentDiv() {
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = content;
    }
  }

  onMount(async () => {
    const storedToken = get(auth).token;
    const currentUser = get(auth).user;
    if (storedToken && currentUser) {
      token = storedToken;
      currentUserRole = currentUser.role;
      await fetchCategories();
      // Initialize content in the contenteditable div after the DOM is ready
      setTimeout(initializeContentDiv, 0);
    } else {
      goto('/login');
    }
  });

  async function fetchCategories() {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}` // Assuming categories can be fetched by logged-in users
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      categories = await response.json();
    } catch (e: any) {
      console.error('Fetch categories error:', e);
      errorMessage = 'Failed to load categories.';
    }
  }

  async function handleSubmit(isDraft = false) {
    loading = true;
    errorMessage = null;
    successMessage = null;

    if (!token) {
      errorMessage = 'No authentication token found. Please log in again.';
      loading = false;
      return;
    }

    try {
      // Update content from the contenteditable div before submission
      handleContentChange();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (selectedCategory) {
        formData.append('category_id', selectedCategory.toString());
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      // Add status based on button clicked
      formData.append('status', isDraft ? 'draft' : (currentUserRole === 'student' ? 'pending_approval' : 'published'));

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        goto('/login');
        return;
      }

      let responseBody: string;
      try {
        responseBody = await response.text(); // Consume body once as text
      } catch (e: any) {
        console.error('Failed to read response body as text:', e);
        errorMessage = `Server error: ${response.status} - Could not read response body.`;
        loading = false;
        return;
      }

      let data;
      try {
        data = JSON.parse(responseBody); // Try to parse the text as JSON
      } catch (jsonError) {
        console.error('Failed to parse response body as JSON:', jsonError, 'Raw text:', responseBody);
        errorMessage = `Server error: ${response.status} - ${responseBody || 'Unknown error'}`; // Use raw text if JSON parsing fails
        loading = false;
        return;
      }

      if (response.ok) {
        const statusText = isDraft ? 'Draft' :
                         data.status === 'published' ? 'Published' :
                         data.status === 'pending_approval' ? 'Pending Approval' : 'Draft';
        successMessage = `Post saved successfully! Status: ${statusText}`;
        title = '';
        content = '';
        selectedCategory = null;
        selectedImage = null; // Clear image selection on success
        imagePreviewUrl = null; // Clear image preview on success
      } else {
        errorMessage = data.message || `Failed to create post. Status: ${response.status}`;
      }
    } catch (error: any) {
      console.error('Create post error:', error);
      errorMessage = 'Network error or server unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Buat Postingan Baru - Dashboard</title>
  <style>
    #content ul {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: disc; /* Explicitly set disc for ul */
    }
    #content ol {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: decimal; /* Explicitly set decimal for ol */
    }
    #content li {
      margin: 0.25rem 0;
      display: list-item; /* Ensure li elements display as list items */
    }
  </style>
</svelte:head>

<div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl">
  <h2 class="text-2xl font-bold text-primary-800 mb-6">Buat Postingan Baru</h2>

  <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">
    {#if errorMessage}
      <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{errorMessage}</span>
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
        <label for="title" class="block text-gray-700 text-sm font-semibold mb-2">Judul Postingan</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <input
            type="text"
            id="title"
            class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
            bind:value={title}
            placeholder="Masukkan judul postingan Anda"
            required
          />
        </div>
      </div>

      <div class="mb-6">
        <label for="category" class="block text-gray-700 text-sm font-semibold mb-2">Kategori</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <select
            id="category"
            class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white"
            bind:value={selectedCategory}
          >
            <option value={null}>Pilih Kategori</option>
            {#each categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="mb-8">
        <label for="content" class="block text-gray-700 text-sm font-semibold mb-2">Konten</label>

        <!-- WYSIWYG Toolbar -->
        <div class="mb-2 flex flex-wrap gap-1 p-2 border border-primary-200 rounded-lg bg-white shadow-sm">
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('bold')}
            title="Bold"
          >
            <span class="font-bold">B</span>
          </button>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('italic')}
            title="Italic"
          >
            <span class="italic">I</span>
          </button>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('underline')}
            title="Underline"
          >
            <span class="underline">U</span>
          </button>
          <div class="border-l border-primary-200 h-6 my-auto"></div>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('insertUnorderedList')}
            title="Bullet List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('insertOrderedList')}
            title="Numbered List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <div class="border-l border-primary-200 h-6 my-auto"></div>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('justifyLeft')}
            title="Align Left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h7" />
            </svg>
          </button>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('justifyCenter')}
            title="Align Center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M9 18h6" />
            </svg>
          </button>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('justifyRight')}
            title="Align Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 12h12M13 18h7" />
            </svg>
          </button>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('justifyFull')}
            title="Justify"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="border-l border-primary-200 h-6 my-auto"></div>
          <div class="flex items-center gap-1">
            <input type="number" bind:value={startNumber} class="w-12 p-1 border rounded text-sm" min="1" title="Start Number">
            <button type="button" on:click={setOrderedListStart} class="px-2 py-1 bg-primary-100 hover:bg-primary-200 rounded text-xs font-bold text-primary-800">Set</button>
          </div>
          <div class="border-l border-primary-200 h-6 my-auto"></div>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={() => formatText('formatBlock', '<h2>')}
            title="Heading"
          >
            H
          </button>
          <div class="border-l border-primary-200 h-6 my-auto"></div>
          <button
            type="button"
            class="p-2 rounded hover:bg-primary-100 text-gray-700"
            on:click={insertContentImage}
            title="Sisipkan Gambar"
            disabled={contentImageUploading}
          >
            {#if contentImageUploading}
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            {/if}
          </button>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            bind:this={contentImageInput}
            on:change={handleContentImageUpload}
          />
        </div>

        <!-- Content editor -->
        <div
          id="content"
          contenteditable="true"
          class="block w-full pl-4 pr-3 pt-3 pb-2 border border-primary-200 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 bg-white h-64 overflow-y-auto"
          style="outline: none;"
          on:input={handleContentChange}
          on:blur={handleContentChange}
          placeholder="Tulis konten postingan Anda di sini..."
        ></div>
        <p class="text-xs text-gray-500 mt-2">
          Gunakan toolbar di atas untuk memformat konten Anda (bold, italic, list, dll.)
        </p>
      </div>

      <div class="mb-6">
        <label for="image" class="block text-gray-700 text-sm font-semibold mb-2">Gambar Postingan</label>
        <div class="flex flex-col sm:flex-row sm:items-start gap-6">
          <!-- File input container -->
          <div class="flex-1">
            <div class="relative">
              <input
                type="file"
                id="image"
                accept="image/*"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                on:change={handleImageChange}
              />
              <div class="p-6 border-2 border-dashed border-primary-200 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[120px]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p class="text-primary-700 font-medium">Pilih gambar atau seret ke sini</p>
                <p class="text-gray-500 text-sm mt-1">JPG, PNG, GIF hingga 5MB</p>
              </div>
            </div>

            {#if selectedImage}
              <p class="mt-2 text-sm text-gray-600">
                File dipilih: <span class="font-medium">{selectedImage.name}</span>
              </p>
            {/if}
          </div>

          <!-- Image preview -->
          {#if imagePreviewUrl}
            <div class="sm:w-48 flex-shrink-0">
              <div class="rounded-xl overflow-hidden border border-primary-200 shadow-md bg-white">
                <img
                  src={imagePreviewUrl}
                  alt="Image Preview"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-48 object-cover"
                />
                <div class="p-3 bg-gray-50">
                  <p class="text-xs text-gray-500 truncate">
                    {selectedImage?.name}
                  </p>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            on:click={() => handleSubmit(true)}
            class="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            disabled={loading}
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Simpan sebagai Draft
            {/if}
          </button>

          <button
            type="button"
            on:click={() => handleSubmit(false)}
            class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            disabled={loading}
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {currentUserRole === 'student' ? 'Kirim untuk Persetujuan' : 'Publikasikan'}
            {/if}
          </button>
        </div>

        <a href="/dashboard/posts/my-posts" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg shadow transition-all duration-200 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Batal
        </a>
      </div>
    </form>
  </div>
</div>
