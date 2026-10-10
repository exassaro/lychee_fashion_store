import type { Tables, Views } from "@/lib/supabase/database.types";

export type Settings = Tables<"settings">;
export type Category = Tables<"categories">;
export type ProductCard = Views<"product_cards">;
export type ProductImage = Tables<"product_images">;
export type ProductSize = Tables<"product_sizes">;

export type ProductDetail = Tables<"products"> & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  sizes: ProductSize[];
};
