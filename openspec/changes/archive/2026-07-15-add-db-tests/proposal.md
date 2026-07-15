# Proposal: Add DB-backed integration tests for gallery and contact routes

## Intent

Gallery y contact routes dependen de PostgreSQL vía Drizzle ORM. Actualmente no tienen tests. Necesitamos mockear la capa de base de datos para poder testear estas rutas sin una base de datos real, manteniendo el mismo enfoque TDD que usamos con site y reviews.

## Scope

### In Scope
- Mock de `getDb()` para retornar un fake Drizzle client
- Tests para `GET /api/gallery` y `DELETE /api/gallery/:id`
- Tests para `POST /api/contact`, `GET /api/contact`, `DELETE /api/contact/:id`
- Mock de Cloudinary para gallery (upload/delete)

### Out of Scope
- Tests de `POST /api/gallery/upload` (requiere multipart/form-data real)
- Tests de `PUT /api/gallery/:id` (bajo prioridad)
- Base de datos en memoria real (el mock es suficiente)

## Capabilities

### New Capabilities
- `db-test-utils`: Helper functions para mockear Drizzle queries

### Modified Capabilities
- None

## Approach

Usar `vi.mock("../db/index.ts")` para reemplazar `getDb()` con una función que retorna un objeto mockeado. Cada test define qué datos retorna `db.select()`, `db.insert()`, etc.

Para Cloudinary, reutilizar el mock existente de `cloudinary` del test de servicios.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/routes/gallery.test.ts` | New | Tests para gallery routes |
| `backend/src/routes/contact.test.ts` | New | Tests para contact routes |
| `backend/src/services/cloudinary.test.ts` | Modified | Ya existe, reutilizamos patrón |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Drizzle query builder cambia entre versiones | Low | Mock de alto nivel (select/insert), no del SQL generado |
| Cloudinary mock setup frágil | Low | Ya testeado en services/cloudinary.test.ts |

## Rollback Plan

Eliminar `gallery.test.ts` y `contact.test.ts` si algo falla. No hay cambios en código de producción.

## Dependencies

- Ninguna. Vitest ya está instalado.

## Success Criteria

- [ ] `pnpm test:backend` pasa con 6+ tests nuevos (mínimo 35 total)
- [ ] Gallery tests cubren GET (lista vacía, con datos) y DELETE (existente, no existente)
- [ ] Contact tests cubren POST (crear mensaje), GET (listar admin), DELETE (eliminar)
- [ ] No se modificó código de producción
