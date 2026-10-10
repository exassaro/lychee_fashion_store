import { Clock, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GENERAL_QUERY_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import type { Settings } from "@/lib/types";

export function isSafeMapEmbed(url: string | null): url is string {
  return Boolean(url && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(url));
}

export function MapEmbed({ settings, className }: { settings: Settings; className?: string }) {
  if (!isSafeMapEmbed(settings.maps_embed_url)) return null;
  return (
    <div className={className}>
      <iframe
        src={settings.maps_embed_url}
        title={`${settings.store_name} on Google Maps`}
        className="h-full min-h-72 w-full rounded-xl border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

export function ContactButtons({ settings, whatsappNumber }: { settings: Settings; whatsappNumber: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {whatsappNumber && (
        <Button asChild variant="whatsapp" size="lg" className="flex-1 [&_svg]:size-5">
          <a href={whatsappLink(whatsappNumber, GENERAL_QUERY_MESSAGE)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </Button>
      )}
      {settings.phone && (
        <Button asChild variant="outline" size="lg" className="flex-1 [&_svg]:size-5">
          <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>
            <Phone /> Call {settings.phone}
          </a>
        </Button>
      )}
    </div>
  );
}

export function StoreDetails({ settings }: { settings: Settings }) {
  return (
    <dl className="space-y-5">
      {settings.address && (
        <div className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <MapPin className="size-5" />
          </span>
          <div>
            <dt className="text-sm font-bold uppercase tracking-wider">Address</dt>
            <dd className="mt-1 text-ink/80">{settings.address}</dd>
            {settings.maps_url && (
              <dd>
                <a href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand hover:underline">
                  Open in Google Maps →
                </a>
              </dd>
            )}
          </div>
        </div>
      )}
      {settings.opening_hours && (
        <div className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Clock className="size-5" />
          </span>
          <div>
            <dt className="text-sm font-bold uppercase tracking-wider">Opening hours</dt>
            <dd className="mt-1 whitespace-pre-line text-ink/80">{settings.opening_hours}</dd>
          </div>
        </div>
      )}
      {settings.phone && (
        <div className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Phone className="size-5" />
          </span>
          <div>
            <dt className="text-sm font-bold uppercase tracking-wider">Phone</dt>
            <dd className="mt-1 text-ink/80">
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand">{settings.phone}</a>
            </dd>
          </div>
        </div>
      )}
    </dl>
  );
}
