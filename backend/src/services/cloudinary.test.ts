import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock del SDK de Cloudinary ─────────────────────────────
vi.mock("cloudinary", () => ({
  default: {
    v2: {
      config: vi.fn(),
      uploader: {
        upload_stream: vi.fn(),
        destroy: vi.fn(),
      },
      url: vi.fn(),
    },
  },
}));

describe("Cloudinary Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
  });

  describe("uploadImage", () => {
    it("sube una imagen y devuelve url y publicId", async () => {
      const cloudinary = await import("cloudinary");
      const mockStream = cloudinary.default.v2.uploader.upload_stream as ReturnType<typeof vi.fn>;

      // Simular el callback de upload_stream
      mockStream.mockImplementation((_opts: unknown, callback: (...args: unknown[]) => void) => {
        callback(null, {
          secure_url: "https://res.cloudinary.com/test/image.jpg",
          public_id: "cafemitierra/test-id",
          width: 800,
          height: 600,
        });
        return { end: vi.fn() };
      });

      const { uploadImage } = await import("./cloudinary.ts");
      const result = await uploadImage(Buffer.from("fake-image-data"));

      expect(result.url).toBe("https://res.cloudinary.com/test/image.jpg");
      expect(result.publicId).toBe("cafemitierra/test-id");
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it("lanza error si Cloudinary no responde", async () => {
      const cloudinary = await import("cloudinary");
      const mockStream = cloudinary.default.v2.uploader.upload_stream as ReturnType<typeof vi.fn>;

      mockStream.mockImplementation((_opts: unknown, callback: (...args: unknown[]) => void) => {
        callback(new Error("Connection timeout"), null);
        return { end: vi.fn() };
      });

      const { uploadImage } = await import("./cloudinary.ts");
      await expect(uploadImage(Buffer.from("data"))).rejects.toThrow("Cloudinary error");
    });
  });

  describe("deleteImage", () => {
    it("elimina una imagen por publicId", async () => {
      const cloudinary = await import("cloudinary");
      const destroyMock = cloudinary.default.v2.uploader.destroy as ReturnType<typeof vi.fn>;

      const { deleteImage } = await import("./cloudinary.ts");
      await deleteImage("cafemitierra/test-id");

      expect(destroyMock).toHaveBeenCalledWith("cafemitierra/test-id");
    });
  });
});
