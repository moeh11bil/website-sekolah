

export const index = 27;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/student/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/27.f20bba3e.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js"];
export const stylesheets = [];
export const fonts = [];
