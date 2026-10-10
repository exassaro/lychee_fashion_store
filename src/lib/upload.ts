"use client";

import imageCompression from "browser-image-compression";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/env";

export type UploadedImage = { path: string; url: string };

const MAX_DIMENSION = 1200;

/**
 * Resizes to max 1200px and converts to WebP in the browser, then uploads straight
 * to Supabase Storage with the admin's session (storage RLS = admin-only write).
 * Safari can't encode WebP from canvas, so we fall back to JPEG there.
 */
export async function compressAndUpload(file: File, folder: "products" | "categories" | "site"): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);

  let blob: Blob = await imageCompression(file, {
    maxWidthOrHeight: MAX_DIMENSION,
    maxSizeMB: 0.35,
    fileType: "image/webp",
    initialQuality: 0.82,
    useWebWorker: true,
  });

  if (blob.type !== "image/webp") {
    blob = await imageCompression(file, {
      maxWidthOrHeight: MAX_DIMENSION,
      maxSizeMB: 0.4,
      fileType: "image/jpeg",
      initialQuality: 0.82,
      useWebWorker: true,
    });
  }

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = getBrowserSupabase();

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}
