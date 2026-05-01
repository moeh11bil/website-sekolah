import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface ThemeState {
  theme: string;
  isLoading: boolean;
}

const createThemeStore = () => {
  const storedTheme = browser ? localStorage.getItem('theme') : null;

  const initial: ThemeState = {
    theme: storedTheme || 'emerald',
    isLoading: false
  };

  const { subscribe, set, update } = writable<ThemeState>(initial);

  return {
    subscribe,
    setTheme: async (theme: string) => {
      update(state => ({ ...state, isLoading: true }));
      if (browser) {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
      set({ theme, isLoading: false });
    },
    loadFromServer: async () => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const res = await fetch('/api/admin/public/theme');
        if (res.ok) {
          const data = await res.json();
          if (browser) {
            localStorage.setItem('theme', data.theme);
            document.documentElement.setAttribute('data-theme', data.theme);
          }
          set({ theme: data.theme, isLoading: false });
        }
      } catch {
        update(state => ({ ...state, isLoading: false }));
      }
    },
    init: () => {
      if (browser) {
        const saved = localStorage.getItem('theme');
        if (saved) {
          document.documentElement.setAttribute('data-theme', saved);
          set({ theme: saved, isLoading: false });
        }
      }
    }
  };
};

export const theme = createThemeStore();
