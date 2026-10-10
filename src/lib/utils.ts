import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** "1,299" — pair with a ₹ symbol in the UI. */
export function formatPrice(value: number) {
  return inr.format(Number(value));
}

export function discountPercent(price: number, mrp: number | null | undefined) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function absoluteUrl(path: string, base: string) {
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
