

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.88c9ae6d.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/index.bbafbdb2.js","_app/immutable/chunks/navigation.8da43464.js","_app/immutable/chunks/singletons.8abfd548.js","_app/immutable/chunks/stores.17b2a483.js","_app/immutable/chunks/config.2da1c3e2.js","_app/immutable/chunks/theme.391062f3.js"];
export const stylesheets = ["_app/immutable/assets/0.86a7a93c.css"];
export const fonts = [];
