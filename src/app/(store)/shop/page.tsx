import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import type { RawSearchParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop Kids & Ladies Clothing",
  description: "Browse all LYCHEE kids and ladies clothing — filter by category, size and price. Order easily on WhatsApp.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return <ShopView searchParams={await searchParams} />;
}
