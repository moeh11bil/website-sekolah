import { c as create_ssr_component, g as getContext } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  getContext("schoolInfoStore");
  return `<div class="max-w-4xl mx-auto"><section class="py-8"><div class="bg-white rounded-2xl shadow-xl p-8 border border-primary-100"><h1 class="text-3xl font-bold text-primary-800 mb-6" data-svelte-h="svelte-1ul17a6">Pengaturan Informasi Sekolah</h1> ${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-v2xf6y"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat informasi sekolah...</p></div></div>`}</div></section></div>`;
});
export {
  Page as default
};
