

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.9c9a9219.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/stores.17b2a483.js","_app/immutable/chunks/singletons.8abfd548.js","_app/immutable/chunks/index.bbafbdb2.js"];
export const stylesheets = [];
export const fonts = [];
