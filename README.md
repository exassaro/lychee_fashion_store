# LYCHEE — Fashion for Kids and Ladies

A showcase storefront for a readymade clothing store. Customers browse products and live stock online, then **order on WhatsApp**. There is no cart or online payment. The store owner manages products, stock, categories and store info from a phone-friendly admin panel.

**Stack:** Next.js 15 (App Router, TypeScript, Server Components) · Tailwind CSS + shadcn/ui · Supabase (Postgres, Storage, Auth) · Vercel

---

## Features

- **Storefront:** home (hero, category tiles, New Arrivals, Featured, trust strip), shop with shareable URL filters (category, size, price, in-stock only, sort, search by name or code), product pages with a swipeable zoom gallery and per-size stock, About, Contact, and a branded 404.
- **WhatsApp ordering:** after picking a size, the customer gets a pre-filled `wa.me` message with the product, code, size, colour, price, image link and page link. A floating WhatsApp button appears on every public page.
- **Admin (`/admin`):** Supabase email/password login, restricted to users in the `admins` table. Includes:
  - a dashboard
  - a products table with search, filters and inline +/- stock buttons
  - a product form with auto code and slug, size presets, and drag-to-reorder image upload that compresses to WebP in the browser
  - category management
  - store settings
- **Fast and fresh:** public pages are static (ISR). Every admin change calls `revalidateTag`/`revalidatePath`, so the site updates immediately.
- **SEO:** per-page metadata, Open Graph and Twitter cards (product og:image = first photo), JSON-LD (`ClothingStore` and `Product`), `sitemap.xml`, `robots.txt`, web manifest and app icons.

## Project structure

```
src/
  app/
    (store)/            Public pages: home, shop, shop/[department], product/[slug], about, contact
    admin/login/        Admin sign-in
    admin/(panel)/      Dashboard, products, categories, settings (guarded)
    og/                 Default Open Graph image (static PNG)
    sitemap.ts robots.ts manifest.ts not-found.tsx icon.png apple-icon.png
  components/
    ui/                 shadcn/ui primitives
    layout/ home/ shop/ product/ store/ admin/ brand/ seo/
  lib/
    supabase/           Typed clients (browser, server/session, public/cached, middleware) + DB types
    actions/            Server actions (auth, products, categories, settings) + revalidation
    data.ts             Cached public queries (unstable_cache + tags)
    validations.ts      Zod schemas shared by forms and server actions
    whatsapp.ts seo.ts upload.ts shop-params.ts constants.ts
  middleware.ts         Protects /admin/*
supabase/schema.sql     Tables, triggers, view, RLS policies, storage bucket, default data
scripts/                seed.ts, create-admin.ts, generate-icons.mjs
```

---

## 1. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com). Pick the region closest to your customers (e.g. Mumbai).
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. The file can be run again safely. It creates:
   - tables `products`, `product_images`, `product_sizes`, `categories`, `settings`, `admins`
   - triggers that generate product codes (`LY-K-0001` / `LY-L-0001`) and slugs
   - the `product_cards` listing view and the `adjust_stock()` function
   - **RLS policies:** the public can only read visible products, categories and settings. Only admins can write.
   - the **`product-images` storage bucket:** files are publicly readable by URL, and only admins can upload or delete them
   - default settings and categories (Frocks, Tops, Sets, Nightwear, Kurtis)
3. **Disable public sign-ups:** go to **Authentication → Sign In / Providers**, turn off **Allow new users to sign up**, and keep **Email** enabled.
4. Copy your keys from **Project Settings → API**: the Project URL, the `anon` public key and the `service_role` key.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill it in:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, e.g. `https://abcd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key. Safe in the browser because RLS protects the data. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only secret.** Used only by the seed and create-admin scripts. Never prefix it with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Orders number, digits only with country code, no `+` (e.g. `919876543210`). Used as a fallback when Admin → Settings has no number. |
| `NEXT_PUBLIC_SITE_URL` | Public URL, no trailing slash (e.g. `https://lychee.vercel.app`). Used for SEO and the product links in WhatsApp messages. |

