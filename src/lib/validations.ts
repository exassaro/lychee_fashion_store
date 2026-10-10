import { z } from "zod";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const optionalText = (max: number) => z.string().trim().max(max, `Max ${max} characters`);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Enter a full URL starting with https://");

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const imageRefSchema = z.object({
  path: z.string().min(1),
  url: z.url(),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120),
    slug: z
      .string()
      .trim()
      .max(140)
      .refine((v) => v === "" || SLUG_RE.test(v), "Use lowercase letters, numbers and dashes only"),
    department: z.enum(["kids", "ladies"], { error: "Choose Kids or Ladies" }),
    category_id: z.uuid().nullable(),
    description: optionalText(3000),
    fabric: optionalText(80),
    colour: optionalText(60),
    age_group: optionalText(40),
    price: z.number({ error: "Enter a price" }).min(0, "Price can't be negative").max(1_000_000),
    mrp: z.number({ error: "Enter a valid MRP" }).min(0).max(1_000_000).nullable(),
    tags: optionalText(300),
    is_featured: z.boolean(),
    is_visible: z.boolean(),
    sizes: z
      .array(
        z.object({
          size: z.string().trim().min(1, "Size label required").max(20),
          stock: z.number({ error: "Enter stock" }).int("Whole numbers only").min(0, "Min 0").max(9999),
        }),
      )
      .max(30, "Too many sizes"),
    images: z.array(imageRefSchema).max(12, "Max 12 images"),
  })
  .superRefine((v, ctx) => {
    if (v.mrp != null && v.mrp > 0 && v.mrp < v.price) {
      ctx.addIssue({ code: "custom", path: ["mrp"], message: "MRP must be greater than or equal to price" });
    }
    const seen = new Set<string>();
    v.sizes.forEach((s, i) => {
      const key = s.size.toLowerCase();
      if (seen.has(key)) ctx.addIssue({ code: "custom", path: ["sizes", i, "size"], message: "Duplicate size" });
      seen.add(key);
    });
  });

export type ProductFormValues = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  id: z.uuid().nullable(),
  department: z.enum(["kids", "ladies"]),
  name: z.string().trim().min(1, "Name is required").max(60),
  slug: z
    .string()
    .trim()
    .max(60)
    .refine((v) => v === "" || SLUG_RE.test(v), "Use lowercase letters, numbers and dashes only"),
  sort_order: z.number().int().min(0).max(999),
  image: imageRefSchema.nullable(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const settingsSchema = z.object({
  store_name: z.string().trim().min(1, "Required").max(60),
  tagline: z.string().trim().min(1, "Required").max(120),
  address: optionalText(300),
  opening_hours: optionalText(300),
  phone: optionalText(30),
  whatsapp_number: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9]{8,15}$/.test(v), "Digits only with country code, no + (e.g. 919876543210)"),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email"),
  instagram_url: optionalUrl,
  facebook_url: optionalUrl,
  maps_url: optionalUrl,
  maps_embed_url: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (v) => v === "" || /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(v),
      "Paste the src URL from Google Maps → Share → Embed a map (starts with https://www.google.com/maps/embed)",
    ),
  hero_title: optionalText(120),
  hero_subtitle: optionalText(300),
  about_text: optionalText(4000),
  hero_image: imageRefSchema.nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

/** "" → null for nullable text columns. */
export function nullIfEmpty(v: string | null | undefined) {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
}

export function parseTags(v: string) {
  return [...new Set(v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}
