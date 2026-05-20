

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.9ccf8365.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/navigation.8da43464.js","_app/immutable/chunks/singletons.8abfd548.js","_app/immutable/chunks/index.bbafbdb2.js","_app/immutable/chunks/auth.fdd20c69.js","_app/immutable/chunks/theme.f6128fb8.js","_app/immutable/chunks/stores.17b2a483.js","_app/immutable/chunks/each.1764fa3c.js","_app/immutable/chunks/toast.5fd52860.js"];
export const stylesheets = ["_app/immutable/assets/2.4395e211.css"];
export const fonts = [];
