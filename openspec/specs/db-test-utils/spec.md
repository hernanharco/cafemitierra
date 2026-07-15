# db-test-utils Specification

## Purpose

Define cómo mockear la capa de base de datos (Drizzle ORM + PostgreSQL) para testear rutas que dependen de `getDb()` sin necesidad de una base de datos real.

## Requirements

### Requirement: Gallery — GET /api/gallery (protegido)

The system MUST return the list of gallery images from the database.

**Auth**: Requiere token válido (Bearer `dev-token` en desarrollo).

#### Scenario: Lista vacía

- GIVEN no hay imágenes en la base de datos
- WHEN el cliente autenticado hace GET /api/gallery
- THEN la respuesta es 200
- AND el body es un array vacío

#### Scenario: Lista con imágenes

- GIVEN hay 2 imágenes en la base de datos
- WHEN el cliente autenticado hace GET /api/gallery
- THEN la respuesta es 200
- AND el body tiene 2 elementos
- AND cada elemento tiene `id`, `title`, `imageUrl`

### Requirement: Gallery — DELETE /api/gallery/:id (protegido)

The system MUST delete a gallery image by ID. The system MUST also delete the associated Cloudinary image if `imagePublicId` exists.

**Auth**: Requiere token válido.

#### Scenario: Eliminar imagen existente

- GIVEN existe una imagen con ID 1 en la base de datos
- AND la imagen tiene `imagePublicId: "test-id"`
- WHEN el cliente autenticado hace DELETE /api/gallery/1
- THEN la respuesta es 200
- AND `deleteImage` de Cloudinary es llamado con "test-id"
- AND el registro es eliminado de la base de datos

#### Scenario: Eliminar imagen inexistente

- GIVEN no existe una imagen con ID 999
- WHEN el cliente autenticado hace DELETE /api/gallery/999
- THEN la respuesta es 404
- AND `deleteImage` de Cloudinary NO es llamado

### Requirement: Contact — POST /api/contact (público)

The system MUST create a new contact message.

#### Scenario: Crear mensaje exitosamente

- GIVEN datos válidos: `{ name: "Juan", email: "juan@test.com", message: "Hola" }`
- WHEN un cliente hace POST /api/contact con esos datos
- THEN la respuesta es 201
- AND el body contiene los datos del mensaje creado

#### Scenario: Rechazar datos inválidos

- GIVEN datos inválidos: `{ name: "", email: "invalido", message: "" }`
- WHEN un cliente hace POST /api/contact con esos datos
- THEN la respuesta es 400

### Requirement: Contact — GET /api/contact (admin, protegido)

The system MUST return all contact messages ordered by creation date.

**Auth**: Requiere token válido.

#### Scenario: Listar mensajes

- GIVEN hay 2 mensajes en la base de datos
- WHEN el cliente autenticado hace GET /api/contact
- THEN la respuesta es 200
- AND el body tiene 2 elementos en orden cronológico

### Requirement: Delete — DELETE /api/contact/:id (admin, protegido)

The system MUST delete a contact message by ID.

**Auth**: Requiere token válido.

#### Scenario: Eliminar mensaje

- GIVEN existe un mensaje con ID 1
- WHEN el cliente autenticado hace DELETE /api/contact/1
- THEN la respuesta es 200
- AND `db.delete` es llamado con ID 1
