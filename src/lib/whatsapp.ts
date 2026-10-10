import { ENV_WHATSAPP_NUMBER } from "@/lib/env";
import { formatPrice } from "@/lib/utils";

export function resolveWhatsAppNumber(fromSettings?: string | null) {
  return (fromSettings ?? "").replace(/\D/g, "") || ENV_WHATSAPP_NUMBER;
}

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export type OrderMessageInput = {
  name: string;
  productCode: string;
  size: string;
  colour?: string | null;
  price: number;
  imageUrl?: string | null;
  productUrl: string;
};

export function buildOrderMessage(p: OrderMessageInput) {
  const lines = [
    "Hi LYCHEE! I'd like to order:",
    `🛍️ Product: ${p.name}`,
    `🔖 Code: ${p.productCode}`,
    `📏 Size: ${p.size}`,
    p.colour ? `🎨 Colour: ${p.colour}` : null,
    `💰 Price: ₹${formatPrice(p.price)}`,
    p.imageUrl ? `🖼️ Image: ${p.imageUrl}` : null,
    `🔗 Link: ${p.productUrl}`,
  ];
  return lines.filter(Boolean).join("\n");
}

export const GENERAL_QUERY_MESSAGE = "Hi, I have a query";
