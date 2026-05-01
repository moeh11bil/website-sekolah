

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.3177018e.js","_app/immutable/chunks/scheduler.65d1733f.js","_app/immutable/chunks/index.3d24a1b0.js","_app/immutable/chunks/auth.e62f7ceb.js","_app/immutable/chunks/index.c1be7129.js","_app/immutable/chunks/theme.ee7c0e41.js"];
export const stylesheets = [];
export const fonts = [];
