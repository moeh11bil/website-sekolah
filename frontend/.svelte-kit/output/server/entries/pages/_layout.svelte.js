import { c as create_ssr_component, a as subscribe, g as getContext, o as onDestroy, e as escape, b as add_attribute, d as each, f as get_store_value, s as setContext, v as validate_component } from "../../chunks/ssr.js";
import { w as writable, d as derived } from "../../chunks/index2.js";
import { p as page } from "../../chunks/stores.js";
import { a as auth } from "../../chunks/auth.js";
function isActive(currentPath2, targetPath) {
  const current = currentPath2.replace(/\/$/, "") || "/";
  const target = targetPath.replace(/\/$/, "") || "/";
  if (target === "/") {
    return current === "/";
  }
  return current === target || current.startsWith(target + "/");
}
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPath;
  let displayName;
  let displayRole;
  let initials;
  let $user, $$unsubscribe_user;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const user = getContext("userStore");
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  getContext("schoolInfoStore");
  onDestroy(() => {
  });
  const roleLabels = {
    admin: "Administrator",
    teacher: "Guru",
    student: "Siswa"
  };
  let userMenuOpen = false;
  let userMenuRef = null;
  let mobileMenuOpen = false;
  currentPath = $page.url.pathname;
  displayName = $user?.full_name || $user?.username || "";
  displayRole = $user ? roleLabels[$user.role] || $user.role : "";
  initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  {
    if (currentPath) {
      mobileMenuOpen = false;
      userMenuOpen = false;
    }
  }
  $$unsubscribe_user();
  $$unsubscribe_page();
  return `<header class="${"text-white p-4 sticky top-0 z-50 transition-all duration-300 " + escape(
    "bg-primary-700 shadow-lg",
    true
  )}"><nav class="container mx-auto flex justify-between items-center">${`<a href="/" class="text-xl md:text-2xl font-bold tracking-tight flex items-center" data-svelte-h="svelte-1f79o3b"><span class="bg-white text-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">S</span>
        Sekolah Modern</a>`}  <button class="lg:hidden p-2 rounded-md hover:bg-primary-800 focus:outline-none transition-colors" aria-label="Toggle menu"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">${mobileMenuOpen ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>` : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>`}</svg></button>  <ul class="hidden lg:flex space-x-6 items-center"><li><a href="/" class="${"hover:text-primary-100 transition-colors duration-200 border-b-2 " + escape(
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
  )}">Galeri</a></li> ${$user ? `<li class="pl-5 border-l border-white/20 relative"${add_attribute("this", userMenuRef, 0)}><button type="button" aria-haspopup="menu"${add_attribute("aria-expanded", userMenuOpen, 0)} class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"><span class="w-9 h-9 flex-shrink-0 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-xs font-bold text-white select-none" aria-hidden="true">${escape(initials)}</span> <span class="flex flex-col items-start leading-tight text-left min-w-0"><span class="text-sm font-semibold text-white max-w-[170px] truncate"${add_attribute("title", displayName, 0)}>${escape(displayName)}</span> <span class="text-[11px] font-medium text-primary-200 capitalize">${escape(displayRole)}</span></span> <svg xmlns="http://www.w3.org/2000/svg" class="${"w-4 h-4 text-primary-200 transition-transform duration-200 " + escape(userMenuOpen ? "rotate-180" : "", true)}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> ${userMenuOpen ? `<div role="menu" class="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"><div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 mb-1"><span class="w-10 h-10 flex-shrink-0 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold text-white select-none" aria-hidden="true">${escape(initials)}</span> <div class="min-w-0 leading-tight"><p class="text-sm font-semibold text-gray-900 truncate"${add_attribute("title", displayName, 0)}>${escape(displayName)}</p> <p class="text-xs text-gray-500 capitalize">${escape(displayRole)}</p></div></div> <a href="${"/dashboard/" + escape($user.role, true)}" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors capitalize"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Dashboard</a> <button type="button" role="menuitem" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" data-svelte-h="svelte-up7lwg"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Logout</button></div>` : ``}</li>` : `<li data-svelte-h="svelte-zibtk4"><a href="/login" class="bg-white text-primary-700 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">Login</a></li>`}</ul></nav>  ${mobileMenuOpen ? `<div class="lg:hidden absolute top-full left-0 w-full bg-primary-700 shadow-xl border-t border-primary-500 animate-in slide-in-from-top duration-200"><ul class="flex flex-col p-4 space-y-4"><li><a href="/" class="${"block py-2 px-4 rounded-lg " + escape(
    isActive($page.url.pathname, "/") ? "bg-primary-800 text-white font-bold" : "text-primary-100 hover:bg-primary-600",
    true
  ) + " transition-colors"}">Beranda</a></li> <li><a href="/tentang-kami" class="${"block py-2 px-4 rounded-lg " + escape(
    isActive($page.url.pathname, "/tentang-kami") ? "bg-primary-800 text-white font-bold" : "text-primary-100 hover:bg-primary-600",
    true
  ) + " transition-colors"}">Tentang Kami</a></li> <li><a href="/blog" class="${"block py-2 px-4 rounded-lg " + escape(
    isActive($page.url.pathname, "/blog") ? "bg-primary-800 text-white font-bold" : "text-primary-100 hover:bg-primary-600",
    true
  ) + " transition-colors"}">Blog</a></li> <li><a href="/galeri" class="${"block py-2 px-4 rounded-lg " + escape(
    isActive($page.url.pathname, "/galeri") ? "bg-primary-800 text-white font-bold" : "text-primary-100 hover:bg-primary-600",
    true
  ) + " transition-colors"}">Galeri</a></li> ${$user ? `<li class="flex items-center gap-3 bg-primary-800/60 border border-white/10 rounded-lg px-4 py-3"><span class="w-9 h-9 flex-shrink-0 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-xs font-bold text-white select-none" aria-hidden="true">${escape(initials)}</span> <span class="min-w-0 leading-tight"><span class="block text-sm font-semibold text-white truncate"${add_attribute("title", displayName, 0)}>${escape(displayName)}</span> <span class="block text-[11px] text-primary-200 capitalize">${escape(displayRole)}</span></span></li> <li><a href="${"/dashboard/" + escape($user.role, true)}" class="${"block py-2 px-4 rounded-lg " + escape(
    isActive($page.url.pathname, "/dashboard") ? "bg-primary-800 text-white font-bold" : "text-primary-100 hover:bg-primary-600",
    true
  ) + " transition-colors capitalize"}">Dashboard</a></li> <li><button class="w-full text-left py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors" data-svelte-h="svelte-oa59j4">Logout</button></li>` : `<li><a href="/login" class="block py-2 px-4 rounded-lg bg-white text-primary-700 text-center font-bold hover:bg-primary-50 transition-colors" data-svelte-h="svelte-19ebvb5">Login</a></li>`}</ul></div>` : ``} ${``}</header>`;
});
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  getContext("aboutStore");
  getContext("schoolInfoStore");
  onDestroy(() => {
  });
  return `<footer class="bg-gradient-to-r from-primary-800 to-primary-900 text-primary-100 p-8 mt-12 shadow-lg"><div class="container mx-auto"><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div>${`<h3 class="text-lg font-semibold mb-4 text-white" data-svelte-h="svelte-98qjpm">Sekolah Modern</h3> <p class="text-primary-200" data-svelte-h="svelte-n4dzz4">Pendidikan Masa Depan, Mulai dari Sini.</p>`}</div> <div data-svelte-h="svelte-fwdfh5"><h3 class="text-lg font-semibold mb-4 text-white">Tautan</h3> <ul class="space-y-2"><li><a href="/" class="text-primary-200 hover:text-white transition-colors">Beranda</a></li> <li><a href="/tentang-kami" class="text-primary-200 hover:text-white transition-colors">Tentang Kami</a></li> <li><a href="/blog" class="text-primary-200 hover:text-white transition-colors">Blog</a></li> <li><a href="/galeri" class="text-primary-200 hover:text-white transition-colors">Galeri</a></li></ul></div> <div><h3 class="text-lg font-semibold mb-4 text-white" data-svelte-h="svelte-dz8jvs">Kontak</h3> ${`<p class="text-primary-200" data-svelte-h="svelte-1c9a6qp">Memuat kontak...</p>`}</div></div> <div class="border-t border-primary-700 mt-8 pt-6 text-center text-primary-300">${`<p>© ${escape((/* @__PURE__ */ new Date()).getFullYear())} Sekolah Modern. Hak Cipta Dilindungi.</p> <p class="mt-1" data-svelte-h="svelte-n11le4">Dibangun dengan ❤️ oleh Tim Pengembang</p>`}</div></div></footer>`;
});
const toasts = writable([]);
const Toast_svelte_svelte_type_style_lang = "";
const css = {
  code: "@keyframes svelte-17bfuct-slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}.animate-slide-in.svelte-17bfuct{animation:svelte-17bfuct-slideIn 0.3s ease-out}",
  map: null
};
const Toast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $toasts, $$unsubscribe_toasts;
  $$unsubscribe_toasts = subscribe(toasts, (value) => $toasts = value);
  const icons = {
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  };
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-primary-500"
  };
  $$result.css.add(css);
  $$unsubscribe_toasts();
  return `${each($toasts, (t) => {
    return `<div class="fixed top-4 right-4 z-[9999] animate-slide-in svelte-17bfuct"><div class="${"flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white " + escape(colors[t.type], true) + " min-w-[300px] max-w-md svelte-17bfuct"}"><svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${add_attribute("d", icons[t.type], 0)}></path></svg> <p class="text-sm font-medium flex-1">${escape(t.message)}</p> <button class="text-white/80 hover:text-white flex-shrink-0" data-svelte-h="svelte-dir185"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> </button></div> </div>`;
  })}`;
});
const app = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  let $siteName, $$unsubscribe_siteName;
  $$unsubscribe_page = subscribe(page, (value) => value);
  const user = writable(get_store_value(auth).user);
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
  const unsubscribeAuth = auth.subscribe((state) => {
    user.set(state.user);
  });
  onDestroy(() => {
    unsubscribeAuth();
  });
  $$unsubscribe_page();
  $$unsubscribe_siteName();
  return `${$$result.head += `<!-- HEAD_svelte-zjh9kr_START -->${$$result.title = `<title>${escape($siteName)}</title>`, ""}<!-- HEAD_svelte-zjh9kr_END -->`, ""} <div class="flex flex-col min-h-screen font-sans bg-gradient-to-b from-gray-50 to-white">${validate_component(Header, "Header").$$render($$result, {}, {}, {})} <main class="flex-grow container mx-auto p-4 max-w-7xl">${slots.default ? slots.default({}) : ``}</main> ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})} ${validate_component(Toast, "Toast").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Layout as default
};
