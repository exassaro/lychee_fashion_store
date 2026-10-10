import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Ruler, Shirt, Store, Tag } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { OrderPanel } from "@/components/product/order-panel";
import { Price } from "@/components/product/price";
import { ProductRow } from "@/components/product/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { productJsonLd } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { resolveWhatsAppNumber } from "@/lib/whatsapp";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.slice(0, 200).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const description =
    (product.description?.slice(0, 150) ||
      `${product.name} — ${product.department === "kids" ? "kids" : "ladies"} ${product.category?.name ?? "wear"} at LYCHEE.`) +
    ` ₹${formatPrice(product.price)}. Order on WhatsApp.`;
  const cover = product.images[0]?.url;
  const url = `/product/${product.slug}`;

  return {
    title: `${product.name} (${product.product_code})`,
    description,
    alternates: { canonical: url },
    // Child openGraph replaces the parent's, so repeat siteName/locale here.
    openGraph: {
      type: "website",
      siteName: "LYCHEE",
      locale: "en_IN",
      url,
      title: `${product.name} — ₹${formatPrice(product.price)}`,
      description,
      images: cover ? [{ url: cover, alt: product.name }] : ["/og"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ₹${formatPrice(product.price)}`,
      description,
      images: cover ? [cover] : ["/og"],
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "INR",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([getSettings(), getRelatedProducts(product)]);
  const whatsappNumber = resolveWhatsAppNumber(settings.whatsapp_number);
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const inStock = product.sizes.some((s) => s.stock > 0);
  const deptLabel = product.department === "kids" ? "Kids" : "Ladies";

  const details = [
    { icon: Shirt, label: "Fabric", value: product.fabric },
    { icon: Tag, label: "Colour", value: product.colour },
    { icon: Ruler, label: "Age group", value: product.department === "kids" ? product.age_group : null },
  ].filter((d) => d.value);

  return (
    <>
      <JsonLd data={productJsonLd(product, productUrl)} />
      <div className="container py-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-ink/60">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span>/</span>
          <Link href={`/shop/${product.department}`} className="hover:text-brand">{deptLabel}</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/shop/${product.department}?category=${product.category.slug}`} className="hover:text-brand">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="line-clamp-1 text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="muted">{deptLabel}{product.category ? ` · ${product.category.name}` : ""}</Badge>
              {inStock ? <Badge variant="leaf">In stock</Badge> : <Badge variant="destructive">Out of stock</Badge>}
            </div>
            <h1 className="text-2xl leading-tight sm:text-3xl lg:text-4xl">{product.name}</h1>
            <p className="mt-2 text-sm text-ink/60">
              Product code: <span className="font-mono font-semibold text-ink">{product.product_code}</span>
            </p>

            <Price price={product.price} mrp={product.mrp} size="lg" className="mt-5" />
            <p className="mt-1 text-xs text-ink/60">Inclusive of all taxes</p>

            <div className="my-6 h-px bg-border" />

            <OrderPanel
              whatsappNumber={whatsappNumber}
              sizes={product.sizes.map(({ id, size, stock }) => ({ id, size, stock }))}
              product={{
                name: product.name,
                productCode: product.product_code,
                colour: product.colour,
                price: product.price,
                imageUrl: product.images[0]?.url ?? null,
                productUrl,
              }}
            />

            <ul className="mt-6 grid gap-3 rounded-xl bg-mist p-4 text-sm text-ink/80">
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-brand" />
                Tap order — we&apos;ll confirm availability & delivery on WhatsApp.
              </li>
              <li className="flex items-start gap-3">
                <Store className="mt-0.5 size-4 shrink-0 text-brand" />
                Prefer to try it on? <Link href="/contact" className="font-semibold text-brand hover:underline">Visit our store</Link>
              </li>
            </ul>

            {(details.length > 0 || product.description) && (
              <section className="mt-8" aria-labelledby="details-heading">
                <h2 id="details-heading" className="mb-4 text-xl">Product details</h2>
                {details.length > 0 && (
                  <dl className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {details.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-lg border p-3">
                        <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink/60">
                          <Icon className="size-3.5" /> {label}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {product.description && (
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/80">{product.description}</p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container py-10 sm:py-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title mb-6">You may also like</h2>
          <ProductRow products={related} />
        </section>
      )}
    </>
  );
}
