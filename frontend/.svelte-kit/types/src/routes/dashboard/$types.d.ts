import type * as Kit from '@sveltejs/kit';

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
// @ts-ignore
type MatcherParam<M> = M extends (param : string) => param is infer U ? U extends string ? U : string : string;
type RouteParams = {  };
type RouteId = '/dashboard';
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureDefined<T> = T extends null | undefined ? {} : T;
type OptionalUnion<U extends Record<string, any>, A extends keyof U = U extends U ? keyof U : never> = U extends unknown ? { [P in Exclude<A, keyof U>]?: never } & U : never;
export type Snapshot<T = any> = Kit.Snapshot<T>;
type LayoutRouteId = RouteId | "/dashboard/admin" | "/dashboard/admin/about" | "/dashboard/admin/categories" | "/dashboard/admin/categories/create" | "/dashboard/admin/categories/edit/[id]" | "/dashboard/admin/gallery" | "/dashboard/admin/gallery-pending" | "/dashboard/admin/header" | "/dashboard/admin/quick-links" | "/dashboard/admin/school-info" | "/dashboard/admin/staff-testimonials" | "/dashboard/admin/theme" | "/dashboard/admin/users" | "/dashboard/admin/users/create" | "/dashboard/admin/users/edit/[id]" | "/dashboard/gallery" | "/dashboard/posts/create" | "/dashboard/posts/edit/[id]" | "/dashboard/posts/my-posts" | "/dashboard/posts/pending" | "/dashboard/student" | "/dashboard/teacher"
type LayoutParams = RouteParams & { id?: string }
type LayoutParentData = EnsureDefined<import('../$types.js').LayoutData>;

export type LayoutServerData = null;
export type LayoutData = Expand<LayoutParentData>;