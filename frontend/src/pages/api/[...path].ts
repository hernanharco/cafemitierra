import type { APIRoute } from "astro";

export const prerender = false;

const BACKEND_BASE = "https://api-cafemitierra.elrincondeharco.com";

/**
 * Proxy API requests al backend.
 *
 * IMPORTANTE: Usamos `request.arrayBuffer()` en vez de `request.text()`
 * para NO corromper bodies multipart/form-data (upload de imágenes).
 * `request.text()` decodifica a UTF-8 y destruye el boundary de FormData.
 */
async function proxy(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_BASE}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();

    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Backend no disponible" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET: APIRoute = async ({ request }) => proxy(request);
export const POST: APIRoute = async ({ request }) => proxy(request);
export const PUT: APIRoute = async ({ request }) => proxy(request);
export const DELETE: APIRoute = async ({ request }) => proxy(request);
export const PATCH: APIRoute = async ({ request }) => proxy(request);
