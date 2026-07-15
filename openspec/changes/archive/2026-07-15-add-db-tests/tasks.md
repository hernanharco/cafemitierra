# Tasks: Add DB-backed integration tests

## Phase 1: Gallery route tests

- [ ] 1.1 Crear `backend/src/routes/gallery.test.ts` con mock de `getDb()` y Cloudinary
- [ ] 1.2 Test: GET /api/gallery sin datos → array vacío
- [ ] 1.3 Test: GET /api/gallery con datos → array con elementos
- [ ] 1.4 Test: DELETE /api/gallery/:id existente → elimina + Cloudinary cleanup
- [ ] 1.5 Test: DELETE /api/gallery/:id inexistente → 404

## Phase 2: Contact route tests

- [ ] 2.1 Crear `backend/src/routes/contact.test.ts` con mock de `getDb()`
- [ ] 2.2 Test: POST /api/contact con datos válidos → 201
- [ ] 2.3 Test: POST /api/contact con datos inválidos → 400
- [ ] 2.4 Test: GET /api/contact autenticado → lista mensajes
- [ ] 2.5 Test: DELETE /api/contact/:id → elimina mensaje

## Phase 3: Verification

- [ ] 3.1 `pnpm test:backend` pasa (35+ tests)
- [ ] 3.2 `pnpm lint:check` sin errores

## Phase 4: Archive

- [ ] 4.1 Sync specs a specs principales
- [ ] 4.2 Mover cambio a archive/
