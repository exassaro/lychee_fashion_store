import type { Metadata } from "next";
import { ContactButtons, MapEmbed, StoreDetails } from "@/components/store/store-info";
import { getSettings } from "@/lib/data";
import { resolveWhatsAppNumber } from "@/lib/whatsapp";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Visit the LYCHEE store or reach us on WhatsApp and phone. Address, opening hours and directions.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsappNumber = resolveWhatsAppNumber(settings.whatsapp_number);

  return (
    <div className="container py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Contact us</h1>
        <p className="mt-2 text-ink/70">
          Questions about a size, colour or new stock? Message us on WhatsApp — we usually reply within minutes during store hours.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <ContactButtons settings={settings} whatsappNumber={whatsappNumber} />
          <StoreDetails settings={settings} />
        </div>
        <MapEmbed settings={settings} className="h-80 lg:h-full" />
      </div>
    </div>
  );
}
