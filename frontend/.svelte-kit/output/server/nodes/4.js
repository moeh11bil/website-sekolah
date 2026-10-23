

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/blog/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.e51f5e2c.js","_app/immutable/chunks/scheduler.4b739552.js","_app/immutable/chunks/index.476c8476.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.a77e34e3.js","_app/immutable/chunks/config.17003963.js"];
export const stylesheets = ["_app/immutable/assets/4.48606a86.css"];
export const fonts = [];
