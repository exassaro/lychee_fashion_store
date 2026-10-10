"use server";

import { getAdminOrError } from "@/lib/auth";
import { STORAGE_BUCKET } from "@/lib/env";
import { slugify } from "@/lib/utils";
import { categorySchema, type CategoryFormValues } from "@/lib/validations";
import { revalidateCategories } from "./revalidate";
import type { ActionResult } from "./products";

export async function saveCategory(values: CategoryFormValues): Promise<ActionResult> {
  const auth = await getAdminOrError();
  if (auth.error !== undefined) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };
  const v = parsed.data;

  const slug = v.slug || slugify(v.name);
  if (!slug) return { ok: false, error: "Name must contain letters or numbers." };

  const row = {
    department: v.department,
    name: v.name,
    slug,
    sort_order: v.sort_order,
    image_url: v.image?.url ?? null,
    image_path: v.image?.path ?? null,
  };

  let oldImagePath: string | null = null;
  if (v.id) {
    const { data: existing } = await supabase.from("categories").select("image_path").eq("id", v.id).maybeSingle();
    oldImagePath = existing?.image_path ?? null;
    const { error } = await supabase.from("categories").update(row).eq("id", v.id);
    if (error) return { ok: false, error: duplicateMessage(error.message) };
  } else {
    const { error } = await supabase.from("categories").insert(row);
    if (error) return { ok: false, error: duplicateMessage(error.message) };
  }

  if (oldImagePath && oldImagePath !== row.image_path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([oldImagePath]);
  }

  revalidateCategories();
  return { ok: true, data: undefined };
}

function duplicateMessage(message: string) {
  return message.includes("categories_department_slug_key")
    ? "A category with this name/slug already exists in this department."
    : message;
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const auth = await getAdminOrError();
  if (auth.error !== undefined) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const { data: category } = await supabase.from("categories").select("image_path").eq("id", id).maybeSingle();
  // Products keep existing; their category_id is set to NULL by the FK.
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (category?.image_path) await supabase.storage.from(STORAGE_BUCKET).remove([category.image_path]);

  revalidateCategories();
  return { ok: true, data: undefined };
}
