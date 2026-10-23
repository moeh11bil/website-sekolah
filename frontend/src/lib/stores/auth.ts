import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

/** Baca klaim `exp` (detik sejak epoch) dari payload JWT - hanya membaca,
 *  tanpa verifikasi signature (verifikasi tetap tugas server). */
export function readTokenExpiration(token: string | null): number | null {
  if (!token) return null;
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/** True bila token sudah melewati masa berlakunya (klaim `exp`). */
export function isTokenExpired(token: string | null): boolean {
  const exp = readTokenExpiration(token);
  return exp !== null && exp * 1000 <= Date.now();
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

  // Token sudah kedaluwarsa saat aplikasi dibuka: JANGAN tampilkan status
  // login palsu. Bersihkan penyimpanan dan tandai sesi berakhir agar layout
  // dapat menampilkan pemberitahuan + memaksa login ulang.
  const tokenExpired = !!parsedUser && isTokenExpired(storedToken);
  if (tokenExpired && browser) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.setItem('sessionExpired', '1');
    parsedUser = null;
  }

  const initial: AuthState = {
    user: parsedUser,
    token: !tokenExpired && parsedUser ? storedToken : null,
    isAuthenticated: !tokenExpired && !!parsedUser && !!storedToken
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
