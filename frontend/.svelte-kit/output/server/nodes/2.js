

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.5aeb94a2.js","_app/immutable/chunks/scheduler.4b739552.js","_app/immutable/chunks/index.476c8476.js","_app/immutable/chunks/navigation.7fbeb62e.js","_app/immutable/chunks/singletons.b54e0881.js","_app/immutable/chunks/index.154b07ad.js","_app/immutable/chunks/paths.0ca1db77.js","_app/immutable/chunks/auth.3e4b7cda.js","_app/immutable/chunks/theme.f119a0d8.js","_app/immutable/chunks/config.17003963.js","_app/immutable/chunks/session.026e952d.js","_app/immutable/chunks/toast.485d4e17.js","_app/immutable/chunks/stores.915d5ed7.js"];
export const stylesheets = ["_app/immutable/assets/2.83da9ffd.css"];
export const fonts = [];
