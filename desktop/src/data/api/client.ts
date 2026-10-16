const DEFAULT_SERVER_URL = 'http://localhost:5109';
const SERVER_URL_KEY = 'bandrek:server-url';
const TOKEN_KEY = 'bandrek:auth-token';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function encodeServerUrl(url: string): string {
  try {
    const clean = url.trim().replace(/\/+$/, '');
    if (!clean) return '';

    const m = clean.match(/^(https?):\/\/([^:/]+)(?::(\d+))?$/i);
    const bytes: number[] = [];

    if (m) {
      const isHttps = m[1].toLowerCase() === 'https';
      const host = m[2];
      const port = m[3] ? parseInt(m[3], 10) : (isHttps ? 443 : 80);

      let ipParts: number[] | null = null;
      const isLocalhost = host.toLowerCase() === 'localhost';
      if (isLocalhost) {
        ipParts = [127, 0, 0, 1];
      } else {
        const parts = host.split('.').map(Number);
        if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
          ipParts = parts;
        }
      }

      if (ipParts) {
        bytes.push(0x80 | (isHttps ? 0x40 : 0) | (isLocalhost ? 0x20 : 0) | 1);
        bytes.push(...ipParts);
        bytes.push((port >> 8) & 0xff, port & 0xff);
      } else {
        const hostBuf = Array.from(new TextEncoder().encode(host));
        if (hostBuf.length <= 10) {
          bytes.push(0x40 | (isHttps ? 0x20 : 0) | (hostBuf.length & 0x1f));
          bytes.push((port >> 8) & 0xff, port & 0xff);
          bytes.push(...hostBuf);
        } else {
          bytes.push(isHttps ? 0x02 : 0x01);
          bytes.push((port >> 8) & 0xff, port & 0xff);
          bytes.push(hostBuf.length);
          bytes.push(...hostBuf);
        }
      }
    } else {
      bytes.push(0x00);
      bytes.push(...Array.from(new TextEncoder().encode(clean)));
    }

    // Pad to 14 data bytes if shorter so total with checksum is 15 bytes = exactly 24 chars
    if (bytes.length < 14) {
      bytes.push(0xfe);
      let seed = 0x5a;
      for (const b of bytes) seed = (seed * 33 + b) & 0xff;
      while (bytes.length < 14) {
        seed = (seed * 33 + 7) & 0xff;
        bytes.push(seed);
      }
    }

    // Checksum XOR
    let chk = 0xa5;
    for (const b of bytes) chk = (chk ^ b) & 0xff;
    bytes.push(chk);

    // Encode to Crockford Base32
    let bits = 0;
    let val = 0;
    let chars = '';
    for (const b of bytes) {
      val = (val << 8) | b;
      bits += 8;
      while (bits >= 5) {
        bits -= 5;
        chars += CROCKFORD[(val >> bits) & 0x1f];
      }
    }
    if (bits > 0) {
      chars += CROCKFORD[(val << (5 - bits)) & 0x1f];
    }

    // If 24 chars, append parity/check char to make exactly 25 chars (5 groups of 5)
    if (chars.length === 24) {
      let sum = 0;
      for (let i = 0; i < chars.length; i++) {
        sum = (sum * 3 + CROCKFORD.indexOf(chars[i])) % 32;
      }
      chars += CROCKFORD[sum];
    }

    const chunks = chars.match(/.{1,5}/g) || [];
    return chunks.join('-');
  } catch {
    return '';
  }
}

export function decodeServerUrl(code: string): string {
  try {
    const trimmed = code.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Clean hyphens, spaces, uppercase
    let clean = trimmed.replace(/[-\s]/g, '').toUpperCase();
    clean = clean.replace(/O/g, '0').replace(/[IL]/g, '1');

    // If 25 chars and last char matches parity, strip it
    if (clean.length === 25) {
      let sum = 0;
      for (let i = 0; i < 24; i++) {
        sum = (sum * 3 + CROCKFORD.indexOf(clean[i])) % 32;
      }
      if (CROCKFORD.indexOf(clean[24]) === sum) {
        clean = clean.slice(0, 24);
      }
    }

    try {
      let bits = 0;
      let val = 0;
      const bytes: number[] = [];
      for (const c of clean) {
        const idx = CROCKFORD.indexOf(c);
        if (idx === -1) throw new Error('Invalid character');
        val = (val << 5) | idx;
        bits += 5;
        while (bits >= 8) {
          bits -= 8;
          bytes.push((val >> bits) & 0xff);
        }
      }

      if (bytes.length >= 2) {
        const chk = bytes.pop()!;
        let expectedChk = 0xa5;
        for (const b of bytes) expectedChk = (expectedChk ^ b) & 0xff;

        if (chk === expectedChk) {
          const feIdx = bytes.indexOf(0xfe);
          const data = feIdx !== -1 ? bytes.slice(0, feIdx) : bytes;

          const header = data[0];
          if ((header & 0x80) !== 0) {
            const isHttps = (header & 0x40) !== 0;
            const isLocalhost = (header & 0x20) !== 0;
            const ip = data.slice(1, 5).join('.');
            const port = (data[5] << 8) | data[6];
            const host = isLocalhost ? 'localhost' : ip;
            return `${isHttps ? 'https' : 'http'}://${host}${port === (isHttps ? 443 : 80) ? '' : ':' + port}`;
          } else if ((header & 0x40) !== 0) {
            const isHttps = (header & 0x20) !== 0;
            const len = header & 0x1f;
            const port = (data[1] << 8) | data[2];
            const host = new TextDecoder().decode(new Uint8Array(data.slice(3, 3 + len)));
            return `${isHttps ? 'https' : 'http'}://${host}${port === (isHttps ? 443 : 80) ? '' : ':' + port}`;
          } else if (header === 0x01 || header === 0x02) {
            const isHttps = header === 0x02;
            const port = (data[1] << 8) | data[2];
            const len = data[3];
            const host = new TextDecoder().decode(new Uint8Array(data.slice(4, 4 + len)));
            return `${isHttps ? 'https' : 'http'}://${host}${port === (isHttps ? 443 : 80) ? '' : ':' + port}`;
          } else if (header === 0x00) {
            return new TextDecoder().decode(new Uint8Array(data.slice(1)));
          }
        }
      }
    } catch {
      // Ignore serial decoding error, try base64 fallback
    }

    // Fallback to legacy base64
    const decoded = atob(trimmed);
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      return decoded;
    }
    return '';
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
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = text;
      }
    } catch {
      errorData = response.statusText;
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