## 3. Run locally

```bash
npm install
npm run dev            # http://localhost:3000
```

## 4. Create the first admin

**Option A: script (recommended)**

```bash
npm run create-admin -- owner@example.com "a-strong-password"
```

This creates a confirmed auth user and adds them to `admins`. If the user already exists, the script only adds them to `admins`.

**Option B: dashboard and SQL**

1. **Authentication → Users → Add user → Create new user**. Enter an email and password, and tick *Auto confirm user*.
2. In the SQL Editor, run:
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'owner@example.com';
   ```

Then sign in at **`/admin/login`**.

## 5. Seed sample products (optional)

```bash
npm run seed
```

This adds 12 sample products (6 kids, 6 ladies) with sizes, stock levels (including low and out-of-stock sizes) and 2 placeholder photos each from picsum.photos, uploaded into your storage bucket. Products that already exist are skipped. Replace the photos with real ones from the admin, or delete the sample products.

## 6. Logo and icons

Put the real logo at `public/logo.png`. If you have a square fruit-only mark, also add `public/logo-mark.png`. Then regenerate the favicon and app icons:

```bash
npm run icons
```

The `public/logo.png` in the repo is a generated placeholder. Delete it and run `npm run icons` to regenerate it.

---

## Deploy to Vercel (free tier)

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com), click **Add New → Project** and import the repo. The framework preset is detected as Next.js.
3. Under **Environment Variables**, add the four `NEXT_PUBLIC_*` variables from the table above. Set `NEXT_PUBLIC_SITE_URL` to your Vercel or custom domain. `SUPABASE_SERVICE_ROLE_KEY` is **not** needed on Vercel (only the local scripts use it), so keep it off the server.
4. Click **Deploy**.
5. In Supabase, go to **Authentication → URL Configuration** and set **Site URL** to your production URL.
6. If you later add a custom domain, update `NEXT_PUBLIC_SITE_URL` in Vercel and redeploy.

Notes:
- Nothing is written to local disk at runtime. Images go straight from the admin's browser to Supabase Storage, and data lives in Postgres.
- Images are resized to 1200px WebP before upload (JPEG fallback on Safari), which keeps storage and bandwidth low. Vercel's free tier has a monthly image-optimisation quota. If the catalogue grows very large and you hit it, set `images.unoptimized: true` in `next.config.ts`; the uploaded files are already optimised.
- Supabase free projects pause after a week with no activity. Normal store traffic keeps the project active.

## How content updates work

Public pages are statically generated and cached, with a 1-hour fallback. Every admin action (save or delete product, stock +/-, show/hide, categories, settings) calls `revalidateTag` for `products`, `categories` or `settings`, plus `revalidatePath` for the affected product page. Visitors see changes on their next page load, and pages stay as fast as static files.

## WhatsApp message format

```
Hi LYCHEE! I'd like to order:
🛍️ Product: Pink Floral Cotton Frock
🔖 Code: LY-K-0001
📏 Size: 2-3Y
🎨 Colour: Baby pink
💰 Price: ₹649
🖼️ Image: https://….supabase.co/storage/v1/object/public/product-images/products/….webp
🔗 Link: https://your-site/product/pink-floral-cotton-frock-k-0001
```

WhatsApp builds a link preview from the product page's Open Graph tags, so the customer and the store both see the product photo.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run seed` | Insert sample products |
| `npm run create-admin -- <email> "<password>"` | Create or promote an admin |
| `npm run icons` | Regenerate favicon and app icons from `public/logo.png` |

## Security model

- All writes go through server actions that use the **signed-in admin's session**. RLS (`is_admin()`) enforces access in the database, so even a forged request can't write without an `admins` row.
- `middleware.ts` blocks `/admin/*` for anyone not in `admins`, and every admin page and server action checks again.
- The service-role key is only used by the local scripts and is never bundled into the app.
- Storage: anyone can read an image by its URL, but listing, uploading and deleting files are admin-only.
