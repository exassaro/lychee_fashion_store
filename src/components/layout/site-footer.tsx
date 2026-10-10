import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { NAV_LINKS } from "@/lib/constants";
import { GENERAL_QUERY_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import type { Category, Settings } from "@/lib/types";

export function SiteFooter({
  settings,
  whatsappNumber,
  categories,
}: {
  settings: Settings;
  whatsappNumber: string;
  categories: Category[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-mist">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo className="h-12" />
          <p className="max-w-xs text-sm text-ink/70">{settings.tagline}. Browse online, order easily on WhatsApp.</p>
          <div className="flex gap-2">
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LYCHEE on Instagram"
                className="rounded-full bg-white p-2.5 text-ink shadow-sm transition-colors hover:text-brand"
              >
                <InstagramIcon className="size-5" />
              </a>
            )}
            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LYCHEE on Facebook"
                className="rounded-full bg-white p-2.5 text-ink shadow-sm transition-colors hover:text-brand"
              >
                <FacebookIcon className="size-5" />
              </a>
            )}
            {whatsappNumber && (
              <a
                href={whatsappLink(whatsappNumber, GENERAL_QUERY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LYCHEE on WhatsApp"
                className="rounded-full bg-white p-2.5 text-[#128C4A] shadow-sm transition-colors hover:bg-leaf-soft"
              >
                <WhatsAppIcon className="size-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-ink">Shop</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-ink/70 hover:text-brand" href="/shop/kids">Kids</Link></li>
            <li><Link className="text-ink/70 hover:text-brand" href="/shop/ladies">Ladies</Link></li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link className="text-ink/70 hover:text-brand" href={`/shop/${c.department}?category=${c.slug}`}>
                  {c.department === "kids" ? "Kids" : "Ladies"} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-ink">Information</h2>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.filter((l) => !["/", "/shop/kids", "/shop/ladies"].includes(l.href)).map((l) => (
              <li key={l.href}>
                <Link className="text-ink/70 hover:text-brand" href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-ink">Visit our store</h2>
          <ul className="space-y-3 text-sm text-ink/70">
            {settings.address && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>
                  {settings.address}
                  {settings.maps_url && (
                    <>
                      {" "}
                      <a href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline-offset-2 hover:underline">
                        Get directions
                      </a>
                    </>
                  )}
                </span>
              </li>
            )}
            {settings.opening_hours && (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="whitespace-pre-line">{settings.opening_hours}</span>
              </li>
            )}
            {settings.phone && (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand">
                  {settings.phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink/60 sm:flex-row">
          <p>© {year} {settings.store_name}. All rights reserved.</p>
          <p>{settings.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
