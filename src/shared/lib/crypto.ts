/**
 * WebCrypto AES-GCM Client-Side Vault for BYOK API Keys
 * Adheres strictly to SECURITY_RULES.md (No remote key logging, local encryption only)
 */

const VAULT_SALT = 'lumora_secure_vault_salt_v1';

async function deriveKey(salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode('lumora_local_client_entropy_secret'),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(plainKey: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return btoa(plainKey); // SSR fallback
  }
  try {
    const key = await deriveKey(VAULT_SALT);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainKey)
    );

    const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.warn('Vault encryption fallback:', err);
    return btoa(plainKey);
  }
}

export async function decryptApiKey(cipherText: string): Promise<string> {
  if (!cipherText) return '';
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    try {
      return atob(cipherText);
    } catch {
      return cipherText;
    }
  }
  try {
    const binary = atob(cipherText);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length <= 12) {
      return atob(cipherText);
    }

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const key = await deriveKey(VAULT_SALT);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    // If decryption fails, try direct base64
    try {
      return atob(cipherText);
    } catch {
      return cipherText;
    }
  }
}
