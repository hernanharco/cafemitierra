/**
 * Servicio de autenticación — Integración con authCore
 *
 * authCore maneja el login via Google OAuth y emite JWT firmados con RS256.
 * Este servicio verifica los tokens usando JWKS (JSON Web Key Set).
 *
 * ENDPOINT: /.well-known/jwks.json (estándar JWKS)
 */

// Cache de la clave pública en formato JWK
let jwkKey: JsonWebKey | null = null;

export async function getPublicKeyUrl(): Promise<string> {
  return process.env.AUTHCORE_PUBLIC_KEY_URL || "https://api-authcore.elrincondeharco.com/.well-known/jwks.json";
}

/**
 * Obtiene la clave pública desde authCore en formato JWK.
 * Cachea la clave para evitar requests repetidos.
 */
async function getJwk(): Promise<JsonWebKey | null> {
  if (jwkKey) return jwkKey;

  try {
    const url = await getPublicKeyUrl();
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ authCore respondió ${response.status} — usando dev mode`);
      return null;
    }
    const data = await response.json();

    // Soporta tanto JWKS (array de keys) como single key
    const keys = data.keys || [data];
    if (!keys.length) {
      console.warn("⚠️ authCore no devolvió keys — usando dev mode");
      return null;
    }

    const key = keys[0] as JsonWebKey;
    jwkKey = key;
    console.log("✅ Clave pública obtenida de authCore (kid:", key.kid, ")");
    return key;
  } catch (err) {
    console.warn("⚠️ No se pudo obtener clave pública de authCore — modo sin auth:", (err as Error).message);
    return null;
  }
}

/**
 * Solo para tests: permite inyectar una clave manualmente.
 */
export function setPublicKey(key: string) {
  // No-op: ya no usamos string PEM
}

/**
 * Decodifica (sin verificar) el payload de un JWT.
 */
function decodePayload(token: string): { userId?: string; email?: string } | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const decoded = JSON.parse(atob(payloadB64));
    return {
      userId: decoded.sub || decoded.userId,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

/**
 * Verifica la firma RS256 de un JWT usando la JWK de authCore.
 * Usa crypto.subtle.importKey con formato "jwk" directamente.
 */
async function verifySignature(token: string): Promise<boolean> {
  try {
    const key = await getJwk();
    if (!key) return false;

    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return false;

    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.importKey(
      "jwk",
      key,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const data = encoder.encode(`${header}.${payload}`);
    const sig = base64UrlToBuffer(signature);
    return await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      keyData,
      sig,
      data,
    );
  } catch {
    return false;
  }
}

/**
 * Verifica un JWT token de authCore
 *
 * En PRODUCCIÓN:
 *   - Obtiene la clave pública desde authCore via JWKS
 *   - Verifica la firma RS256
 *   - Si no hay clave disponible, RECHAZA todos los tokens
 *
 * En DESARROLLO:
 *   - Acepta "dev-token" para desarrollo local
 *   - Decodifica JWT sin verificar firma (para testing)
 */
export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  const env = process.env.NODE_ENV || "development";

  // ── MODO DESARROLLO ──────────────────────────────────────────
  if (env === "development") {
    if (token === "dev-token") {
      return { userId: "dev-user", email: "dev@cafemitierra.com" };
    }

    const payload = decodePayload(token);
    if (payload?.userId && payload?.email) {
      return { userId: payload.userId, email: payload.email };
    }
    return null;
  }

  // ── MODO PRODUCCIÓN ──────────────────────────────────────────
  const signatureValid = await verifySignature(token);
  if (!signatureValid) return null;

  const payload = decodePayload(token);
  if (!payload?.userId || !payload?.email) return null;

  return { userId: payload.userId, email: payload.email };
}

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
