import { SORT_OPTIONS, type SortValue } from "@/lib/constants";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ShopParams = {
  categories: string[];
  sizes: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  q: string;
  sort: SortValue;
  page: number;
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function list(v: string | string[] | undefined) {
  const raw = Array.isArray(v) ? v.join(",") : (v ?? "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function num(v: string | string[] | undefined) {
  const n = Number(first(v));
  return Number.isFinite(n) && n >= 0 && first(v) !== "" ? n : undefined;
}

export function parseShopParams(sp: RawSearchParams): ShopParams {
  const sort = first(sp.sort);
  return {
    categories: list(sp.category).map((s) => s.toLowerCase()),
    sizes: list(sp.size),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    inStock: first(sp.instock) === "1",
    q: (first(sp.q) ?? "").slice(0, 60),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortValue) : "newest",
    page: Math.max(1, Math.floor(num(sp.page) ?? 1)),
  };
}

export function countActiveFilters(p: ShopParams) {
  return (
    p.categories.length + p.sizes.length + (p.minPrice != null || p.maxPrice != null ? 1 : 0) + (p.inStock ? 1 : 0)
  );
}
