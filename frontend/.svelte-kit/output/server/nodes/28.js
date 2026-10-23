

export const index = 28;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/student/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/28.166283dd.js","_app/immutable/chunks/scheduler.4b739552.js","_app/immutable/chunks/index.476c8476.js"];
export const stylesheets = [];
export const fonts = [];
