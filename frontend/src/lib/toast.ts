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
  success: (msg: string, duration?: number) => add(msg, 'success', duration),
  error: (msg: string, duration?: number) => add(msg, 'error', duration),
  warning: (msg: string, duration?: number) => add(msg, 'warning', duration),
  info: (msg: string, duration?: number) => add(msg, 'info', duration),
  dismiss
};
