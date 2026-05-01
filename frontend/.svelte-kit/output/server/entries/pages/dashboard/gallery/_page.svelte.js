import { c as create_ssr_component, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-lz3ll8_START -->${$$result.title = `<title>Manajemen Galeri - Dashboard ${escape("Siswa")}</title>`, ""}<!-- HEAD_svelte-lz3ll8_END -->`, ""} <div class="bg-white rounded-xl shadow-lg p-6 max-w-6xl"><h2 class="text-2xl font-bold text-primary-800 mb-6" data-svelte-h="svelte-88j3zh">Manajemen Galeri</h2> ${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-y0067u"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat item galeri...</p></div></div>`}  ${``}</div>`;
});
export {
  Page as default
};
