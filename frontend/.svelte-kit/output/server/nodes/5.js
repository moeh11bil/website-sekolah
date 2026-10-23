

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/blog/_id_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.2123ad32.js","_app/immutable/chunks/scheduler.4b739552.js","_app/immutable/chunks/index.476c8476.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/stores.915d5ed7.js","_app/immutable/chunks/singletons.b54e0881.js","_app/immutable/chunks/index.154b07ad.js","_app/immutable/chunks/paths.0ca1db77.js","_app/immutable/chunks/config.17003963.js"];
export const stylesheets = ["_app/immutable/assets/5.c9116f6d.css"];
export const fonts = [];
