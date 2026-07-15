import { describe, expect, it } from "vitest";
import app from "./app.ts";

describe("API Health Check", () => {
  it("GET /api/health returns status ok", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
  });

  it("GET /api/health returns valid ISO timestamp", async () => {
    const res = await app.request("/api/health");
    const body = await res.json();

    expect(() => new Date(body.timestamp)).not.toThrow();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });
});
