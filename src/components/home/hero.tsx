import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LeafMotif } from "@/components/brand/leaf-motif";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/lib/types";

export function Hero({ settings }: { settings: Settings }) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient text-white">
      <LeafMotif className="absolute -left-10 -top-8 w-40 opacity-90 sm:w-56 lg:w-72" />
      <LeafMotif flip className="absolute -bottom-12 -right-10 w-24 rotate-180 opacity-80 sm:-bottom-10 sm:-right-8 sm:w-52 lg:w-64" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)", backgroundSize: "18px 18px" }}
        aria-hidden="true"
      />

      <div className="container relative grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <span className="size-1.5 rounded-full bg-leaf" /> {settings.tagline}
          </p>
          <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            {settings.hero_title || "Fresh styles for little ones & you"}
          </h1>
          {settings.hero_subtitle && (
            <p className="mt-5 max-w-md text-base text-white/90 sm:text-lg">{settings.hero_subtitle}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="white" size="lg" className="min-w-36">
              <Link href="/shop/kids">
                Shop Kids <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="min-w-36 border-2 border-white bg-transparent text-white hover:bg-white hover:text-brand"
            >
              <Link href="/shop/ladies">
                Shop Ladies <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        {settings.hero_image_url && (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white/20 lg:ml-auto">
            <Image
              src={settings.hero_image_url}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 448px, 90vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
