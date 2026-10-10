import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AdminProductFilters } from "@/components/admin/product-filters";
import { ProductListItem } from "@/components/admin/product-list-item";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { sanitizeSearch } from "@/lib/data";

export const metadata = { title: "Products" };

type SP = { q?: string; dept?: string; category?: string; stock?: string; page?: string };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const page = Math.max(1, Number(sp.page) || 1);

  let query = supabase
    .from("product_cards")
    .select(
      "id, name, product_code, price, cover_url, total_stock, low_stock_count, is_visible, is_featured, department, category_name",
      { count: "exact" },
    );

  const q = sanitizeSearch(sp.q ?? "");
  if (q) query = query.or(`name.ilike.%${q}%,product_code.ilike.%${q}%`);
  if (sp.dept === "kids" || sp.dept === "ladies") query = query.eq("department", sp.dept);
  if (sp.category) query = query.eq("category_id", sp.category);
  if (sp.stock === "out") query = query.eq("total_stock", 0);
  if (sp.stock === "in") query = query.gt("total_stock", 0);
  if (sp.stock === "low") query = query.gt("low_stock_count", 0);
  if (sp.stock === "hidden") query = query.eq("is_visible", false);

  const [{ data: products, count, error }, { data: categories }] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1),
    supabase.from("categories").select("*").order("department").order("sort_order"),
  ]);

  const ids = (products ?? []).map((p) => p.id);
  const { data: sizes } = ids.length
    ? await supabase.from("product_sizes").select("id, product_id, size, stock, sort_order").in("product_id", ids).order("sort_order")
    : { data: [] };

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const href = (p: number) => {
    const next = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    next.set("page", String(p));
    return `/admin/products?${next.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl">Products</h1>
          <p className="text-sm text-ink/60">{total} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> Add product
          </Link>
        </Button>
      </div>

      <AdminProductFilters categories={categories ?? []} />

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="hidden grid-cols-[56px_1fr_120px_140px_auto] gap-4 border-b bg-mist/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink/60 md:grid">
          <span />
          <span>Product</span>
          <span>Price</span>
          <span>Stock</span>
          <span className="pr-2 text-right">Actions</span>
        </div>
        {products?.length ? (
          <ul className="divide-y">
            {products.map((p) => (
              <ProductListItem key={p.id} product={p} sizes={(sizes ?? []).filter((s) => s.product_id === p.id)} />
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center text-sm text-ink/60">
            No products match.{" "}
            <Link href="/admin/products/new" className="font-semibold text-brand">Add one</Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <Button asChild={page > 1} variant="outline" size="icon" disabled={page <= 1} aria-label="Previous page">
            {page > 1 ? <Link href={href(page - 1)}><ChevronLeft /></Link> : <ChevronLeft />}
          </Button>
          <span className="px-2 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button asChild={page < totalPages} variant="outline" size="icon" disabled={page >= totalPages} aria-label="Next page">
            {page < totalPages ? <Link href={href(page + 1)}><ChevronRight /></Link> : <ChevronRight />}
          </Button>
        </nav>
      )}
    </div>
  );
}
