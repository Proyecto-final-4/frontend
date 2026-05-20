/**
 * RSA-OAEP encryption utilities for the browser client.
 *
 * The server exposes GET /api/auth/public-key returning the RSA-2048 public key in Base64
 * (SPKI format). That key encrypts credentials before they are sent to the BFF so the
 * payload in browser DevTools never contains plaintext secrets.
 *
 * Algorithm: RSA-OAEP with SHA-256 (compatible with Java OAEPWithSHA-256AndMGF1Padding/SHA-256).
 */

let cachedKey: CryptoKey | null = null;

/**
 * Fetches the server's RSA public key and imports it as a CryptoKey.
 * The result is cached in memory for the current page lifecycle.
 */
export async function getServerPublicKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const res = await fetch("/api/auth/public-key", { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("Could not fetch the public key from the server.");

  const { publicKey } = (await res.json()) as { publicKey: string };

  const keyBytes = Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0));

  cachedKey = await window.crypto.subtle.importKey(
    "spki",
    keyBytes,
    { name: "RSA-OAEP", hash: { name: "SHA-256" } },
    false,
    ["encrypt"],
  );

  return cachedKey;
}

/**
 * Clears the cached key. Call when the server restarts (backend decryption error).
 */
export function invalidatePublicKeyCache(): void {
  cachedKey = null;
}

/**
 * Encrypts plaintext with the server's RSA-OAEP public key.
 * @returns Base64 ciphertext ready to send to the BFF.
 */
export async function encryptCredential(plaintext: string): Promise<string> {
  const key = await getServerPublicKey();
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encoded);
  return btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
}
