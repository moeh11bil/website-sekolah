

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.fd88c561.js","_app/immutable/chunks/scheduler.65d1733f.js","_app/immutable/chunks/index.3d24a1b0.js","_app/immutable/chunks/navigation.0a0d0c2f.js","_app/immutable/chunks/singletons.e6a963b8.js","_app/immutable/chunks/index.c1be7129.js","_app/immutable/chunks/auth.e62f7ceb.js","_app/immutable/chunks/theme.ee7c0e41.js","_app/immutable/chunks/stores.0c7d23ad.js"];
export const stylesheets = ["_app/immutable/assets/2.83da9ffd.css"];
export const fonts = [];
