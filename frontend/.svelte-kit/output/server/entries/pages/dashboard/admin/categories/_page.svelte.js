import { c as create_ssr_component } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-mmuchr_START -->${$$result.title = `<title>Manajemen Kategori - Dashboard Admin</title>`, ""}<!-- HEAD_svelte-mmuchr_END -->`, ""} <div class="bg-white rounded-xl shadow-lg p-6"><div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6" data-svelte-h="svelte-oo75pe"><h2 class="text-2xl font-bold text-primary-800 mb-4 sm:mb-0">Manajemen Kategori</h2> <a href="/dashboard/admin/categories/create" class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      Tambah Kategori</a></div> ${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-1n3si0t"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat kategori...</p></div></div>`}  ${``}</div>`;
});
export {
  Page as default
};
