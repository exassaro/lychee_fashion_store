"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { countActiveFilters, parseShopParams } from "@/lib/shop-params";

export type FilterCategory = { slug: string; name: string };

type Props = {
  categories: FilterCategory[];
  sizes: string[];
  total: number;
};

function useShopUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const params = parseShopParams(Object.fromEntries(searchParams.entries()));

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("page"); // any filter change resets pagination
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function toggleList(key: "category" | "size", current: string[], value: string) {
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    update({ [key]: [...set].join(",") || null });
  }

  function clearAll() {
    update({ category: null, size: null, min: null, max: null, instock: null });
  }

  return { params, update, toggleList, clearAll, pending };
}

function FilterPanel({ categories, sizes }: Omit<Props, "total">) {
  const { params, update, toggleList, clearAll, pending } = useShopUrl();
  const [min, setMin] = useState(params.minPrice?.toString() ?? "");
  const [max, setMax] = useState(params.maxPrice?.toString() ?? "");
  const active = countActiveFilters(params);

  useEffect(() => {
    setMin(params.minPrice?.toString() ?? "");
    setMax(params.maxPrice?.toString() ?? "");
  }, [params.minPrice, params.maxPrice]);

  return (
    <div className={cn("space-y-7 transition-opacity", pending && "opacity-60")}>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-mist px-4 py-3">
        <span className="text-sm font-semibold">In stock only</span>
        <input
          type="checkbox"
          className="size-5 accent-[#E8004C]"
          checked={params.inStock}
          onChange={(e) => update({ instock: e.target.checked ? "1" : null })}
        />
      </label>

      {categories.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-bold uppercase tracking-wider">Category</legend>
          <div className="space-y-1">
            {categories.map((c) => {
              const checked = params.categories.includes(c.slug);
              return (
                <label key={c.slug} className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm hover:text-brand">
                  <input
                    type="checkbox"
                    className="size-4 accent-[#E8004C]"
                    checked={checked}
                    onChange={() => toggleList("category", params.categories, c.slug)}
                  />
                  <span className={cn(checked && "font-semibold text-brand")}>{c.name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wider">Size</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const checked = params.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={checked}
                onClick={() => toggleList("size", params.sizes, s)}
                className={cn(
                  "min-w-12 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  checked ? "border-brand bg-brand text-white" : "border-border bg-white hover:border-ink",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wider">Price (₹)</legend>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: min || null, max: max || null });
          }}
        >
          <Input inputMode="numeric" type="number" min={0} placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" />
          <span className="text-ink/50">–</span>
          <Input inputMode="numeric" type="number" min={0} placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" />
          <Button type="submit" variant="outline" size="icon" aria-label="Apply price" className="shrink-0">
            <Check />
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["0", "499"],
            ["500", "999"],
            ["1000", "1999"],
            ["2000", ""],
          ].map(([lo, hi]) => (
            <button
              key={lo}
              type="button"
              onClick={() => update({ min: lo === "0" ? null : lo, max: hi || null })}
              className="rounded-full border px-3 py-1 text-xs font-medium hover:border-brand hover:text-brand"
            >
              {hi ? `₹${lo}–${hi}` : `₹${lo}+`}
            </button>
          ))}
        </div>
      </fieldset>

      {active > 0 && (
        <Button variant="ghost" className="w-full text-brand" onClick={clearAll}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}

/** Desktop: sticky sidebar. */
export function ShopFiltersSidebar(props: Omit<Props, "total">) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters">
      <div className="sticky top-28">
        <FilterPanel {...props} />
      </div>
    </aside>
  );
}

/** Mobile: button that opens a slide-up sheet. */
export function ShopFiltersMobile({ total, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const active = countActiveFilters(parseShopParams(Object.fromEntries(searchParams.entries())));

  return (
    <>
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal /> Filters
        {active > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] text-white">{active}</span>
        )}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="gap-0 p-0">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine products by category, size and price.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FilterPanel {...props} />
          </div>
          <div className="border-t p-4 pb-safe">
            <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
              Show {total} {total === 1 ? "result" : "results"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SortSelect() {
  const { params, update, pending } = useShopUrl();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-ink/60 sm:inline">Sort by</span>
      <select
        value={params.sort}
        onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
        className={cn(
          "h-10 rounded-md border border-input bg-white px-3 pr-8 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          pending && "opacity-60",
        )}
        aria-label="Sort products"
      >
        <option value="newest">Newest first</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </label>
  );
}

export function ShopSearch() {
  const { params, update } = useShopUrl();
  const [q, setQ] = useState(params.q);
  useEffect(() => setQ(params.q), [params.q]);

  return (
    <form
      role="search"
      className="relative w-full sm:max-w-xs"
      onSubmit={(e) => {
        e.preventDefault();
        update({ q: q.trim() || null });
      }}
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or code…"
        aria-label="Search by name or product code"
        className="h-10 bg-white pr-16"
        type="search"
      />
      <Button type="submit" size="sm" variant="ghost" className="absolute right-0.5 top-0.5 h-9 text-brand">
        Search
      </Button>
    </form>
  );
}
