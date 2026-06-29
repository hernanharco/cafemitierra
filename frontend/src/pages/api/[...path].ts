import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Proxy para llamadas API desde el frontend al backend
 * Captura todas las rutas /api/* que no tengan un handler específico
 */
export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname; // /api/menu, /api/site, etc.
  const search = url.search;

  const backendUrl = `https://api-cafemitierra.elrincondeharco.com${path}${search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Backend no disponible' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
