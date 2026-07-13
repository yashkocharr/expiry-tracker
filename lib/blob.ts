// Server-only Vercel Blob helpers. Both functions degrade gracefully:
// thumbnails are a nice-to-have, never worth failing a scan or a delete over.
import { del, put } from "@vercel/blob";

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Uploads a compressed label photo; returns its public URL, or null if unavailable. */
export async function uploadThumbnail(
  userId: string,
  image: Uint8Array,
  contentType: string,
): Promise<string | null> {
  if (!blobConfigured()) return null;
  try {
    const { url } = await put(
      `thumbs/${userId}/${crypto.randomUUID()}.jpg`,
      Buffer.from(image),
      { access: "public", contentType },
    );
    return url;
  } catch (err) {
    console.error("[blob] thumbnail upload failed:", err);
    return null;
  }
}

/** Best-effort blob cleanup when an item is deleted. */
export async function deletePhotos(urls: string[] | null): Promise<void> {
  if (!urls?.length || !blobConfigured()) return;
  try {
    await del(urls);
  } catch (err) {
    console.error("[blob] photo delete failed:", err);
  }
}
