import { c as create_ssr_component, g as getContext } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  getContext("userStore");
  return `<div class="max-w-6xl mx-auto"><h1 class="text-2xl font-bold text-gray-800 mb-6" data-svelte-h="svelte-1s0tlg">Galeri Menunggu Persetujuan</h1> ${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-l4nk0p"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat galeri menunggu persetujuan...</p></div></div>`}</div>`;
});
export {
  Page as default
};
