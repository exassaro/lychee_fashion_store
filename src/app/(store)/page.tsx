import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CategoryTiles } from "@/components/home/category-tiles";
import { TrustStrip } from "@/components/home/trust-strip";
import { ProductRow } from "@/components/product/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategories, getFeatured, getNewArrivals, getSettings } from "@/lib/data";
import { storeJsonLd } from "@/lib/seo";
import type { ProductCard } from "@/lib/types";

export const revalidate = 3600;

function Section({ id, title, href, products }: { id: string; title: string; href: string; products: ProductCard[] }) {
  if (!products.length) return null;
  return (
    <section className="container py-10 sm:py-14" aria-labelledby={id}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id={id} className="section-title">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <ProductRow products={products} />
    </section>
  );
}

export default async function HomePage() {
  const [settings, categories, newArrivals, featured] = await Promise.all([
    getSettings(),
    getCategories(),
    getNewArrivals(8),
    getFeatured(8),
  ]);

  return (
    <>
      <JsonLd data={storeJsonLd(settings)} />
      <Hero settings={settings} />
      <CategoryTiles categories={categories} />
      <Section id="new-arrivals" title="New Arrivals" href="/shop?sort=newest" products={newArrivals} />
      <TrustStrip />
      <Section id="featured" title="Featured" href="/shop" products={featured} />
      {!newArrivals.length && !featured.length && (
        <section className="container py-16 text-center text-ink/60">
          <p>New collection arriving soon. Check back shortly!</p>
        </section>
      )}
    </>
  );
}
