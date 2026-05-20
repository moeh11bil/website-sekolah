

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/blog/_id_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.f4a801f1.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js","_app/immutable/chunks/stores.17b2a483.js","_app/immutable/chunks/singletons.8abfd548.js","_app/immutable/chunks/index.bbafbdb2.js","_app/immutable/chunks/config.2da1c3e2.js"];
export const stylesheets = ["_app/immutable/assets/5.c9116f6d.css"];
export const fonts = [];
