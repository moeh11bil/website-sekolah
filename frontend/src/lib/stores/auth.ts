import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const createAuthStore = () => {
  const storedUser = browser ? localStorage.getItem('user') : null;
  const storedToken = browser ? localStorage.getItem('token') : null;

  let parsedUser: User | null = null;
  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.role) parsedUser = null;
    } catch {
      parsedUser = null;
    }
  }

  const initial: AuthState = {
    user: parsedUser,
    token: parsedUser ? storedToken : null,
    isAuthenticated: !!parsedUser && !!storedToken
  };

  const { subscribe, set, update } = writable<AuthState>(initial);

  return {
    subscribe,
    login: (user: User, token: string) => {
      if (browser) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      set({ user: null, token: null, isAuthenticated: false });
    },
    updateUser: (user: User) => {
      if (browser) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      update(state => ({ ...state, user }));
    }
  };
};

export const auth = createAuthStore();
