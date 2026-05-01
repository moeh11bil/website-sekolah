import { c as create_ssr_component } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-e77rwt_START -->${$$result.title = `<title>Manajemen Tentang Kami - Dashboard Admin</title>`, ""}<style data-svelte-h="svelte-nlcr4a">#sejarah ul, #visi ul, #misi ul, #fasilitas ul, #kontak ul {
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
    }</style><!-- HEAD_svelte-e77rwt_END -->`, ""} <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl"><h2 class="text-2xl font-bold text-primary-800 mb-6" data-svelte-h="svelte-1w677xe">Manajemen Tentang Kami</h2> ${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-10r11do"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat konfigurasi tentang kami...</p></div></div>`}</div>`;
});
export {
  Page as default
};
