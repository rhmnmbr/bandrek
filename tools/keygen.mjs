#!/usr/bin/env node

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeServerUrl(url) {
  try {
    const clean = url.trim().replace(/\/+$/, '');
    if (!clean) return '';

    const m = clean.match(/^(https?):\/\/([^:/]+)(?::(\d+))?$/i);
    const bytes = [];

    if (m) {
      const isHttps = m[1].toLowerCase() === 'https';
      const host = m[2];
      const port = m[3] ? parseInt(m[3], 10) : (isHttps ? 443 : 80);

      let ipParts = null;
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

    if (bytes.length < 14) {
      bytes.push(0xfe);
      let seed = 0x5a;
      for (const b of bytes) seed = (seed * 33 + b) & 0xff;
      while (bytes.length < 14) {
        seed = (seed * 33 + 7) & 0xff;
        bytes.push(seed);
      }
    }

    let chk = 0xa5;
    for (const b of bytes) chk = (chk ^ b) & 0xff;
    bytes.push(chk);

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
    if (bits > 0) chars += CROCKFORD[(val << (5 - bits)) & 0x1f];

    if (chars.length === 24) {
      let sum = 0;
      for (let i = 0; i < chars.length; i++) {
        sum = (sum * 3 + CROCKFORD.indexOf(chars[i])) % 32;
      }
      chars += CROCKFORD[sum];
    }

    return (chars.match(/.{1,5}/g) || []).join('-');
  } catch {
    return '';
  }
}

function decodeServerUrl(code) {
  try {
    const trimmed = code.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

    let clean = trimmed.replace(/[-\s]/g, '').toUpperCase();
    clean = clean.replace(/O/g, '0').replace(/[IL]/g, '1');

    if (clean.length === 25) {
      let sum = 0;
      for (let i = 0; i < 24; i++) {
        sum = (sum * 3 + CROCKFORD.indexOf(clean[i])) % 32;
      }
      if (CROCKFORD.indexOf(clean[24]) === sum) {
        clean = clean.slice(0, 24);
      }
    }

    let bits = 0;
    let val = 0;
    const bytes = [];
    for (const c of clean) {
      const idx = CROCKFORD.indexOf(c);
      if (idx === -1) throw new Error('Invalid Crockford character');
      val = (val << 5) | idx;
      bits += 5;
      while (bits >= 8) {
        bits -= 8;
        bytes.push((val >> bits) & 0xff);
      }
    }

    if (bytes.length >= 2) {
      const chk = bytes.pop();
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
        }
        if ((header & 0x40) !== 0) {
          const isHttps = (header & 0x20) !== 0;
          const len = header & 0x1f;
          const port = (data[1] << 8) | data[2];
          const host = new TextDecoder().decode(new Uint8Array(data.slice(3, 3 + len)));
          return `${isHttps ? 'https' : 'http'}://${host}${port === (isHttps ? 443 : 80) ? '' : ':' + port}`;
        }
        if (header === 0x01 || header === 0x02) {
          const isHttps = header === 0x02;
          const port = (data[1] << 8) | data[2];
          const len = data[3];
          const host = new TextDecoder().decode(new Uint8Array(data.slice(4, 4 + len)));
          return `${isHttps ? 'https' : 'http'}://${host}${port === (isHttps ? 443 : 80) ? '' : ':' + port}`;
        }
        if (header === 0x00) {
          return new TextDecoder().decode(new Uint8Array(data.slice(1)));
        }
      }
    }
    return '';
  } catch {
    return '';
  }
}

const input = process.argv.slice(2).join(' ').trim();
if (!input) {
  console.log('Usage: node tools/keygen.mjs <URL-atau-Serial>');
  console.log('Example encode: node tools/keygen.mjs http://103.187.146.20:5050');
  console.log('Example decode: node tools/keygen.mjs M5ZG0-0012F-TZX24-FERYY-8TX11');
  process.exit(0);
}

if (input.startsWith('http://') || input.startsWith('https://')) {
  console.log('\n✓ SERIAL CODE HASIL ENCODE:');
  console.log('  ' + encodeServerUrl(input));
  console.log('  Target URL : ' + input + '\n');
} else {
  const decoded = decodeServerUrl(input);
  if (decoded) {
    console.log('\n✓ HASIL DECODE SERIAL CODE:');
    console.log('  ' + decoded + '\n');
  } else {
    const candidate = (input.includes(':') || input.includes('.')) ? 'http://' + input : input;
    console.log('\n✓ SERIAL CODE HASIL ENCODE:');
    console.log('  ' + encodeServerUrl(candidate));
    console.log('  Target URL : ' + candidate + '\n');
  }
}
