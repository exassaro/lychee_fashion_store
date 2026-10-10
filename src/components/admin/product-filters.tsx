"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { Category } from "@/lib/types";

export function AdminProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() });
        }}
        role="search"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => q !== (sp.get("q") ?? "") && update({ q: q.trim() })}
          placeholder="Search name or code"
          className="h-11 bg-white pl-9"
          aria-label="Search products"
        />
        {pending && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-brand" />}
      </form>
      <div className="grid grid-cols-3 gap-2 sm:contents">
        <NativeSelect
          aria-label="Department"
          value={sp.get("dept") ?? ""}
          onChange={(e) => update({ dept: e.target.value, category: "" })}
          className="h-11 bg-white"
        >
          <option value="">All depts</option>
          <option value="kids">Kids</option>
          <option value="ladies">Ladies</option>
        </NativeSelect>
        <NativeSelect
          aria-label="Category"
          value={sp.get("category") ?? ""}
          onChange={(e) => update({ category: e.target.value })}
          className="h-11 bg-white"
        >
          <option value="">All categories</option>
          {categories
            .filter((c) => !sp.get("dept") || c.department === sp.get("dept"))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.department === "kids" ? "Kids" : "Ladies"} · {c.name}
              </option>
            ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Stock status"
          value={sp.get("stock") ?? ""}
          onChange={(e) => update({ stock: e.target.value })}
          className="h-11 bg-white"
        >
          <option value="">All stock</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
          <option value="hidden">Hidden</option>
        </NativeSelect>
      </div>
    </div>
  );
}
