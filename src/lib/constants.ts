import type { Department } from "@/lib/supabase/database.types";

export const DEPARTMENTS: { value: Department; label: string; href: string }[] = [
  { value: "kids", label: "Kids", href: "/shop/kids" },
  { value: "ladies", label: "Ladies", href: "/shop/ladies" },
];

export const SIZE_PRESETS: Record<Department, string[]> = {
  kids: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"],
  ladies: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"],
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop/kids", label: "Kids" },
  { href: "/shop/ladies", label: "Ladies" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const LOW_STOCK_THRESHOLD = 2;
export const SHOP_PAGE_SIZE = 24;
export const ADMIN_PAGE_SIZE = 20;

export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  settings: "settings",
} as const;
