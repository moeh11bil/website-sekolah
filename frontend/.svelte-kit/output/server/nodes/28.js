

export const index = 28;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/teacher/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/28.ccbee0dc.js","_app/immutable/chunks/scheduler.cbb07bcc.js","_app/immutable/chunks/index.a71001cf.js"];
export const stylesheets = [];
export const fonts = [];
