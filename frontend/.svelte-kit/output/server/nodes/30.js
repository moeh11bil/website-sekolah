

export const index = 30;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/tentang-kami/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/30.a939a85f.js","_app/immutable/chunks/scheduler.65d1733f.js","_app/immutable/chunks/index.3d24a1b0.js","_app/immutable/chunks/config.2da1c3e2.js"];
export const stylesheets = [];
export const fonts = [];
