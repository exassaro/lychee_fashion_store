import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";

/** Product data feeds home rows, shop grids, product pages and the sitemap. */
export function revalidateProducts(...slugs: (string | null | undefined)[]) {
  revalidateTag(CACHE_TAGS.products);
  for (const slug of slugs) if (slug) revalidatePath(`/product/${slug}`);
  revalidatePath("/admin", "layout");
}

export function revalidateCategories() {
  revalidateTag(CACHE_TAGS.categories);
  revalidateTag(CACHE_TAGS.products); // listings embed category names
  revalidatePath("/admin", "layout");
}

export function revalidateSettings() {
  revalidateTag(CACHE_TAGS.settings);
  revalidatePath("/admin", "layout");
}
