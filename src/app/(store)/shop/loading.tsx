import { ProductGridSkeleton } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="container py-8 sm:py-10" aria-busy="true" aria-label="Loading products">
      <Skeleton className="mb-3 h-3 w-32" />
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-8 h-4 w-72" />
      <div className="flex gap-10">
        <div className="hidden w-64 shrink-0 space-y-4 lg:block">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1">
          <div className="mb-5 flex justify-between">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-44" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
