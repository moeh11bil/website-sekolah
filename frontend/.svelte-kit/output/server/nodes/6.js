

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.7970ce89.js","_app/immutable/chunks/scheduler.4b739552.js","_app/immutable/chunks/index.476c8476.js","_app/immutable/chunks/auth.3e4b7cda.js","_app/immutable/chunks/index.154b07ad.js","_app/immutable/chunks/theme.f119a0d8.js","_app/immutable/chunks/config.17003963.js"];
export const stylesheets = [];
export const fonts = [];
