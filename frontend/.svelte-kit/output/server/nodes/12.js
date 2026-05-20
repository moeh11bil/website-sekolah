

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/admin/gallery-pending/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.24c7cf75.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/each.1764fa3c.js","_app/immutable/chunks/config.2da1c3e2.js"];
export const stylesheets = [];
export const fonts = [];
