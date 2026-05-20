

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/admin/categories/edit/_id_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.656db9a5.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/navigation.8da43464.js","_app/immutable/chunks/singletons.8abfd548.js","_app/immutable/chunks/index.bbafbdb2.js","_app/immutable/chunks/stores.17b2a483.js","_app/immutable/chunks/config.2da1c3e2.js"];
export const stylesheets = [];
export const fonts = [];
