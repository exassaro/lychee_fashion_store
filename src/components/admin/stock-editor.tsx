"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { adjustStock } from "@/lib/actions/products";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Size = { id: string; size: string; stock: number };

function SizeStepper({ size }: { size: Size }) {
  const [stock, setStock] = useState(size.stock);
  const [pending, startTransition] = useTransition();

  function change(delta: number) {
    const optimistic = Math.max(0, stock + delta);
    const previous = stock;
    setStock(optimistic);
    startTransition(async () => {
      const res = await adjustStock(size.id, delta);
      if (res.ok) setStock(res.data.stock);
      else {
        setStock(previous);
        toast.error(res.error);
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border bg-white px-2 py-1.5",
        stock === 0 && "border-red-200 bg-red-50/50",
        stock > 0 && stock <= LOW_STOCK_THRESHOLD && "border-amber-200 bg-amber-50/50",
      )}
    >
      <span className="min-w-12 text-sm font-semibold">{size.size}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => change(-1)}
          disabled={stock === 0}
          className="flex size-9 items-center justify-center rounded-md border bg-white text-ink active:scale-95 disabled:opacity-40"
          aria-label={`Decrease ${size.size} stock`}
        >
          <Minus className="size-4" />
        </button>
        <span className={cn("w-9 text-center text-base font-bold tabular-nums", pending && "opacity-50")} aria-live="polite">
          {stock}
        </span>
        <button
          type="button"
          onClick={() => change(1)}
          className="flex size-9 items-center justify-center rounded-md border bg-white text-ink active:scale-95"
          aria-label={`Increase ${size.size} stock`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function StockEditor({ sizes }: { sizes: Size[] }) {
  if (!sizes.length) return <p className="text-sm text-ink/60">No sizes yet — edit the product to add sizes.</p>;
  return (
    <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {sizes.map((s) => (
        <SizeStepper key={s.id} size={s} />
      ))}
    </div>
  );
}
