/**
 * Seeds ~12 sample products (6 kids, 6 ladies) with placeholder photos.
 *   npm run seed
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY,
 * and supabase/schema.sql already applied. Safe to re-run: existing products (by name) are skipped.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database, Department } from "../src/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = "product-images";

type Seed = {
  name: string;
  department: Department;
  category: string;
  price: number;
  mrp?: number;
  colour: string;
  fabric: string;
  age_group?: string;
  description: string;
  featured?: boolean;
  tags: string[];
  sizes: [string, number][];
};

const PRODUCTS: Seed[] = [
  {
    name: "Pink Floral Cotton Frock",
    department: "kids",
    category: "frocks",
    price: 649,
    mrp: 899,
    colour: "Baby pink",
    fabric: "100% cotton",
    age_group: "1–6 years",
    description: "A soft, breathable cotton frock with a sweet floral print and flutter sleeves. Perfect for birthdays and everyday play.",
    featured: true,
    tags: ["cotton", "party", "summer"],
    sizes: [["1-2Y", 4], ["2-3Y", 2], ["3-4Y", 0], ["4-5Y", 5], ["5-6Y", 1]],
  },
  {
    name: "Yellow Smocked Party Frock",
    department: "kids",
    category: "frocks",
    price: 899,
    mrp: 1199,
    colour: "Mustard yellow",
    fabric: "Cotton blend with net layer",
    age_group: "2–7 years",
    description: "Hand-smocked bodice with a twirl-ready layered skirt. Comes with a matching hair clip.",
    featured: true,
    tags: ["party", "festive"],
    sizes: [["2-3Y", 3], ["3-4Y", 3], ["4-5Y", 2], ["5-6Y", 0], ["6-7Y", 2]],
  },
  {
    name: "Boys Printed T-Shirt & Shorts Set",
    department: "kids",
    category: "sets",
    price: 549,
    colour: "Navy & white",
    fabric: "Cotton jersey",
    age_group: "1–8 years",
    description: "Comfy everyday co-ord set with a fun dino print tee and elastic-waist shorts.",
    tags: ["cotton", "everyday", "boys"],
    sizes: [["1-2Y", 6], ["2-3Y", 5], ["3-4Y", 4], ["4-5Y", 3], ["6-7Y", 2], ["8-9Y", 1]],
  },
  {
    name: "Girls Rainbow Top",
    department: "kids",
    category: "tops",
    price: 349,
    mrp: 449,
    colour: "Multicolour",
    fabric: "Cotton",
    age_group: "3–11 years",
    description: "Bright rainbow-stripe top with puff sleeves. Pairs well with jeans or skirts.",
    tags: ["everyday", "girls"],
    sizes: [["3-4Y", 3], ["4-5Y", 4], ["6-7Y", 2], ["8-9Y", 2], ["10-11Y", 1]],
  },
  {
    name: "Baby Cotton Romper Set",
    department: "kids",
    category: "sets",
    price: 449,
    colour: "Mint green",
    fabric: "Organic cotton",
    age_group: "0–2 years",
    description: "Gentle-on-skin romper with snap buttons for easy changes. Includes a matching cap.",
    featured: true,
    tags: ["newborn", "cotton"],
    sizes: [["0-6M", 5], ["6-12M", 4], ["1-2Y", 2]],
  },
  {
    name: "Kids Cartoon Print Night Suit",
    department: "kids",
    category: "nightwear",
    price: 499,
    mrp: 599,
    colour: "Sky blue",
    fabric: "Soft cotton hosiery",
    age_group: "2–13 years",
    description: "Full-sleeve night suit with a cute cartoon print. Soft, stretchy and cosy for bedtime.",
    tags: ["nightwear", "cotton"],
    sizes: [["2-3Y", 3], ["4-5Y", 3], ["6-7Y", 2], ["8-9Y", 0], ["10-11Y", 2], ["12-13Y", 1]],
  },
  {
    name: "Indigo Block Print A-Line Kurti",
    department: "ladies",
    category: "kurtis",
    price: 799,
    mrp: 1099,
    colour: "Indigo blue",
    fabric: "Pure cotton",
    description: "Hand block-printed A-line kurti with a mandarin collar and three-quarter sleeves. Ideal for office and casual wear.",
    featured: true,
    tags: ["cotton", "office", "block-print"],
    sizes: [["S", 2], ["M", 4], ["L", 5], ["XL", 3], ["XXL", 1]],
  },
  {
    name: "Maroon Embroidered Straight Kurti",
    department: "ladies",
    category: "kurtis",
    price: 1199,
    mrp: 1499,
    colour: "Maroon",
    fabric: "Rayon",
    description: "Elegant straight-cut kurti with delicate thread embroidery on the yoke. Great for festive occasions.",
    featured: true,
    tags: ["festive", "embroidered", "rayon"],
    sizes: [["M", 3], ["L", 2], ["XL", 2], ["XXL", 0], ["3XL", 1]],
  },
  {
    name: "Pastel Peplum Top",
    department: "ladies",
    category: "tops",
    price: 599,
    colour: "Peach",
    fabric: "Georgette",
    description: "Flattering peplum top with a soft drape. Dress it up with heels or down with flats.",
    tags: ["western", "party"],
    sizes: [["XS", 1], ["S", 3], ["M", 4], ["L", 3], ["XL", 2]],
  },
  {
    name: "Floral Kurti Palazzo Set",
    department: "ladies",
    category: "sets",
    price: 1499,
    mrp: 1999,
    colour: "Off-white & pink",
    fabric: "Cotton blend",
    description: "Ready-to-wear floral kurti with matching palazzo pants and a light dupatta.",
    featured: true,
    tags: ["set", "festive", "cotton"],
    sizes: [["S", 2], ["M", 3], ["L", 3], ["XL", 2], ["XXL", 2]],
  },
  {
    name: "Cotton Printed Nighty",
    department: "ladies",
    category: "nightwear",
    price: 449,
    colour: "Lavender",
    fabric: "Soft cotton",
    description: "Comfortable full-length cotton nighty with a front zip and pocket. Free size fits most.",
    tags: ["nightwear", "cotton"],
    sizes: [["Free Size", 8]],
  },
  {
    name: "Satin Night Suit Set",
    department: "ladies",
    category: "nightwear",
    price: 899,
    mrp: 1199,
    colour: "Wine",
    fabric: "Satin",
    description: "Silky button-down shirt and pyjama set with contrast piping. Lightweight and luxurious.",
    tags: ["nightwear", "satin"],
    sizes: [["S", 0], ["M", 2], ["L", 1], ["XL", 0]],
  },
];

async function uploadPlaceholder(seed: string, n: number) {
  // Picsum returns a random (non-clothing) photo for each seed — swap for real product photos in the admin.
  const res = await fetch(`https://picsum.photos/seed/${seed}-${n}/900/1200.jpg`);
  if (!res.ok) throw new Error(`Placeholder download failed (${res.status})`);
  const body = Buffer.from(await res.arrayBuffer());
  const path = `products/seed-${seed}-${n}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return { path, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

async function main() {
  const { data: categories, error: catError } = await supabase.from("categories").select("id, department, slug");
  if (catError) throw new Error(`Could not read categories — did you run supabase/schema.sql? ${catError.message}`);
  const catId = (dept: Department, slug: string) => categories.find((c) => c.department === dept && c.slug === slug)?.id ?? null;

  let created = 0;
  for (const p of PRODUCTS) {
    const { data: existing } = await supabase.from("products").select("id").eq("name", p.name).maybeSingle();
    if (existing) {
      console.log(`• skip (exists): ${p.name}`);
      continue;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: p.name,
        department: p.department,
        category_id: catId(p.department, p.category),
        price: p.price,
        mrp: p.mrp ?? null,
        colour: p.colour,
        fabric: p.fabric,
        age_group: p.age_group ?? null,
        description: p.description,
        is_featured: p.featured ?? false,
        tags: p.tags,
      })
      .select("id, slug, product_code")
      .single();
    if (error) throw new Error(`${p.name}: ${error.message}`);

    const { error: sizeError } = await supabase
      .from("product_sizes")
      .insert(p.sizes.map(([size, stock], i) => ({ product_id: product.id, size, stock, sort_order: i })));
    if (sizeError) throw new Error(`${p.name} sizes: ${sizeError.message}`);

    const images = [];
    for (let n = 1; n <= 2; n++) {
      try {
        images.push(await uploadPlaceholder(product.slug, n));
      } catch (e) {
        console.warn(`  ! image ${n} for ${p.name}: ${(e as Error).message}`);
      }
    }
    if (images.length) {
      const { error: imgError } = await supabase.from("product_images").insert(
        images.map((img, i) => ({
          product_id: product.id,
          storage_path: img.path,
          url: img.url,
          alt: i === 0 ? p.name : `${p.name} — view ${i + 1}`,
          sort_order: i,
        })),
      );
      if (imgError) throw new Error(`${p.name} images: ${imgError.message}`);
    }

    created++;
    console.log(`✓ ${product.product_code}  ${p.name}`);
  }

  // Fill the WhatsApp number in settings from env if it's still empty.
  const wa = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (wa) {
    await supabase.from("settings").update({ whatsapp_number: wa }).eq("id", 1).is("whatsapp_number", null);
  }

  console.log(`\nDone. Created ${created} product(s).`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
