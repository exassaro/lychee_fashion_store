"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Size = { id: string; size: string; stock: number };

type Props = {
  whatsappNumber: string;
  sizes: Size[];
  product: {
    name: string;
    productCode: string;
    colour: string | null;
    price: number;
    imageUrl: string | null;
    productUrl: string;
  };
};

export function OrderPanel({ whatsappNumber, sizes, product }: Props) {
  const [selected, setSelected] = useState<string | null>(() => {
    // Auto-select when there is exactly one size in stock (e.g. "Free Size").
    const inStock = sizes.filter((s) => s.stock > 0);
    return sizes.length === 1 && inStock.length === 1 ? inStock[0].size : null;
  });

  const anyInStock = sizes.some((s) => s.stock > 0);
  const current = sizes.find((s) => s.size === selected);

  function order() {
    if (!selected || !whatsappNumber) return;
    const message = buildOrderMessage({ ...product, size: selected });
    window.open(whatsappLink(whatsappNumber, message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <div className="mb-3 flex items-center justify-between">
          <legend className="text-sm font-bold uppercase tracking-wider">Select size</legend>
          {current && current.stock > 0 && current.stock <= LOW_STOCK_THRESHOLD && (
            <span className="text-sm font-semibold text-brand" role="status">
              Only {current.stock} left!
            </span>
          )}
        </div>

        {sizes.length ? (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {sizes.map((s) => {
              const out = s.stock <= 0;
              const isSel = selected === s.size;
              const low = !out && s.stock <= LOW_STOCK_THRESHOLD;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  disabled={out}
                  onClick={() => setSelected(s.size)}
                  className={cn(
                    "relative flex min-w-[3.75rem] flex-col items-center rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors",
                    isSel && "border-brand bg-brand-soft text-brand",
                    !isSel && !out && "border-border bg-white hover:border-ink",
                    out && "cursor-not-allowed border-dashed border-border bg-mist text-ink/40 line-through",
                  )}
                  aria-label={`${s.size}${out ? " — out of stock" : low ? ` — only ${s.stock} left` : ""}`}
                >
                  {s.size}
                  {low && <span className="mt-0.5 text-[10px] font-medium normal-case text-brand no-underline">{s.stock} left</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink/60">Sizes will be updated soon.</p>
        )}
      </fieldset>

      {anyInStock ? (
        <Button
          type="button"
          variant="whatsapp"
          size="xl"
          onClick={order}
          disabled={!selected || !whatsappNumber}
          className="w-full text-xl font-bold shadow-lg shadow-whatsapp/20 [&_svg]:size-6"
        >
          <WhatsAppIcon /> Order on WhatsApp
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="rounded-lg bg-mist px-4 py-3 text-center text-sm font-semibold text-ink/70">
            This product is currently out of stock
          </p>
          {whatsappNumber && (
            <Button asChild variant="outline" size="lg" className="w-full">
              <a
                href={whatsappLink(
                  whatsappNumber,
                  `Hi LYCHEE! Will this be back in stock?\n🛍️ ${product.name} (${product.productCode})\n🔗 ${product.productUrl}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="text-[#128C4A]" /> Ask about restock
              </a>
            </Button>
          )}
        </div>
      )}
      {anyInStock && !selected && (
        <p className="-mt-2 text-center text-xs text-ink/60">Select a size to enable ordering</p>
      )}
    </div>
  );
}
