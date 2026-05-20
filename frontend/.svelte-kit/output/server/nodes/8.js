

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/admin/categories/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.ce630379.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/each.1764fa3c.js","_app/immutable/chunks/navigation.8da43464.js","_app/immutable/chunks/singletons.8abfd548.js","_app/immutable/chunks/index.bbafbdb2.js","_app/immutable/chunks/config.2da1c3e2.js"];
export const stylesheets = [];
export const fonts = [];
