import { c as create_ssr_component, g as getContext, a as subscribe, e as escape, d as add_attribute } from "../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $siteName, $$unsubscribe_siteName;
  const siteName = getContext("siteNameStore");
  $$unsubscribe_siteName = subscribe(siteName, (value) => $siteName = value);
  let searchTerm = "";
  $$unsubscribe_siteName();
  return `${$$result.head += `<!-- HEAD_svelte-d0harr_START -->${$$result.title = `<title>Blog - ${escape($siteName)}</title>`, ""}<meta name="description" content="Baca artikel dan berita terbaru dari sekolah kami."><!-- HEAD_svelte-d0harr_END -->`, ""} <div class="max-w-6xl mx-auto"><header class="mb-12 text-center" data-svelte-h="svelte-ly33j"><h1 class="text-4xl md:text-5xl font-bold text-primary-800 mb-4">Blog Sekolah</h1> <p class="text-lg text-primary-600 max-w-2xl mx-auto">Baca artikel dan berita terbaru dari sekolah kami tentang pendidikan, kegiatan siswa, dan perkembangan akademik.</p> <div class="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full mt-4"></div></header>  <div class="mb-10 max-w-2xl mx-auto"><div class="relative"><input type="text" placeholder="Cari artikel blog..." class="w-full px-6 py-4 pr-14 rounded-full border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md"${add_attribute("value", searchTerm, 0)}> <div class="absolute inset-y-0 right-0 flex items-center pr-4" data-svelte-h="svelte-buf4li"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div></div></div> <section class="py-8">${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-1r7e7v4"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat postingan blog...</p></div></div>`}</section></div>`;
});
export {
  Page as default
};
