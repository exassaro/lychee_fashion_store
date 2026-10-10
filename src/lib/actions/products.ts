"use server";

import { getAdminOrError } from "@/lib/auth";
import { STORAGE_BUCKET } from "@/lib/env";
import { nullIfEmpty, parseTags, productSchema, type ProductFormValues } from "@/lib/validations";
import { revalidateProducts } from "./revalidate";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function friendlyDbError(message: string) {
  if (message.includes("products_slug_key")) return "That URL slug is already used by another product.";
  if (message.includes("product_sizes_product_id_size_key")) return "Each size can only be listed once.";
  if (message.includes("products_mrp_check")) return "MRP must be greater than or equal to price.";
  return message;
}

export async function saveProduct(
  id: string | null,
  values: ProductFormValues,
): Promise<ActionResult<{ id: string; slug: string; product_code: string }>> {
  const auth = await getAdminOrError();
  if (auth.error !== undefined) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product details" };
  const v = parsed.data;

  const row = {
    name: v.name,
    department: v.department,
    category_id: v.category_id,
    description: nullIfEmpty(v.description),
    fabric: nullIfEmpty(v.fabric),
    colour: nullIfEmpty(v.colour),
    age_group: v.department === "kids" ? nullIfEmpty(v.age_group) : null,
    price: v.price,
    mrp: v.mrp && v.mrp > 0 ? v.mrp : null,
    tags: parseTags(v.tags),
    is_featured: v.is_featured,
    is_visible: v.is_visible,
    ...(v.slug ? { slug: v.slug } : {}),
  };

  // 1. Product row
  let previousSlug: string | null = null;
  let product: { id: string; slug: string; product_code: string };

  if (id) {
    const { data: existing } = await supabase.from("products").select("slug").eq("id", id).maybeSingle();
    if (!existing) return { ok: false, error: "Product not found." };
    previousSlug = existing.slug;

    const { data, error } = await supabase
      .from("products")
      .update(row)
      .eq("id", id)
      .select("id, slug, product_code")
      .single();
    if (error) return { ok: false, error: friendlyDbError(error.message) };
    product = data;
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id, slug, product_code").single();
    if (error) return { ok: false, error: friendlyDbError(error.message) };
    product = data;
  }

  // 2. Sizes: upsert by (product_id, size) so row ids stay stable, then drop removed sizes.
  const sizeRows = v.sizes.map((s, i) => ({ product_id: product.id, size: s.size, stock: s.stock, sort_order: i }));
  if (sizeRows.length) {
    const { error } = await supabase.from("product_sizes").upsert(sizeRows, { onConflict: "product_id,size" });
    if (error) return { ok: false, error: friendlyDbError(error.message) };
  }
  const { data: currentSizes } = await supabase.from("product_sizes").select("id, size").eq("product_id", product.id);
  const keep = new Set(v.sizes.map((s) => s.size));
  const staleSizeIds = (currentSizes ?? []).filter((s) => !keep.has(s.size)).map((s) => s.id);
  if (staleSizeIds.length) {
    const { error } = await supabase.from("product_sizes").delete().in("id", staleSizeIds);
    if (error) return { ok: false, error: error.message };
  }

  // 3. Images: replace rows in the new order, and delete files that were removed.
  const { data: oldImages } = await supabase.from("product_images").select("storage_path").eq("product_id", product.id);
  const newPaths = new Set(v.images.map((i) => i.path));
  const removedPaths = (oldImages ?? []).map((i) => i.storage_path).filter((p) => !newPaths.has(p));

  const { error: delImgError } = await supabase.from("product_images").delete().eq("product_id", product.id);
  if (delImgError) return { ok: false, error: delImgError.message };
  if (v.images.length) {
    const { error } = await supabase.from("product_images").insert(
      v.images.map((img, i) => ({
        product_id: product.id,
        storage_path: img.path,
        url: img.url,
        alt: i === 0 ? v.name : `${v.name} — view ${i + 1}`,
        sort_order: i,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }
  if (removedPaths.length) await supabase.storage.from(STORAGE_BUCKET).remove(removedPaths);

  revalidateProducts(product.slug, previousSlug);
  return { ok: true, data: product };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const auth = await getAdminOrError();
  if (auth.error !== undefined) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const { data: product } = await supabase
    .from("products")
    .select("slug, images:product_images(storage_path)")
    .eq("id", id)
    .maybeSingle();
  if (!product) return { ok: false, error: "Product not found." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  const paths = product.images.map((i) => i.storage_path);
  if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);

  revalidateProducts(product.slug);
  return { ok: true, data: undefined };
}

export async function adjustStock(sizeId: string, delta: number): Promise<ActionResult<{ stock: number }>> {
  const auth = await getAdminOrError();
  if (auth.error !== undefined) return { ok: false, error: auth.error };
  if (!Number.isInteger(delta) || Math.abs(delta) > 1000) return { ok: false, error: "Invalid amount" };

  const { data, error } = await auth.supabase.rpc("adjust_stock", { p_size_id: sizeId, p_delta: delta });
  if (error) return { ok: false, error: error.message };

  const { data: size } = await auth.supabase
    .from("product_sizes")
    .select("product:products(slug)")
    .eq("id", sizeId)
    .maybeSingle();
  revalidateProducts(size?.product?.slug);
  return { ok: true, data: { stock: data } };
}

export async function setProductFlag(
  id: string,
  flag: "is_visible" | "is_featured",
  value: boolean,
): Promise<ActionResult> {
  const auth = await getAdminOrError();
  if (auth.error !== undefined) return { ok: false, error: auth.error };

  const { data, error } = await auth.supabase
    .from("products")
    .update(flag === "is_visible" ? { is_visible: value } : { is_featured: value })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidateProducts(data.slug);
  return { ok: true, data: undefined };
}
