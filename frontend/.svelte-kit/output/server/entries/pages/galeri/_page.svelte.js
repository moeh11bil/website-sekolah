import { c as create_ssr_component, g as getContext, a as subscribe, e as escape } from "../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $siteName, $$unsubscribe_siteName;
  const siteName = getContext("siteNameStore");
  $$unsubscribe_siteName = subscribe(siteName, (value) => $siteName = value);
  $$unsubscribe_siteName();
  return `${$$result.head += `<!-- HEAD_svelte-155r83g_START -->${$$result.title = `<title>Galeri - ${escape($siteName)}</title>`, ""}<meta name="description" content="Kumpulan foto dan video kegiatan sekolah."><!-- HEAD_svelte-155r83g_END -->`, ""} <div class="max-w-7xl mx-auto"><header class="mb-12 text-center" data-svelte-h="svelte-ceqvku"><h1 class="text-4xl md:text-5xl font-bold text-primary-800 mb-4">Galeri Kami</h1> <p class="text-lg text-primary-600 max-w-2xl mx-auto">Lihat momen-momen terbaik dari kegiatan sekolah kami yang penuh makna dan kenangan.</p> <div class="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full mt-4"></div></header> <section class="py-8">${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-15jna4b"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat galeri...</p></div></div>`}</section></div>`;
});
export {
  Page as default
};
