import { c as create_ssr_component, a as subscribe, g as getContext, o as onDestroy, e as escape, s as setContext, v as validate_component } from "../../chunks/ssr.js";
import { d as derived, w as writable } from "../../chunks/index2.js";
import { p as page } from "../../chunks/stores.js";
function isActive(currentPath2, targetPath) {
  const current = currentPath2.replace(/\/$/, "") || "/";
  const target = targetPath.replace(/\/$/, "") || "/";
  if (target === "/") {
    return current === "/";
  }
  return current === target || current.startsWith(target + "/");
}
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $user, $$unsubscribe_user;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const user = getContext("userStore");
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  getContext("schoolInfoStore");
  onDestroy(() => {
  });
  $$unsubscribe_page();
  $$unsubscribe_user();
  return `<header class="${"text-white p-4 sticky top-0 z-50 transition-all duration-300 " + escape(
    "bg-primary-700 shadow-lg",
    true
  )}"><nav class="container mx-auto flex justify-between items-center">${`<a href="/" class="text-xl md:text-2xl font-bold tracking-tight flex items-center" data-svelte-h="svelte-1f79o3b"><span class="bg-white text-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">S</span>
        Sekolah Modern</a>`}  <button class="lg:hidden p-2 rounded-md hover:bg-primary-800 focus:outline-none transition-colors" aria-label="Toggle menu"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">${`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>`}</svg></button>  <ul class="hidden lg:flex space-x-6 items-center"><li><a href="/" class="${"hover:text-primary-100 transition-colors duration-200 border-b-2 " + escape(
    isActive($page.url.pathname, "/") ? "border-white text-white" : "border-transparent text-primary-50",
    true
  )}">Beranda</a></li> <li><a href="/tentang-kami" class="${"hover:text-primary-100 transition-colors duration-200 border-b-2 " + escape(
    isActive($page.url.pathname, "/tentang-kami") ? "border-white text-white" : "border-transparent text-primary-50",
    true
  )}">Tentang Kami</a></li> <li><a href="/blog" class="${"hover:text-primary-100 transition-colors duration-200 border-b-2 " + escape(
    isActive($page.url.pathname, "/blog") ? "border-white text-white" : "border-transparent text-primary-50",
    true
  )}">Blog</a></li> <li><a href="/galeri" class="${"hover:text-primary-100 transition-colors duration-200 border-b-2 " + escape(
    isActive($page.url.pathname, "/galeri") ? "border-white text-white" : "border-transparent text-primary-50",
    true
  )}">Galeri</a></li> ${$user ? `<li><a href="${"/dashboard/" + escape($user.role, true)}" class="${"hover:text-primary-100 transition-colors duration-200 border-b-2 " + escape(
    isActive($page.url.pathname, "/dashboard") ? "border-white text-white" : "border-transparent text-primary-50",
    true
  ) + " capitalize"}">Dashboard</a></li> <li><button class="bg-primary-800 hover:bg-primary-900 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105" data-svelte-h="svelte-9p2aad">Logout</button></li>` : `<li data-svelte-h="svelte-zibtk4"><a href="/login" class="bg-white text-primary-700 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Login</a></li>`}</ul></nav>  ${``} ${``}</header>`;
});
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  getContext("aboutStore");
  getContext("schoolInfoStore");
  onDestroy(() => {
  });
  $$unsubscribe_page();
  return `<footer class="bg-gradient-to-r from-primary-800 to-primary-900 text-primary-100 p-8 mt-12 shadow-lg"><div class="container mx-auto"><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div>${`<h3 class="text-lg font-semibold mb-4 text-white" data-svelte-h="svelte-98qjpm">Sekolah Modern</h3> <p class="text-primary-200" data-svelte-h="svelte-n4dzz4">Pendidikan Masa Depan, Mulai dari Sini.</p>`}</div> <div data-svelte-h="svelte-fwdfh5"><h3 class="text-lg font-semibold mb-4 text-white">Tautan</h3> <ul class="space-y-2"><li><a href="/" class="text-primary-200 hover:text-white transition-colors">Beranda</a></li> <li><a href="/tentang-kami" class="text-primary-200 hover:text-white transition-colors">Tentang Kami</a></li> <li><a href="/blog" class="text-primary-200 hover:text-white transition-colors">Blog</a></li> <li><a href="/galeri" class="text-primary-200 hover:text-white transition-colors">Galeri</a></li></ul></div> <div><h3 class="text-lg font-semibold mb-4 text-white" data-svelte-h="svelte-dz8jvs">Kontak</h3> ${`<p class="text-primary-200" data-svelte-h="svelte-1c9a6qp">Memuat kontak...</p>`}</div></div> <div class="border-t border-primary-700 mt-8 pt-6 text-center text-primary-300">${`<p>© ${escape((/* @__PURE__ */ new Date()).getFullYear())} Sekolah Modern. Hak Cipta Dilindungi.</p> <p class="mt-1" data-svelte-h="svelte-n11le4">Dibangun dengan ❤️ oleh Tim Pengembang</p>`}</div></div></footer>`;
});
const app = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $siteName, $$unsubscribe_siteName;
  const user = writable(null);
  const aboutData = writable(null);
  const schoolInfo = writable(null);
  const siteName = derived(schoolInfo, ($schoolInfo) => {
    return $schoolInfo?.school_name || "Sekolah Modern";
  });
  $$unsubscribe_siteName = subscribe(siteName, (value) => $siteName = value);
  setContext("userStore", user);
  setContext("aboutStore", aboutData);
  setContext("schoolInfoStore", schoolInfo);
  setContext("siteNameStore", siteName);
  $$unsubscribe_siteName();
  return `${$$result.head += `<!-- HEAD_svelte-zjh9kr_START -->${$$result.title = `<title>${escape($siteName)}</title>`, ""}<!-- HEAD_svelte-zjh9kr_END -->`, ""} <div class="flex flex-col min-h-screen font-sans bg-gradient-to-b from-gray-50 to-white">${validate_component(Header, "Header").$$render($$result, {}, {}, {})} <main class="flex-grow container mx-auto p-4 max-w-7xl">${slots.default ? slots.default({}) : ``}</main> ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Layout as default
};
