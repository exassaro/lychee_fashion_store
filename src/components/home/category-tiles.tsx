import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Baby, Sparkles } from "lucide-react";
import type { Category } from "@/lib/types";

const DEPT_TILES = [
  {
    href: "/shop/kids",
    title: "Kids",
    blurb: "Frocks, sets & comfy everyday wear",
    icon: Baby,
    className: "bg-gradient-to-br from-[#FFE8EF] to-[#FFD3E0]",
  },
  {
    href: "/shop/ladies",
    title: "Ladies",
    blurb: "Kurtis, tops, sets & nightwear",
    icon: Sparkles,
    className: "bg-gradient-to-br from-[#EAF8DF] to-[#D6F1C1]",
  },
];

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section className="container py-12 sm:py-16" aria-labelledby="shop-by-category">
      <h2 id="shop-by-category" className="section-title mb-6">Shop by category</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {DEPT_TILES.map(({ href, title, blurb, icon: Icon, className }) => (
          <Link
            key={href}
            href={href}
            className={`group relative flex min-h-40 items-end overflow-hidden rounded-xl p-6 transition-shadow hover:shadow-card-hover sm:min-h-52 ${className}`}
          >
            <Icon className="absolute right-6 top-6 size-16 text-brand/15 transition-transform duration-500 group-hover:scale-110 sm:size-24" />
            <div>
              <h3 className="text-3xl text-ink sm:text-4xl">{title}</h3>
              <p className="mt-1 text-sm text-ink/70">{blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Shop now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="scrollbar-none -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop/${c.department}?category=${c.slug}`}
              className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center sm:w-auto"
            >
              <div className="relative size-20 overflow-hidden rounded-full bg-mist ring-2 ring-transparent transition-all group-hover:ring-brand sm:size-24">
                {c.image_url ? (
                  <Image src={c.image_url} alt="" fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <span className="flex h-full items-center justify-center font-slab text-2xl font-bold text-brand/70">
                    {c.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium leading-tight text-ink group-hover:text-brand">
                {c.name}
                <span className="block text-[11px] font-normal text-ink/60">{c.department === "kids" ? "Kids" : "Ladies"}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
