import { c as create_ssr_component, a as subscribe, g as getContext, e as escape, d as add_attribute } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".prose ul{list-style-type:disc;padding-left:1.5rem;margin-top:0.5rem;margin-bottom:0.5rem}.prose ol{list-style-type:decimal;padding-left:1.5rem;margin-top:0.5rem;margin-bottom:0.5rem}.prose li{margin-top:0.25rem;margin-bottom:0.25rem}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $siteName, $$unsubscribe_siteName;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const siteName = getContext("siteNameStore");
  $$unsubscribe_siteName = subscribe(siteName, (value) => $siteName = value);
  $$result.css.add(css);
  $page.params.id;
  $$unsubscribe_page();
  $$unsubscribe_siteName();
  return `${$$result.head += `<!-- HEAD_svelte-150yieu_START -->${$$result.title = `<title>${escape("Post")} - ${escape($siteName)}</title>`, ""}<meta name="description"${add_attribute(
    "content",
    "Detail blog post",
    0
  )}><!-- HEAD_svelte-150yieu_END -->`, ""} <div class="max-w-4xl mx-auto"><section class="py-8">${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-ggutw8"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat postingan...</p></div></div>`}</section> </div>`;
});
export {
  Page as default
};
