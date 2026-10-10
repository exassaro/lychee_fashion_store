import { Sparkles, Store } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";

const ITEMS = [
  { icon: WhatsAppIcon, title: "Order easily on WhatsApp", text: "Pick a size, tap order — we confirm on chat." },
  { icon: Store, title: "Visit our store", text: "Try before you buy at our shop." },
  { icon: Sparkles, title: "Fresh stock weekly", text: "New styles land every week." },
];

export function TrustStrip() {
  return (
    <section className="bg-mist" aria-label="Why shop with LYCHEE">
      <div className="container grid gap-6 py-10 sm:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
              <Icon className="size-6" />
            </span>
            <div>
              <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
              <p className="text-sm text-ink/70">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
