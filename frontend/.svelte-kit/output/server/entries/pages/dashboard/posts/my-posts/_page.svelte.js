import { c as create_ssr_component, g as getContext } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  getContext("userStore");
  return `${$$result.head += `<!-- HEAD_svelte-1mo3n3f_START -->${$$result.title = `<title>Postingan Saya - Dashboard</title>`, ""}<!-- HEAD_svelte-1mo3n3f_END -->`, ""} <div class="bg-white rounded-xl shadow-lg p-6"><h2 class="text-2xl font-bold text-primary-800 mb-6" data-svelte-h="svelte-1e3ziqe">Postingan Saya</h2> ${`<div class="flex justify-center items-center h-64" data-svelte-h="svelte-1pvqhco"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memuat postingan...</p></div></div>`}</div>`;
});
export {
  Page as default
};
