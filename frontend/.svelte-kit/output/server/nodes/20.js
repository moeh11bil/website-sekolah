

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/admin/users/edit/_id_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/20.5ff2f1b0.js","_app/immutable/chunks/scheduler.65d1733f.js","_app/immutable/chunks/index.3d24a1b0.js","_app/immutable/chunks/navigation.0a0d0c2f.js","_app/immutable/chunks/singletons.e6a963b8.js","_app/immutable/chunks/index.c1be7129.js","_app/immutable/chunks/stores.0c7d23ad.js","_app/immutable/chunks/config.2da1c3e2.js"];
export const stylesheets = [];
export const fonts = [];
