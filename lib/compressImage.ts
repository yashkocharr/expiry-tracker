// Client-only: shrink phone photos (3-8 MB) before upload — cuts Gemini
// latency and keeps us far from request-size limits. Also reused for the
// Blob thumbnail in Phase 5.
export async function compressImage(
  file: File,
  maxEdge = 1024,
  quality = 0.8,
): Promise<Blob> {
  // createImageBitmap applies EXIF orientation in modern browsers.
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");
    ctx.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("image encode failed")),
        "image/jpeg",
        quality,
      );
    });
  } finally {
    bitmap.close();
  }
}
