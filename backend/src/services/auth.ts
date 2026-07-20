/**
 * Servicio de autenticación — Integración con authCore
 *
 * authCore maneja el login via Google OAuth y emite JWT firmados con RS256.
 * Este servicio verifica los tokens usando la clave pública de authCore.
 */

// En desarrollo, podemos usar un secreto compartido
// En producción, se obtiene la clave pública de authCore
let publicKey = "";

export async function getPublicKey(): Promise<string> {
  if (publicKey) return publicKey;

  try {
    const response = await fetch(process.env.AUTHCORE_PUBLIC_KEY_URL!);
    const data = await response.json();
    publicKey = data.public_key;
    return publicKey;
  } catch {
    // Fallback: modo desarrollo sin auth
    console.warn("⚠️ No se pudo obtener clave pública de authCore — modo sin auth");
    return "";
  }
}

export function setPublicKey(key: string) {
  publicKey = key;
}

/**
 * Decodifica (sin verificar) el payload de un JWT.
 * Solo debe usarse en development o después de verificar firma.
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
 * Verifica la firma RS256 de un JWT contra la clave pública de authCore.
 */
async function verifySignature(token: string): Promise<boolean> {
  try {
    const key = await getPublicKey();
    if (!key) return false;

    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return false;

    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.importKey(
      "spki",
      pemToBuffer(key),
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
 *   - Solo acepta tokens con firma RS256 válida contra authCore
 *   - Si no hay clave pública disponible, RECHAZA todos los tokens
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
    // Aceptar dev-token para desarrollo local
    if (token === "dev-token") {
      return { userId: "dev-user", email: "dev@cafemitierra.com" };
    }

    // Decodificar payload sin verificar firma (conveniente para testing)
    const payload = decodePayload(token);
    if (payload?.userId && payload?.email) {
      return { userId: payload.userId, email: payload.email };
    }
    return null;
  }

  // ── MODO PRODUCCIÓN ──────────────────────────────────────────
  const signatureValid = await verifySignature(token);
  if (!signatureValid) return null;

  // Decodificar payload (solo después de firma válida)
  const payload = decodePayload(token);
  if (!payload?.userId || !payload?.email) return null;

  return { userId: payload.userId, email: payload.email };
}

function pemToBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\n/g, "")
    .replace(/\r/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
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
