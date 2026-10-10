"use server";

import { getAdminOrError } from "@/lib/auth";
import { STORAGE_BUCKET } from "@/lib/env";
import { nullIfEmpty, settingsSchema, type SettingsFormValues } from "@/lib/validations";
import { revalidateSettings } from "./revalidate";
import type { ActionResult } from "./products";

export async function saveSettings(values: SettingsFormValues): Promise<ActionResult> {
  const auth = await getAdminOrError();
  if (auth.error !== undefined) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  const v = parsed.data;

  const { data: existing } = await supabase.from("settings").select("hero_image_path").eq("id", 1).maybeSingle();

  const { error } = await supabase.from("settings").upsert({
    id: 1,
    store_name: v.store_name,
    tagline: v.tagline,
    address: nullIfEmpty(v.address),
    opening_hours: nullIfEmpty(v.opening_hours),
    phone: nullIfEmpty(v.phone),
    whatsapp_number: nullIfEmpty(v.whatsapp_number),
    email: nullIfEmpty(v.email),
    instagram_url: nullIfEmpty(v.instagram_url),
    facebook_url: nullIfEmpty(v.facebook_url),
    maps_url: nullIfEmpty(v.maps_url),
    maps_embed_url: nullIfEmpty(v.maps_embed_url),
    hero_title: nullIfEmpty(v.hero_title),
    hero_subtitle: nullIfEmpty(v.hero_subtitle),
    about_text: nullIfEmpty(v.about_text),
    hero_image_url: v.hero_image?.url ?? null,
    hero_image_path: v.hero_image?.path ?? null,
  });
  if (error) return { ok: false, error: error.message };

  const oldPath = existing?.hero_image_path;
  if (oldPath && oldPath !== v.hero_image?.path) await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);

  revalidateSettings();
  return { ok: true, data: undefined };
}
