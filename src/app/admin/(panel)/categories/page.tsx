import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  const counts = new Map<string, number>();
  for (const p of products ?? []) if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl">Categories</h1>
        <p className="text-sm text-ink/60">Subcategories shown under Kids and Ladies on the store.</p>
      </div>
      <CategoryManager categories={(categories ?? []).map((c) => ({ ...c, product_count: counts.get(c.id) ?? 0 }))} />
    </div>
  );
}
