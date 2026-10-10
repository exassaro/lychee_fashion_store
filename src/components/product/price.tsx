import { cn, discountPercent, formatPrice } from "@/lib/utils";

export function Price({
  price,
  mrp,
  size = "sm",
  className,
}: {
  price: number;
  mrp?: number | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  const off = discountPercent(price, mrp);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold text-ink", size === "lg" ? "text-3xl" : "text-base")}>₹{formatPrice(price)}</span>
      {off > 0 && mrp && (
        <>
          <span className={cn("text-ink/50 line-through", size === "lg" ? "text-lg" : "text-sm")}>
            <span className="sr-only">MRP </span>₹{formatPrice(mrp)}
          </span>
          <span className={cn("font-semibold text-brand", size === "lg" ? "text-lg" : "text-sm")}>{off}% off</span>
        </>
      )}
    </div>
  );
}
