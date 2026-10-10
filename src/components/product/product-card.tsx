import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Price } from "@/components/product/price";
import { Badge } from "@/components/ui/badge";
import { discountPercent } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/lib/types";

const SIZES = "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 48vw";

export function ProductCard({ product, priority }: { product: ProductCardType; priority?: boolean }) {
  const soldOut = product.total_stock <= 0;
  const off = discountPercent(product.price, product.mrp);
  const isNew = Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 14;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-mist">
        {product.cover_url ? (
          <>
            <Image
              src={product.cover_url}
              alt={product.name}
              fill
              sizes={SIZES}
              priority={priority}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {product.hover_url && (
              <Image
                src={product.hover_url}
                alt=""
                fill
                sizes={SIZES}
                className="hidden object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">
            <ImageOff className="size-10" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {soldOut ? (
            <Badge variant="muted" className="bg-white/90 text-ink">Sold out</Badge>
          ) : (
            <>
              {isNew && <Badge variant="leafSolid">New</Badge>}
              {off > 0 && <Badge>{off}% off</Badge>}
            </>
          )}
        </div>
        {soldOut && <div className="absolute inset-0 bg-white/40" />}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink/60">
          {product.category_name ?? (product.department === "kids" ? "Kids" : "Ladies")}
        </p>
        <h3 className="line-clamp-2 font-sans text-sm font-medium leading-snug text-ink group-hover:text-brand sm:text-[15px]">
          {product.name}
        </h3>
        <Price price={product.price} mrp={product.mrp} className="mt-auto pt-1" />
      </div>
    </Link>
  );
}
