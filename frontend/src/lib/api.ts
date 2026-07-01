import { goto } from '$app/navigation';
import { API_URL } from '$lib/config';
import { auth } from '$lib/stores/auth';

export async function apiRequest(
  url: string,
  options: RequestInit = {},
  autoLogout: boolean = true
) {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  
  let token: string | null = null;
  auth.subscribe(state => { token = state.token; })();

  const headers: HeadersInit = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers
  });

  if (response.status === 401 && autoLogout) {
    auth.logout();
    goto('/login');
    return response;
  }

  return response;
}

export async function apiUpload(
  url: string,
  formData: FormData,
  autoLogout: boolean = true
) {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  
  let token: string | null = null;
  auth.subscribe(state => { token = state.token; })();

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: formData
  });

  if (response.status === 401 && autoLogout) {
    auth.logout();
    goto('/login');
    return response;
  }

  return response;
}

export function getAuthHeaders(): Record<string, string> {
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  auth.subscribe(state => {
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
  })();

  return headers;
}
