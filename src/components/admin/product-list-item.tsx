"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronDown, Eye, EyeOff, ImageOff, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { StockEditor } from "@/components/admin/stock-editor";
import { setProductFlag } from "@/lib/actions/products";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductCard } from "@/lib/types";

type Props = {
  product: Pick<
    ProductCard,
    "id" | "name" | "product_code" | "price" | "cover_url" | "total_stock" | "low_stock_count" | "is_visible" | "is_featured" | "department" | "category_name"
  >;
  sizes: { id: string; size: string; stock: number }[];
};

function StockBadge({ total, low }: { total: number; low: number }) {
  if (total === 0) return <Badge variant="destructive">Out of stock</Badge>;
  if (low > 0) return <Badge variant="warning">{total} · low</Badge>;
  return <Badge variant="leaf">{total} in stock</Badge>;
}

export function ProductListItem({ product, sizes }: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(product.is_visible);
  const [featured, setFeatured] = useState(product.is_featured);
  const [pending, startTransition] = useTransition();

  function toggle(flag: "is_visible" | "is_featured", value: boolean) {
    const set = flag === "is_visible" ? setVisible : setFeatured;
    set(value);
    startTransition(async () => {
      const res = await setProductFlag(product.id, flag, value);
      if (!res.ok) {
        set(!value);
        toast.error(res.error);
      } else {
        toast.success(
          flag === "is_visible" ? (value ? "Product is now visible" : "Product hidden from store") : value ? "Marked as featured" : "Removed from featured",
        );
      }
    });
  }

  return (
    <li className="bg-white">
      <div className="grid grid-cols-[56px_1fr_auto] items-center gap-3 p-3 md:grid-cols-[56px_1fr_120px_140px_auto] md:gap-4 md:px-4">
        <div className="relative size-14 overflow-hidden rounded-md bg-mist">
          {product.cover_url ? (
            <Image src={product.cover_url} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <ImageOff className="m-4 size-6 text-ink/30" />
          )}
        </div>

        <div className="min-w-0">
          <Link href={`/admin/products/${product.id}`} className="line-clamp-1 font-medium hover:text-brand">
            {product.name}
          </Link>
          <p className="text-xs text-ink/60">
            <span className="font-mono">{product.product_code}</span> · {product.department === "kids" ? "Kids" : "Ladies"}
            {product.category_name ? ` · ${product.category_name}` : ""}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 md:hidden">
            <span className="text-sm font-semibold">₹{formatPrice(product.price)}</span>
            <StockBadge total={product.total_stock} low={product.low_stock_count} />
            {!visible && <Badge variant="muted">Hidden</Badge>}
          </div>
        </div>

        <div className="hidden text-sm font-semibold md:block">₹{formatPrice(product.price)}</div>
        <div className="hidden md:block">
          <StockBadge total={product.total_stock} low={product.low_stock_count} />
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggle("is_featured", !featured)}
            disabled={pending}
            aria-label={featured ? "Remove from featured" : "Mark as featured"}
            aria-pressed={featured}
            className="hidden sm:inline-flex"
          >
            <Star className={cn(featured && "fill-amber-400 text-amber-500")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggle("is_visible", !visible)}
            disabled={pending}
            aria-label={visible ? "Hide from store" : "Show in store"}
            aria-pressed={visible}
            className="hidden sm:inline-flex"
          >
            {visible ? <Eye /> : <EyeOff className="text-ink/40" />}
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={`Edit ${product.name}`} className="hidden sm:inline-flex">
            <Link href={`/admin/products/${product.id}`}>
              <Pencil />
            </Link>
          </Button>
          <div className="hidden sm:block">
            <DeleteProductButton id={product.id} name={product.name} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="ml-1"
          >
            Stock <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-t bg-mist/60 p-3 md:px-4">
          <StockEditor sizes={sizes} />
          <div className="flex flex-wrap gap-2 sm:hidden">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/products/${product.id}`}>
                <Pencil /> Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggle("is_visible", !visible)} disabled={pending}>
              {visible ? <EyeOff /> : <Eye />} {visible ? "Hide" : "Show"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggle("is_featured", !featured)} disabled={pending}>
              <Star className={cn(featured && "fill-amber-400 text-amber-500")} /> {featured ? "Unfeature" : "Feature"}
            </Button>
            <DeleteProductButton id={product.id} name={product.name} />
          </div>
        </div>
      )}
    </li>
  );
}
