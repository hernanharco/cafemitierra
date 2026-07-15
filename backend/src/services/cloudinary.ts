import cloudinary from "cloudinary";

let configured = false;

/**
 * Configura Cloudinary con las variables de entorno (una sola vez)
 */
function ensureConfig() {
  if (configured) return true;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("⚠️ Cloudinary no configurado. Faltan variables de entorno.");
    console.warn(`   CLOUDINARY_CLOUD_NAME: ${cloudName ? "✓" : "✗"}`);
    console.warn(`   CLOUDINARY_API_KEY: ${apiKey ? "✓" : "✗"}`);
    console.warn(`   CLOUDINARY_API_SECRET: ${apiSecret ? "✓" : "✗"}`);
    return false;
  }

  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
  console.log("✅ Cloudinary configurado correctamente");
  return true;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Sube una imagen a Cloudinary desde un buffer
 */
export async function uploadImage(
  file: Buffer,
  folder: string = "cafemitierra",
): Promise<UploadResult> {
  const ok = ensureConfig();
  if (!ok) {
    throw new Error("Cloudinary no está configurado. Revisá las variables de entorno.");
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout: Cloudinary no respondió en 15 segundos"));
    }, 15000);

    cloudinary.v2.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          clearTimeout(timeout);
          if (error) {
            reject(new Error(`Cloudinary error: ${error.message}`));
          } else {
            resolve({
              url: result!.secure_url,
              publicId: result!.public_id,
              width: result!.width,
              height: result!.height,
            });
          }
        },
      )
      .end(file);
  });
}

/**
 * Elimina una imagen de Cloudinary por su public_id
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!ensureConfig()) return;
  await cloudinary.v2.uploader.destroy(publicId);
}

/**
 * Genera una URL optimizada para un uso específico
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  },
): string {
  if (!ensureConfig()) return "";
  const { width, height, quality = "auto", format = "auto" } = options ?? {};
  const transformations = [`q_${quality}`, `f_${format}`];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  return cloudinary.v2.url(publicId, {
    transformation: transformations,
    secure: true,
  });
}
