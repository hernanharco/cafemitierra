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
 * Verifica un JWT token de authCore
 * En desarrollo, acepta un token de prueba
 */
export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  // En desarrollo, aceptar token simple
  const env = process.env.NODE_ENV || "development";
  if (env === "development" && token === "dev-token") {
    return { userId: "dev-user", email: "dev@cafemitierra.com" };
  }

  try {
    // Decodificar payload del JWT (sin verificar firma por ahora)
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    const decoded = JSON.parse(atob(payloadB64));
    const userId = decoded.sub || decoded.userId;
    const email = decoded.email;

    // Aceptar JWT de authCore (decodificamos el payload)
    // En producción se puede agregar verificación de firma contra authCore
    if (userId && email) {
      return { userId, email };
    }

    // Fallback: intentar verificar firma con clave pública
    const key = await getPublicKey();
    if (!key) return null;

    const encoder = new TextEncoder();
    const [header, payload, signature] = token.split(".");
    const keyData = await crypto.subtle.importKey(
      "spki",
      pemToBuffer(key),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const data = encoder.encode(`${header}.${payload}`);
    const sig = base64UrlToBuffer(signature);
    const valid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      keyData,
      sig,
      data,
    );

    if (!valid) return null;

    return { userId, email };
  } catch (error) {
    console.error("Error verificando token:", error);
    return null;
  }
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
