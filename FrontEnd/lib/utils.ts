import { JwtPayload } from "@/models/types/auth";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Robust base64url -> UTF-8 decoder
function base64UrlDecodeToString(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' to make length a multiple of 4
  const pad = base64.length % 4;
  const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
  // atob returns a binary string; convert to Uint8Array then to UTF-8 string
  const binary = atob(padded);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  // TextDecoder for proper UTF-8 decoding
  const td = new TextDecoder();
  return td.decode(bytes);
}

export function decodeJwt(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = base64UrlDecodeToString(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch (e) {
    return null;
  }
}

export function normalizeJwt(payload: any): JwtPayload | null {
  if (!payload) return null;
  const pick = (keys: string[]) => {
    for (const k of keys) {
      if (payload[k] !== undefined && payload[k] !== null) return payload[k];
    }
    return undefined;
  };

  return {
    raw: payload,
    sub: payload.sub,
    name: pick([
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      'name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    ]) || undefined,
    email: pick(['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', 'email']) || undefined,
    role: pick([
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      'role',
    ]) || undefined,
    image_url: payload.image_url || payload.imageUrl || payload.picture || undefined,
    exp: payload.exp || undefined,
  };
}