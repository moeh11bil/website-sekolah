import { c as create_ssr_component, g as getContext, a as subscribe, e as escape } from "../../../chunks/ssr.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".prose ul{padding-left:1.5rem;margin:0.5rem 0;list-style-type:disc}.prose ol{padding-left:1.5rem;margin:0.5rem 0;list-style-type:decimal}.prose li{margin:0.25rem 0;display:list-item}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $siteName, $$unsubscribe_siteName;
  const siteName = getContext("siteNameStore");
  $$unsubscribe_siteName = subscribe(siteName, (value) => $siteName = value);
  $$result.css.add(css);
  $$unsubscribe_siteName();
  return `${$$result.head += `<!-- HEAD_svelte-rwkfbp_START -->${$$result.title = `<title>Tentang Kami - ${escape($siteName)}</title>`, ""}<meta name="description" content="Informasi tentang sejarah, visi, misi, fasilitas, dan kontak sekolah kami."><!-- HEAD_svelte-rwkfbp_END -->`, ""} <div class="max-w-6xl mx-auto"><header class="text-center mb-12" data-svelte-h="svelte-hc62s0"><h1 class="text-4xl md:text-5xl font-bold text-primary-800 mb-4">Tentang Kami</h1> <p class="text-lg text-primary-600 max-w-2xl mx-auto">Informasi lengkap tentang sekolah kami, sejarah, visi, misi, fasilitas, dan cara menghubungi kami.</p> <div class="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full mt-4"></div></header> <section class="py-8">${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-1y41xy8"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat informasi tentang kami...</p></div></div>`}</section> </div>`;
});
export {
  Page as default
};
