const DEFAULT_SERVER_URL = 'http://localhost:5109';
const SERVER_URL_KEY = 'bandrek:server-url';
const TOKEN_KEY = 'bandrek:auth-token';

export function decodeServerUrl(code: string): string {
  try {
    const trimmed = code.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const decoded = atob(trimmed);
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      return decoded;
    }
    return '';
  } catch {
    return '';
  }
}

export function encodeServerUrl(url: string): string {
  try {
    const trimmed = url.trim();
    if (!trimmed) return '';
    return btoa(trimmed);
  } catch {
    return '';
  }
}

export function getServerUrl(): string {
  const stored = localStorage.getItem(SERVER_URL_KEY);
  if (!stored) return DEFAULT_SERVER_URL;
  const decoded = decodeServerUrl(stored);
  return decoded || stored || DEFAULT_SERVER_URL;
}

export function setServerUrl(url: string): void {
  localStorage.setItem(SERVER_URL_KEY, url);
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly data?: any
  ) {
    super(data?.message || `API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const baseUrl = getServerUrl().replace(/\/+$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${baseUrl}${cleanUrl}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    if (response.status === 401) {
      // Clear invalid token
      setAuthToken(null);
    }

    throw new ApiError(response.status, response.statusText, errorData);
  }

  let data: any = undefined;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
