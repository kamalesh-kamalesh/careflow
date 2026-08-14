/**
 * Minimal client-side password hashing using the browser's native
 * SubtleCrypto (Web Crypto API) — no extra dependency required.
 *
 * IMPORTANT: This is a hackathon/demo-grade improvement over storing
 * passwords in plaintext, NOT a production authentication solution.
 * A real deployment must hash on a trusted server (bcrypt/argon2 + salt)
 * or use a managed auth provider (e.g. Firebase Auth), since anything
 * computed purely in the browser can be inspected or bypassed by the client.
 */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hash: string | undefined): Promise<boolean> {
  if (!hash) return false;
  const computed = await hashPassword(password);
  return computed === hash;
}
