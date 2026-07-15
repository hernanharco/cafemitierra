import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Endpoint de callback para autenticación con authCore (Google OAuth)
 *
 * authCore redirige aquí después del login exitoso:
 *   GET /auth/callback?token={jwt_token}    ← query param
 *   GET /auth/callback/{jwt_token}          ← path param (alternativo)
 *
 * Guarda el token en una cookie y redirige al admin dashboard.
 */
export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  // Intentar obtener token de query param primero, luego de path
  const token = url.searchParams.get("token") || url.pathname.split("/").pop();

  if (!token || token === "callback") {
    return new Response(JSON.stringify({ error: "Token no proporcionado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Guardar token en cookie (7 días)
  cookies.set("token", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    httpOnly: false, // Accesible desde JS para el dashboard
    sameSite: "lax",
    secure: true, // HTTPS en producción
  });

  return redirect("/admin");
};
