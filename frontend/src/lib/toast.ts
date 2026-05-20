import { writable } from 'svelte/store';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

export const toasts = writable<Toast[]>([]);

let nextId = 0;

function add(message: string, type: Toast['type'] = 'info', duration = 5000) {
  const id = ++nextId;
  toasts.update(t => [...t, { id, message, type, duration }]);
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
  return id;
}

function dismiss(id: number) {
  toasts.update(t => t.filter(toast => toast.id !== id));
}

export const toast = {
  success: (msg: string) => add(msg, 'success'),
  error: (msg: string) => add(msg, 'error'),
  warning: (msg: string) => add(msg, 'warning'),
  info: (msg: string) => add(msg, 'info'),
  dismiss
};
