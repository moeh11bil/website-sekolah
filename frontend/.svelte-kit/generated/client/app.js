export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/blog": [4],
		"/blog/[id]": [5],
		"/dashboard/admin": [6,[2]],
		"/dashboard/admin/about": [7,[2]],
		"/dashboard/admin/categories": [8,[2]],
		"/dashboard/admin/categories/create": [9,[2]],
		"/dashboard/admin/categories/edit/[id]": [10,[2]],
		"/dashboard/admin/gallery-pending": [12,[2]],
		"/dashboard/admin/gallery": [11,[2]],
		"/dashboard/admin/header": [13,[2]],
		"/dashboard/admin/quick-links": [14,[2]],
		"/dashboard/admin/school-info": [15,[2]],
		"/dashboard/admin/staff-testimonials": [16,[2]],
		"/dashboard/admin/theme": [17,[2]],
		"/dashboard/admin/users": [18,[2]],
		"/dashboard/admin/users/create": [19,[2]],
		"/dashboard/admin/users/edit/[id]": [20,[2]],
		"/dashboard/gallery": [21,[2]],
		"/dashboard/posts/create": [22,[2]],
		"/dashboard/posts/edit/[id]": [23,[2]],
		"/dashboard/posts/my-posts": [24,[2]],
		"/dashboard/posts/pending": [25,[2]],
		"/dashboard/student": [26,[2]],
		"/dashboard/teacher": [27,[2]],
		"/galeri": [28],
		"/login": [29],
		"/tentang-kami": [30]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';