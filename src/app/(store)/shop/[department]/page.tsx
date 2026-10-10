import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import type { RawSearchParams } from "@/lib/shop-params";
import type { Department } from "@/lib/supabase/database.types";

const META: Record<Department, { title: string; description: string }> = {
  kids: {
    title: "Kids Clothing — Frocks, Tops, Sets & Nightwear",
    description: "Shop LYCHEE kids wear: frocks, tops, sets and nightwear for ages 0–13. Check sizes and stock online, order on WhatsApp.",
  },
  ladies: {
    title: "Ladies Clothing — Kurtis, Tops, Sets & Nightwear",
    description: "Shop LYCHEE ladies wear: kurtis, tops, sets and nightwear in sizes XS–3XL. Check stock online, order on WhatsApp.",
  },
};

function isDepartment(value: string): value is Department {
  return value === "kids" || value === "ladies";
}

export function generateStaticParams() {
  return [{ department: "kids" }, { department: "ladies" }];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ department: string }> }): Promise<Metadata> {
  const { department } = await params;
  if (!isDepartment(department)) return {};
  return { ...META[department], alternates: { canonical: `/shop/${department}` } };
}

export default async function DepartmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ department: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { department } = await params;
  if (!isDepartment(department)) notFound();
  return <ShopView department={department} searchParams={await searchParams} />;
}
