import { beforeEach, describe, expect, it } from "vitest";

// El módulo auth se importa después de configurar los mocks
const { verifyToken, setPublicKey } = await import("./auth.ts");

describe("Auth Service — verifyToken", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  it("acepta dev-token en entorno development", async () => {
    const user = await verifyToken("dev-token");
    expect(user).not.toBeNull();
    expect(user!.userId).toBe("dev-user");
    expect(user!.email).toBe("dev@cafemitierra.com");
  });

  it("NO acepta dev-token en producción", async () => {
    process.env.NODE_ENV = "production";
    const user = await verifyToken("dev-token");
    expect(user).toBeNull();
  });

  it("decodifica un JWT válido con payload estándar", async () => {
    // JWT con payload: { sub: "123", email: "test@test.com" }
    const token =
      "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.signature";
    const user = await verifyToken(token);
    expect(user).not.toBeNull();
    expect(user!.userId).toBe("123");
    expect(user!.email).toBe("test@test.com");
  });

  it("decodifica un JWT con formato userId en lugar de sub", async () => {
    const header = btoa(JSON.stringify({ alg: "RS256" }));
    const payload = btoa(JSON.stringify({ userId: "user-456", email: "user@test.com" }));
    const token = `${header}.${payload}.fake-sig`;

    const user = await verifyToken(token);
    expect(user).not.toBeNull();
    expect(user!.userId).toBe("user-456");
    expect(user!.email).toBe("user@test.com");
  });

  it("retorna null para un token mal formado", async () => {
    const user = await verifyToken("not-a-token");
    expect(user).toBeNull();
  });

  it("retorna null para un token con payload inválido", async () => {
    const token = `${btoa("header")}.invalid-base64!.sig`;
    const user = await verifyToken(token);
    expect(user).toBeNull();
  });
});

describe("Auth Service — setPublicKey", () => {
  it("setPublicKey actualiza la clave pública", () => {
    setPublicKey("test-key");
    // Si setPublicKey funciona, verifyToken podrá usarla
    // (no podemos verificar directamente porque la variable es privada del módulo)
  });
});
