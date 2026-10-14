const DEFAULT_SERVER_URL = 'http://localhost:5109';
const SERVER_URL_KEY = 'bandrek:server-url';
const TOKEN_KEY = 'bandrek:auth-token';

export function getServerUrl(): string {
  return localStorage.getItem(SERVER_URL_KEY) || DEFAULT_SERVER_URL;
}

export function setServerUrl(url: string): void {
  localStorage.setItem(SERVER_URL_KEY, url);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
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
