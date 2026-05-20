import { c as create_ssr_component, o as onDestroy } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentStep;
  let updateLogs = [];
  const steps = [
    {
      key: "start",
      label: "Memulai proses update",
      weight: 5
    },
    {
      key: "git_pull",
      label: "Git pull dari repository",
      weight: 15
    },
    {
      key: "backend_deps",
      label: "Install backend dependencies",
      weight: 25
    },
    {
      key: "frontend_deps",
      label: "Install frontend dependencies",
      weight: 20
    },
    {
      key: "build",
      label: "Build frontend",
      weight: 25
    },
    {
      key: "restart",
      label: "Restart server",
      weight: 10
    }
  ];
  function getCurrentStep() {
    if (updateLogs.length === 0)
      return "";
    for (let i = updateLogs.length - 1; i >= 0; i--) {
      const log = updateLogs[i].toLowerCase();
      if (log.includes("server berhasil direstart"))
        return "restart";
      if (log.includes("update selesai"))
        return "restart";
      if (log.includes("build frontend"))
        return "build";
      if (log.includes("install frontend"))
        return "frontend_deps";
      if (log.includes("install backend"))
        return "backend_deps";
      if (log.includes("git pull"))
        return "git_pull";
      if (log.includes("memulai proses update"))
        return "start";
    }
    return "start";
  }
  function getProgress() {
    let pct = 0;
    for (const s of steps) {
      if (currentStep === s.key) {
        pct += s.weight * 0.3;
        break;
      }
      pct += s.weight;
      const idx = steps.findIndex((st) => st.key === currentStep);
      if (steps.indexOf(s) < idx)
        continue;
    }
    return Math.min(Math.round(pct), 99);
  }
  onDestroy(() => {
  });
  currentStep = getCurrentStep();
  getProgress();
  currentStep ? steps.find((s) => s.key === currentStep)?.label || "" : "";
  return `${$$result.head += `<!-- HEAD_svelte-1ije9sj_START -->${$$result.title = `<title>Update Aplikasi - Dashboard</title>`, ""}<!-- HEAD_svelte-1ije9sj_END -->`, ""} <div><div class="flex items-center mb-6" data-svelte-h="svelte-dt5m28"><div class="bg-primary-100 p-3 rounded-xl mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></div> <div><h1 class="text-2xl font-bold text-primary-800">Update Aplikasi</h1> <p class="text-primary-600 text-sm">Periksa dan terapkan pembaruan aplikasi dari repository</p></div></div> ${`<div class="bg-white rounded-xl p-12 text-center border border-primary-100 shadow-md" data-svelte-h="svelte-1i44j3i"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div> <p class="text-gray-500">Memuat informasi...</p></div>`}</div>  ${``}`;
});
export {
  Page as default
};
