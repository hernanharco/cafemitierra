import { defineMiddleware } from "astro:middleware";

// Rutas públicas dentro de /admin que no requieren auth
const publicAdminRoutes = ["/admin/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  // Solo interceptar rutas /admin
  if (pathname.startsWith("/admin")) {
    // Rutas públicas dentro de /admin
    if (publicAdminRoutes.includes(pathname)) {
      return next();
    }

    // Verificar token en cookie
    const token = cookies.get("token")?.value;

    if (!token) {
      return redirect("/admin/login");
    }
  }

  // Para todo lo demás (incluyendo la landing page), seguir normalmente
  return next();
});
