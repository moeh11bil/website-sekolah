

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.b72de2cc.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/auth.fdd20c69.js","_app/immutable/chunks/index.bbafbdb2.js","_app/immutable/chunks/theme.f6128fb8.js"];
export const stylesheets = [];
export const fonts = [];
