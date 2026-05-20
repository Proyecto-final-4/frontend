/**
 * Utilidades de cifrado RSA-OAEP para el cliente.
 *
 * El servidor expone GET /api/auth/public-key que retorna la clave pública RSA-2048 en Base64
 * (formato SPKI). Esta clave se usa para cifrar las credenciales antes de enviarlas al BFF,
 * de modo que el payload en las DevTools del navegador nunca contenga datos en texto plano.
 *
 * Algoritmo: RSA-OAEP con SHA-256 (compatible con Java OAEPWithSHA-256AndMGF1Padding/SHA-256).
 */

let cachedKey: CryptoKey | null = null;

/**
 * Obtiene la clave pública RSA del servidor y la importa como CryptoKey.
 * El resultado se cachea en memoria para reutilizarse en el mismo ciclo de vida de la página.
 */
export async function getServerPublicKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const res = await fetch("/api/auth/public-key", { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo obtener la clave pública del servidor.");

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
 * Invalida la clave cacheada. Llamar si el servidor reinicia (error de descifrado en el backend).
 */
export function invalidatePublicKeyCache(): void {
  cachedKey = null;
}

/**
 * Cifra un texto plano con la clave pública RSA-OAEP del servidor.
 * @returns Base64 del ciphertext listo para enviar al BFF.
 */
export async function encryptCredential(plaintext: string): Promise<string> {
  const key = await getServerPublicKey();
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encoded);
  return btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
}
