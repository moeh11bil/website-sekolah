

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.8387b07f.js","_app/immutable/chunks/scheduler.65d1733f.js","_app/immutable/chunks/index.3d24a1b0.js","_app/immutable/chunks/stores.0c7d23ad.js","_app/immutable/chunks/singletons.e6a963b8.js","_app/immutable/chunks/index.c1be7129.js"];
export const stylesheets = [];
export const fonts = [];
