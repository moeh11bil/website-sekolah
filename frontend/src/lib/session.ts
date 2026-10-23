import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { toast } from '$lib/toast';

export const SESSION_EXPIRED_MESSAGE = 'Sesi Anda telah berakhir. Silakan login kembali.';

const SESSION_EXPIRED_KEY = 'sessionExpired';

/** Tandai di sessionStorage bahwa logout terjadi karena sesi berakhir,
 *  agar halaman login bisa menampilkan banner (tetap ada walau reload). */
export function markSessionExpired(): void {
  if (browser) sessionStorage.setItem(SESSION_EXPIRED_KEY, '1');
}

export function hasSessionExpiredNotice(): boolean {
  return browser && sessionStorage.getItem(SESSION_EXPIRED_KEY) === '1';
}

/** Baca dan HAPUS penanda sesi berakhir (sekali pakai). */
export function consumeSessionExpiredNotice(): boolean {
  if (!hasSessionExpiredNotice()) return false;
  if (browser) sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  return true;
}

/**
 * Logout paksa karena sesi tidak berlaku lagi (token habis / ditolak server).
 * Idempotent: hanya bereaksi bila pengguna masih dianggap login.
 * - Bersihkan sesi (store + localStorage)
 * - Beri tahu via toast
 * - Bila sedang di /dashboard, paksa ke halaman login dengan penanda expired
 */
export function forceLogout(): void {
  if (!browser) return;

  const state = get(auth);
  if (!state.isAuthenticated && !state.token) return; // sudah logout

  markSessionExpired();
  auth.logout();
  toast.warning(SESSION_EXPIRED_MESSAGE, 8000);

  if (window.location.pathname.startsWith('/dashboard')) {
    goto('/login?reason=expired');
  }
}

function getRequestPath(input: RequestInfo | URL): string {
  try {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.href;
    if (input instanceof Request) return input.url;
  } catch {
    /* abaikan */
  }
  return '';
}

/**
 * Penjepit global: setiap response API bernilai 401 (di luar endpoint
 * login/register yang memang401 untuk kredensial salah) memicu logout paksa.
 * Ini menangani kasus token dicabut server / akun dihapus / role berubah,
 * di mana token klien masih terlihat valid.
 */
export function installSessionInterceptor(): void {
  if (!browser || (window as unknown as { __sessionInterceptor?: boolean }).__sessionInterceptor) {
    return;
  }
  (window as unknown as { __sessionInterceptor?: boolean }).__sessionInterceptor = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await originalFetch(input, init);

    if (response.status === 401) {
      try {
        const path = getRequestPath(input);
        const isCredentialEndpoint =
          path.includes('/api/auth/login') || path.includes('/api/auth/register');
        if (path.includes('/api/') && !isCredentialEndpoint) {
          forceLogout();
        }
      } catch {
        /* jangan pernah menggangu response asli */
      }
    }

    return response;
  };
}
