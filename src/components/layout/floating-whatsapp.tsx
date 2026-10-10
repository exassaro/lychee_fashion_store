import { WhatsAppIcon } from "@/components/icons";
import { GENERAL_QUERY_MESSAGE, whatsappLink } from "@/lib/whatsapp";

export function FloatingWhatsApp({ number }: { number: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number, GENERAL_QUERY_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with LYCHEE on WhatsApp"
      className="group fixed bottom-5 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_6px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-whatsapp/40 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-20 motion-reduce:hidden" />
      <WhatsAppIcon className="relative size-7" />
    </a>
  );
}
