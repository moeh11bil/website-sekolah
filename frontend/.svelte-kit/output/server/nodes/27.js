

export const index = 27;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/teacher/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/27.42506f88.js","_app/immutable/chunks/scheduler.65d1733f.js","_app/immutable/chunks/index.3d24a1b0.js"];
export const stylesheets = [];
export const fonts = [];
