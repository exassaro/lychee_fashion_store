import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFiltersMobile, ShopFiltersSidebar, ShopSearch, SortSelect, type FilterCategory } from "@/components/shop/shop-filters";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/data";
import { SHOP_PAGE_SIZE, SIZE_PRESETS } from "@/lib/constants";
import { parseShopParams, type RawSearchParams } from "@/lib/shop-params";
import type { Department } from "@/lib/supabase/database.types";

const TITLES: Record<Department | "all", { title: string; subtitle: string }> = {
  all: { title: "Shop All", subtitle: "Everything for kids and ladies, in one place." },
  kids: { title: "Kids", subtitle: "Cute, comfy and colourful — frocks, tops, sets and more." },
  ladies: { title: "Ladies", subtitle: "Kurtis, tops, sets and nightwear for every day." },
};

function pageHref(pathname: string, sp: RawSearchParams, page: number) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v == null) continue;
    next.set(k, Array.isArray(v) ? v.join(",") : v);
  }
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export async function ShopView({ department, searchParams }: { department?: Department; searchParams: RawSearchParams }) {
  const params = parseShopParams(searchParams);
  const pathname = department ? `/shop/${department}` : "/shop";

  const [{ items, total }, categories] = await Promise.all([
    getProducts({
      department,
      categories: params.categories,
      sizes: params.sizes,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStock: params.inStock,
      q: params.q,
      sort: params.sort,
      page: params.page,
    }),
    getCategories(department),
  ]);

  // On /shop, "Tops" exists under both departments → dedupe by slug.
  const filterCategories: FilterCategory[] = [...new Map(categories.map((c) => [c.slug, { slug: c.slug, name: c.name }])).values()];
  const sizes = department ? SIZE_PRESETS[department] : [...SIZE_PRESETS.kids, ...SIZE_PRESETS.ladies];
  const totalPages = Math.max(1, Math.ceil(total / SHOP_PAGE_SIZE));
  const heading = TITLES[department ?? "all"];
  const showingNew = !department && params.sort === "newest" && searchParams.sort === "newest";

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span className="mx-1.5">/</span>
        {department ? (
          <>
            <Link href="/shop" className="hover:text-brand">Shop</Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink">{heading.title}</span>
          </>
        ) : (
          <span className="text-ink">Shop</span>
        )}
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">{showingNew ? "New Arrivals" : params.q ? `Results for “${params.q}”` : heading.title}</h1>
          <p className="mt-1 text-sm text-ink/70">{params.q ? `${total} matching products` : heading.subtitle}</p>
        </div>
        <ShopSearch />
      </header>

      <div className="flex gap-10">
        <ShopFiltersSidebar categories={filterCategories} sizes={sizes} />

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <ShopFiltersMobile categories={filterCategories} sizes={sizes} total={total} />
            <p className="hidden text-sm text-ink/60 lg:block">
              {total} {total === 1 ? "product" : "products"}
            </p>
            <SortSelect />
          </div>

          {items.length ? (
            <ProductGrid products={items} />
          ) : (
            <div className="flex flex-col items-center rounded-xl bg-mist px-6 py-16 text-center">
              <PackageSearch className="mb-4 size-12 text-brand/60" />
              <h2 className="text-xl">No products found</h2>
              <p className="mt-1 max-w-sm text-sm text-ink/70">Try removing some filters or searching for something else.</p>
              <Button asChild variant="outline" className="mt-5">
                <Link href={pathname}>Clear filters</Link>
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
              {params.page > 1 ? (
                <Button asChild variant="outline" size="icon" aria-label="Previous page">
                  <Link href={pageHref(pathname, searchParams, params.page - 1)}><ChevronLeft /></Link>
                </Button>
              ) : (
                <Button variant="outline" size="icon" disabled aria-label="Previous page"><ChevronLeft /></Button>
              )}
              <span className="px-3 text-sm font-medium">
                Page {params.page} of {totalPages}
              </span>
              {params.page < totalPages ? (
                <Button asChild variant="outline" size="icon" aria-label="Next page">
                  <Link href={pageHref(pathname, searchParams, params.page + 1)}><ChevronRight /></Link>
                </Button>
              ) : (
                <Button variant="outline" size="icon" disabled aria-label="Next page"><ChevronRight /></Button>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
