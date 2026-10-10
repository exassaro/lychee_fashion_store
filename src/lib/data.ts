import "server-only";
import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/env";
import { CACHE_TAGS, SHOP_PAGE_SIZE, type SortValue } from "@/lib/constants";
import type { Department } from "@/lib/supabase/database.types";
import type { Category, ProductCard, ProductDetail, Settings } from "@/lib/types";

/** Fallback cache lifetime; admin actions revalidate tags instantly. */
const REVALIDATE_SECONDS = 3600;

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  store_name: "LYCHEE",
  tagline: "Fashion for Kids and Ladies",
  address: null,
  opening_hours: null,
  phone: null,
  whatsapp_number: null,
  email: null,
  instagram_url: null,
  facebook_url: null,
  maps_url: null,
  maps_embed_url: null,
  hero_title: "Fresh styles for little ones & you",
  hero_subtitle: "Browse online, order on WhatsApp.",
  hero_image_url: null,
  hero_image_path: null,
  about_text: null,
  updated_at: new Date(0).toISOString(),
};

function warnUnconfigured() {
  if (process.env.NODE_ENV !== "test") {
    console.warn("[lychee] Supabase env vars missing — rendering with empty data.");
  }
}

// ---------------------------------------------------------------------------
// Settings & categories
// ---------------------------------------------------------------------------

export const getSettings = unstable_cache(
  async (): Promise<Settings> => {
    if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
    const { data, error } = await getPublicSupabase().from("settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw new Error(`getSettings: ${error.message}`);
    return data ?? DEFAULT_SETTINGS;
  },
  ["settings"],
  { tags: [CACHE_TAGS.settings], revalidate: REVALIDATE_SECONDS },
);

export const getCategories = unstable_cache(
  async (department?: Department): Promise<Category[]> => {
    if (!isSupabaseConfigured) return [];
    let query = getPublicSupabase()
      .from("categories")
      .select("*")
      .order("department")
      .order("sort_order")
      .order("name");
    if (department) query = query.eq("department", department);
    const { data, error } = await query;
    if (error) throw new Error(`getCategories: ${error.message}`);
    return data;
  },
  ["categories"],
  { tags: [CACHE_TAGS.categories], revalidate: REVALIDATE_SECONDS },
);

// ---------------------------------------------------------------------------
// Product listings
// ---------------------------------------------------------------------------

export type ProductFilters = {
  department?: Department;
  categories?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  q?: string;
  sort?: SortValue;
  page?: number;
  featured?: boolean;
  limit?: number;
};

/** Strip characters that have meaning in PostgREST filter strings. */
export function sanitizeSearch(q: string) {
  return q.replace(/[,()*%\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export const getProducts = unstable_cache(
  async (filters: ProductFilters): Promise<{ items: ProductCard[]; total: number }> => {
    if (!isSupabaseConfigured) {
      warnUnconfigured();
      return { items: [], total: 0 };
    }

    const limit = filters.limit ?? SHOP_PAGE_SIZE;
    const page = Math.max(1, filters.page ?? 1);

    let query = getPublicSupabase().from("product_cards").select("*", { count: "exact" });

    if (filters.department) query = query.eq("department", filters.department);
    if (filters.categories?.length) query = query.in("category_slug", filters.categories);
    if (filters.sizes?.length) query = query.overlaps("available_sizes", filters.sizes);
    if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
    if (filters.inStock) query = query.gt("total_stock", 0);
    if (filters.featured) query = query.eq("is_featured", true);

    const q = filters.q ? sanitizeSearch(filters.q) : "";
    if (q) query = query.or(`name.ilike.%${q}%,product_code.ilike.%${q}%`);

    switch (filters.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
    query = query.order("id").range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(`getProducts: ${error.message}`);
    return { items: data, total: count ?? data.length };
  },
  ["products-list"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export async function getNewArrivals(limit = 8) {
  return (await getProducts({ sort: "newest", limit })).items;
}

export async function getFeatured(limit = 8) {
  return (await getProducts({ featured: true, sort: "newest", limit })).items;
}

// ---------------------------------------------------------------------------
// Product detail
// ---------------------------------------------------------------------------

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductDetail | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await getPublicSupabase()
      .from("products")
      .select("*, category:categories(id, name, slug), images:product_images(*), sizes:product_sizes(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`getProductBySlug: ${error.message}`);
    if (!data) return null;

    return {
      ...data,
      images: [...data.images].sort((a, b) => a.sort_order - b.sort_order),
      sizes: [...data.sizes].sort((a, b) => a.sort_order - b.sort_order),
    };
  },
  ["product-detail"],
  { tags: [CACHE_TAGS.products, CACHE_TAGS.categories], revalidate: REVALIDATE_SECONDS },
);

export async function getRelatedProducts(product: ProductDetail, limit = 8) {
  if (!product.category) {
    const { items } = await getProducts({ department: product.department, limit: limit + 1 });
    return items.filter((p) => p.id !== product.id).slice(0, limit);
  }
  const { items } = await getProducts({
    department: product.department,
    categories: [product.category.slug],
    limit: limit + 1,
  });
  return items.filter((p) => p.id !== product.id).slice(0, limit);
}

export const getAllProductSlugs = unstable_cache(
  async (): Promise<{ slug: string; updated_at: string }[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await getPublicSupabase()
      .from("products")
      .select("slug, updated_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(`getAllProductSlugs: ${error.message}`);
    return data;
  },
  ["product-slugs"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);
