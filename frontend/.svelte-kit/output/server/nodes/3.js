

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.e90f16c9.js","_app/immutable/chunks/scheduler.4b739552.js","_app/immutable/chunks/index.476c8476.js","_app/immutable/chunks/each.a77e34e3.js","_app/immutable/chunks/config.17003963.js"];
export const stylesheets = ["_app/immutable/assets/3.04e36191.css"];
export const fonts = [];
