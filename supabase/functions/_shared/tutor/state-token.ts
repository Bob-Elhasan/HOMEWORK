// Signs session state so the app can hold it between turns without being
// able to change it (for example, marking a question solved). This is the
// milestone 1 approach for the test page; the next milestone stores sessions
// in the database instead. Uses Web Crypto, available in Deno and Node.

import type { SessionState } from "./types.ts";

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signState(state: SessionState, secret: string): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(state)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

/** Returns the state, or null if the token was changed or signed with another secret. */
export async function verifyState(token: string, secret: string): Promise<SessionState | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await key(secret), fromB64url(sig), enc.encode(body));
  if (!ok) return null;
  try {
    const state = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    return state?.version === 1 ? (state as SessionState) : null;
  } catch {
    return null;
  }
}
