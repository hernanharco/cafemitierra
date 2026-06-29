import type { APIRoute } from 'astro';

export const prerender = false;

const BACKEND_BASE = 'https://api-cafemitierra.elrincondeharco.com';

async function proxy(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_BASE}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Backend no disponible' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const GET: APIRoute = async ({ request }) => proxy(request);
export const POST: APIRoute = async ({ request }) => proxy(request);
export const PUT: APIRoute = async ({ request }) => proxy(request);
export const DELETE: APIRoute = async ({ request }) => proxy(request);
export const PATCH: APIRoute = async ({ request }) => proxy(request);
