import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { getCategories, getSettings } from "@/lib/data";
import { resolveWhatsAppNumber } from "@/lib/whatsapp";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const whatsappNumber = resolveWhatsAppNumber(settings.whatsapp_number);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader whatsappNumber={whatsappNumber} tagline={settings.tagline} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} whatsappNumber={whatsappNumber} categories={categories} />
      <FloatingWhatsApp number={whatsappNumber} />
    </div>
  );
}
