import { SITE_URL } from "@/lib/env";
import type { ProductDetail, Settings } from "@/lib/types";

export function storeJsonLd(settings: Settings) {
  const sameAs = [settings.instagram_url, settings.facebook_url].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE_URL}/#store`,
    name: settings.store_name,
    description: settings.tagline,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: settings.hero_image_url ?? `${SITE_URL}/logo.png`,
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    ...(settings.address && {
      address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "IN" },
    }),
    ...(settings.maps_url && { hasMap: settings.maps_url }),
    ...(settings.opening_hours && { openingHours: settings.opening_hours.split("\n").filter(Boolean) }),
    ...(sameAs.length && { sameAs }),
    priceRange: "₹₹",
    currenciesAccepted: "INR",
  };
}

export function productJsonLd(product: ProductDetail, url: string) {
  const inStock = product.sizes.some((s) => s.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.product_code,
    productID: product.product_code,
    description: product.description ?? product.name,
    image: product.images.map((i) => i.url),
    url,
    brand: { "@type": "Brand", name: "LYCHEE" },
    ...(product.colour && { color: product.colour }),
    ...(product.fabric && { material: product.fabric }),
    ...(product.category && { category: product.category.name }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: Number(product.price).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#store` },
    },
  };
}
