import { c as create_ssr_component, g as getContext, a as subscribe, e as escape } from "../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $siteName, $$unsubscribe_siteName;
  const siteName = getContext("siteNameStore");
  $$unsubscribe_siteName = subscribe(siteName, (value) => $siteName = value);
  $$unsubscribe_siteName();
  return `${$$result.head += `<!-- HEAD_svelte-1m2xpk5_START -->${$$result.title = `<title>Login - ${escape($siteName)}</title>`, ""}<!-- HEAD_svelte-1m2xpk5_END -->`, ""} ${`<div class="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gradient-to-br from-primary-50 to-white p-4" data-svelte-h="svelte-w8nlhx"><div class="flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div> <p class="text-primary-700">Memeriksa status login...</p></div></div>`}`;
});
export {
  Page as default
};
