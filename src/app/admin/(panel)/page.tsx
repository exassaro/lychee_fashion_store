import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, EyeOff, ImageOff, Package, PackageX, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const [total, outOfStock, hidden, lowStock, recent] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("product_cards").select("id", { count: "exact", head: true }).eq("total_stock", 0),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_visible", false),
    supabase
      .from("product_sizes")
      .select("id, size, stock, product:products(id, name, product_code)")
      .lte("stock", LOW_STOCK_THRESHOLD)
      .order("stock")
      .limit(30),
    supabase
      .from("product_cards")
      .select("id, name, product_code, price, cover_url, total_stock, is_visible, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    { label: "Total products", value: total.count ?? 0, icon: Package, href: "/admin/products", tone: "text-brand bg-brand-soft" },
    { label: "Out of stock", value: outOfStock.count ?? 0, icon: PackageX, href: "/admin/products?stock=out", tone: "text-red-700 bg-red-50" },
    { label: "Low-stock sizes", value: lowStock.data?.filter((s) => s.stock > 0).length ?? 0, icon: AlertTriangle, href: "/admin/products?stock=low", tone: "text-amber-700 bg-amber-50" },
    { label: "Hidden", value: hidden.count ?? 0, icon: EyeOff, href: "/admin/products", tone: "text-ink/70 bg-mist" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-ink/60">Overview of your store.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> Add product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, tone }) => (
          <Link key={label} href={href} className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-card">
            <span className={`mb-3 flex size-10 items-center justify-center rounded-full ${tone}`}>
              <Icon className="size-5" />
            </span>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-ink/60">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock (≤ {LOW_STOCK_THRESHOLD})</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.data?.length ? (
              <ul className="divide-y">
                {lowStock.data.map((s) =>
                  s.product ? (
                    <li key={s.id}>
                      <Link href={`/admin/products/${s.product.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-brand">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{s.product.name}</span>
                          <span className="text-xs text-ink/60">
                            {s.product.product_code} · Size {s.size}
                          </span>
                        </span>
                        <Badge variant={s.stock === 0 ? "destructive" : "warning"}>
                          {s.stock === 0 ? "Out" : `${s.stock} left`}
                        </Badge>
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : (
              <p className="text-sm text-ink/60">All sizes are well stocked. 🎉</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently added</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.data?.length ? (
              <ul className="divide-y">
                {recent.data.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 py-2.5 hover:text-brand">
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-mist">
                        {p.cover_url ? (
                          <Image src={p.cover_url} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <ImageOff className="m-3 size-6 text-ink/30" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{p.name}</span>
                        <span className="text-xs text-ink/60">
                          {p.product_code} · ₹{formatPrice(p.price)} · {p.total_stock} in stock
                        </span>
                      </span>
                      {!p.is_visible && <Badge variant="muted">Hidden</Badge>}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/60">No products yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
