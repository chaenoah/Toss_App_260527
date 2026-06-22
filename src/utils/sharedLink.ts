import type { MoodEntry } from '../types';

// URL-safe Base64 encode/decode for UTF-8 JSON payloads.
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromUrlSafe(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return s.replace(/-/g, '+').replace(/_/g, '/') + pad;
}

export function encodeEntry(entry: MoodEntry): string {
  const json = JSON.stringify(entry);
  // Encode as UTF-8 → binary string → base64
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return toUrlSafe(btoa(bin));
}

export function decodeEntry(encoded: string): MoodEntry | null {
  try {
    const bin = atob(fromUrlSafe(encoded));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as MoodEntry;
  } catch {
    return null;
  }
}

/** Build a deep link URL for sharing a prescription. */
export function buildShareUrl(entry: MoodEntry): string {
  const encoded = encodeEntry(entry);
  // HashRouter format: <origin><path>#/shared/<data>
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/shared/${encoded}`;
}
