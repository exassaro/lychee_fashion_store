import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, images:product_images(storage_path, url, sort_order), sizes:product_sizes(size, stock, sort_order)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("*").order("sort_order").order("name"),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      key={product.updated_at}
      categories={categories ?? []}
      initial={{
        id: product.id,
        product_code: product.product_code,
        name: product.name,
        slug: product.slug,
        department: product.department,
        category_id: product.category_id,
        description: product.description ?? "",
        fabric: product.fabric ?? "",
        colour: product.colour ?? "",
        age_group: product.age_group ?? "",
        price: Number(product.price),
        mrp: product.mrp != null ? Number(product.mrp) : null,
        tags: product.tags.join(", "),
        is_featured: product.is_featured,
        is_visible: product.is_visible,
        sizes: [...product.sizes].sort((a, b) => a.sort_order - b.sort_order).map(({ size, stock }) => ({ size, stock })),
        images: [...product.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ path: i.storage_path, url: i.url })),
      }}
    />
  );
}
