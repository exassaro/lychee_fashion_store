import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles, Store } from "lucide-react";
import { LeafMotif } from "@/components/brand/leaf-motif";
import { ContactButtons, MapEmbed, StoreDetails } from "@/components/store/store-info";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/data";
import { resolveWhatsAppNumber } from "@/lib/whatsapp";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Us",
  description: "LYCHEE is a family-run readymade clothing store for kids and ladies with fresh stock every week.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Sparkles, title: "Fresh every week", text: "New arrivals handpicked weekly so there's always something new." },
  { icon: Heart, title: "Comfort first", text: "Soft, breathable fabrics that kids and mums love wearing all day." },
  { icon: Store, title: "Local & friendly", text: "A neighbourhood store — visit us, try on, and get honest advice." },
];

export default async function AboutPage() {
  const settings = await getSettings();
  const whatsappNumber = resolveWhatsAppNumber(settings.whatsapp_number);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <LeafMotif className="absolute -right-8 -top-8 w-40 opacity-80 sm:w-56" flip />
        <div className="container relative py-14 sm:py-20">
          <h1 className="text-4xl sm:text-5xl">About {settings.store_name}</h1>
          <p className="mt-3 text-lg text-white/90">{settings.tagline}</p>
        </div>
      </section>

      <section className="container grid gap-10 py-12 sm:py-16 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="section-title mb-4">Our story</h2>
          <p className="whitespace-pre-line text-[17px] leading-relaxed text-ink/80">
            {settings.about_text ||
              "LYCHEE is a readymade clothing store for kids and ladies. We bring comfortable, colourful and affordable fashion, with fresh stock every week."}
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/shop">Browse the collection</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:col-span-2">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-xl bg-mist p-5">
              <Icon className="size-6 shrink-0 text-brand" />
              <div>
                <h3 className="font-sans text-base font-semibold">{title}</h3>
                <p className="text-sm text-ink/70">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container grid gap-10 pb-6 lg:grid-cols-2">
        <div className="space-y-8">
          <h2 className="section-title">Visit our store</h2>
          <StoreDetails settings={settings} />
          <ContactButtons settings={settings} whatsappNumber={whatsappNumber} />
        </div>
        <MapEmbed settings={settings} className="h-80 lg:h-full" />
      </section>
    </>
  );
}
