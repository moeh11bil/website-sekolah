import { c as create_ssr_component, b as each, e as escape } from "../../../../../chunks/ssr.js";
const themes = {
  emerald: {
    name: "Emerald",
    primary: {
      DEFAULT: "#10B981",
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B"
    },
    accent: {
      DEFAULT: "#059669",
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B"
    }
  },
  ocean: {
    name: "Ocean",
    primary: {
      DEFAULT: "#3B82F6",
      // Blue-500
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A"
    },
    accent: {
      DEFAULT: "#2563EB",
      // Blue-600
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A"
    }
  },
  sunset: {
    name: "Sunset",
    primary: {
      DEFAULT: "#F59E0B",
      // Amber-500
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F"
    },
    accent: {
      DEFAULT: "#D97706",
      // Amber-600
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F"
    }
  }
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectedTheme = "emerald";
  let themeNames = Object.keys(themes);
  return `<div class="max-w-4xl mx-auto"><div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h1 class="text-2xl font-bold text-gray-800 mb-6" data-svelte-h="svelte-w9r35q">Pengaturan Tema</h1> <div class="mb-8"><h2 class="text-lg font-semibold text-gray-700 mb-4" data-svelte-h="svelte-3owef6">Pilih Tema Warna</h2> <p class="text-gray-600 mb-6" data-svelte-h="svelte-1hpl7t8">Pilih tema warna yang akan diterapkan ke seluruh situs.</p> <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${each(themeNames, (themeName, i) => {
    return `<div role="button" tabindex="0" class="${[
      "border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500",
      (selectedTheme === themeName ? "border-2" : "") + " " + (selectedTheme === themeName ? "border-primary-500" : "")
    ].join(" ").trim()}"><div class="flex items-center mb-3"><div class="w-5 h-5 rounded-full mr-2 border" style="${"background-color: " + escape(themes[themeName].primary.DEFAULT, true) + ";"}"></div> <span class="font-medium text-gray-800">${escape(themes[themeName].name)}</span></div> <div class="flex space-x-2"><div class="w-6 h-6 rounded-full border" style="${"background-color: " + escape(themes[themeName].primary[500], true) + ";"}"></div> <div class="w-6 h-6 rounded-full border" style="${"background-color: " + escape(themes[themeName].primary[300], true) + ";"}"></div> <div class="w-6 h-6 rounded-full border" style="${"background-color: " + escape(themes[themeName].accent[500], true) + ";"}"></div> <div class="w-6 h-6 rounded-full border" style="${"background-color: " + escape(themes[themeName].accent[300], true) + ";"}"></div></div> </div>`;
  })}</div></div> <div class="bg-gray-50 rounded-lg p-4 border border-gray-200" data-svelte-h="svelte-12922om"><h3 class="font-medium text-gray-800 mb-2">Pratinjau Tema</h3> <p class="text-gray-600 text-sm mb-4">Contoh elemen dengan tema yang dipilih:</p> <div class="space-y-3"><div class="p-3 rounded bg-primary-100 text-primary-800 border border-primary-200">Contoh elemen dengan warna utama</div> <button class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors">Contoh tombol utama</button> <div class="p-3 rounded bg-accent-100 text-accent-800 border border-accent-200">Contoh elemen dengan warna aksen</div></div></div></div></div>`;
});
export {
  Page as default
};
