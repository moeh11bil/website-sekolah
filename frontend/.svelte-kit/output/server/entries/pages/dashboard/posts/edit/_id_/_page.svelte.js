import { c as create_ssr_component, a as subscribe } from "../../../../../../chunks/ssr.js";
import { p as page } from "../../../../../../chunks/stores.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-d7gvqq_START -->${$$result.title = `<title>Edit Postingan - Dashboard</title>`, ""}<style data-svelte-h="svelte-1whxwhw">#content ul {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: disc; /* Explicitly set disc for ul */
    }
    #content ol {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
      list-style-type: decimal; /* Explicitly set decimal for ol */
    }
    #content li {
      margin: 0.25rem 0;
      display: list-item; /* Ensure li elements display as list items */
    }</style><!-- HEAD_svelte-d7gvqq_END -->`, ""} <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl"><h2 class="text-2xl font-bold text-primary-800 mb-6" data-svelte-h="svelte-14mvcme">Edit Postingan</h2> <div class="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">${``} ${``} ${`${`<div class="bg-primary-50 border border-primary-100 text-primary-700 px-4 py-8 rounded-lg text-center" data-svelte-h="svelte-160ymij"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <p class="text-lg">Postingan tidak ditemukan.</p></div>`}`}</div></div>`;
});
export {
  Page as default
};
