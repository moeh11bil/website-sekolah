

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.bf43fb6a.js","_app/immutable/chunks/scheduler.65d1733f.js","_app/immutable/chunks/index.3d24a1b0.js","_app/immutable/chunks/each.a937854e.js","_app/immutable/chunks/config.2da1c3e2.js"];
export const stylesheets = ["_app/immutable/assets/3.04e36191.css"];
export const fonts = [];
