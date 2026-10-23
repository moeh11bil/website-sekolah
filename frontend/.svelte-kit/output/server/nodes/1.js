

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.2268fd9c.js","_app/immutable/chunks/scheduler.4b739552.js","_app/immutable/chunks/index.476c8476.js","_app/immutable/chunks/paths.0ca1db77.js"];
export const stylesheets = [];
export const fonts = [];
