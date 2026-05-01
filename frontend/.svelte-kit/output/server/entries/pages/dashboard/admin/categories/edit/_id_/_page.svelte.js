import { c as create_ssr_component, a as subscribe } from "../../../../../../../chunks/ssr.js";
import { p as page } from "../../../../../../../chunks/stores.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-1wcb4m5_START -->${$$result.title = `<title>Edit Kategori - Dashboard Admin</title>`, ""}<!-- HEAD_svelte-1wcb4m5_END -->`, ""} <div class="bg-white rounded-xl shadow-lg p-6 max-w-2xl"><h2 class="text-2xl font-bold text-primary-800 mb-6" data-svelte-h="svelte-1fjx5a1">Edit Kategori</h2> <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">${``} ${``} ${`${`<div class="bg-primary-50 border border-primary-100 text-primary-700 px-4 py-8 rounded-lg text-center" data-svelte-h="svelte-3vvszg"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <p class="text-lg">Kategori tidak ditemukan.</p></div>`}`}</div></div>`;
});
export {
  Page as default
};
