"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageManager } from "@/components/admin/image-manager";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveProduct } from "@/lib/actions/products";
import { SIZE_PRESETS } from "@/lib/constants";
import { cn, discountPercent, slugify } from "@/lib/utils";
import { productSchema, type ProductFormValues } from "@/lib/validations";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  initial?: ProductFormValues & { id: string; product_code: string };
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  department: "kids",
  category_id: null,
  description: "",
  fabric: "",
  colour: "",
  age_group: "",
  price: NaN,
  mrp: null,
  tags: "",
  is_featured: false,
  is_visible: true,
  sizes: [],
  images: [],
};

const toNumberOrNull = (v: unknown) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-red-600">{message}</p> : null;
}

function Field({ label, htmlFor, hint, error, children, className }: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-ink/60">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

export function ProductForm({ categories, initial }: Props) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const isEdit = Boolean(initial);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? EMPTY,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form;
  const sizes = useFieldArray({ control, name: "sizes" });

  const department = watch("department");
  const name = watch("name");
  const price = watch("price");
  const mrp = watch("mrp");
  const currentSizes = watch("sizes");
  const deptCategories = categories.filter((c) => c.department === department);
  const presets = SIZE_PRESETS[department];
  const off = discountPercent(Number(price) || 0, mrp);

  function addPreset(size: string) {
    if (currentSizes.some((s) => s.size.toLowerCase() === size.toLowerCase())) return;
    sizes.append({ size, stock: 0 });
  }

  function addAllPresets() {
    const existing = new Set(currentSizes.map((s) => s.size.toLowerCase()));
    presets.filter((p) => !existing.has(p.toLowerCase())).forEach((size) => sizes.append({ size, stock: 0 }));
  }

  const onSubmit = handleSubmit(
    (values) => {
      startSaving(async () => {
        const res = await saveProduct(initial?.id ?? null, values);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success(`${isEdit ? "Saved" : "Created"} ${res.data.product_code}`);
        if (isEdit) router.refresh();
        else router.push("/admin/products");
      });
    },
    () => toast.error("Please fix the highlighted fields."),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Back to products">
            <Link href="/admin/products">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl sm:text-3xl">{isEdit ? "Edit product" : "New product"}</h1>
            <p className="font-mono text-sm text-ink/60">
              {initial?.product_code ?? `${department === "kids" ? "LY-K" : "LY-L"}-#### (assigned on save)`}
            </p>
          </div>
        </div>
        {initial && (
          <div className="hidden sm:block">
            <DeleteProductButton id={initial.id} name={initial.name} redirectTo="/admin/products" variant="full" />
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name *" htmlFor="name" error={errors.name?.message} className="sm:col-span-2">
                <Input id="name" {...register("name")} placeholder="e.g. Pink Floral Cotton Frock" />
              </Field>

              <Field label="Department *" htmlFor="department" error={errors.department?.message}>
                <NativeSelect
                  id="department"
                  {...register("department", {
                    onChange: () => setValue("category_id", null),
                  })}
                >
                  <option value="kids">Kids</option>
                  <option value="ladies">Ladies</option>
                </NativeSelect>
              </Field>

              <Field label="Subcategory" htmlFor="category_id" error={errors.category_id?.message}>
                <NativeSelect id="category_id" {...register("category_id", { setValueAs: (v) => v || null })}>
                  <option value="">— None —</option>
                  {deptCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>

              <Field label="Colour" htmlFor="colour" error={errors.colour?.message}>
                <Input id="colour" {...register("colour")} placeholder="e.g. Baby pink" />
              </Field>
              <Field label="Fabric" htmlFor="fabric" error={errors.fabric?.message}>
                <Input id="fabric" {...register("fabric")} placeholder="e.g. 100% cotton" />
              </Field>

              {department === "kids" && (
                <Field label="Age group" htmlFor="age_group" error={errors.age_group?.message} hint="Optional, e.g. 2–6 years">
                  <Input id="age_group" {...register("age_group")} placeholder="e.g. 2–6 years" />
                </Field>
              )}

              <Field label="Tags" htmlFor="tags" hint="Comma separated, e.g. cotton, party, summer" error={errors.tags?.message}>
                <Input id="tags" {...register("tags")} />
              </Field>

              <Field label="Description" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
                <Textarea id="description" rows={5} {...register("description")} placeholder="Fit, care instructions, occasion…" />
              </Field>

              <Field
                label="URL slug"
                htmlFor="slug"
                error={errors.slug?.message}
                className="sm:col-span-2"
                hint={
                  isEdit
                    ? "Changing this breaks links already shared on WhatsApp."
                    : `Leave empty to auto-generate: ${slugify(name || "product-name")}-${department === "kids" ? "k" : "l"}-####`
                }
              >
                <Input id="slug" {...register("slug")} placeholder="auto-generated" autoCapitalize="none" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sizes & stock</CardTitle>
              <CardDescription>Tap a size to add it, then set the quantity in stock.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => {
                  const added = currentSizes.some((s) => s.size.toLowerCase() === p.toLowerCase());
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => addPreset(p)}
                      disabled={added}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        added ? "border-brand/30 bg-brand-soft text-brand/60" : "hover:border-brand hover:text-brand",
                      )}
                    >
                      {added ? "✓ " : "+ "}
                      {p}
                    </button>
                  );
                })}
                <button type="button" onClick={addAllPresets} className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand hover:underline">
                  Add all
                </button>
              </div>

              {sizes.fields.length > 0 && (
                <ul className="space-y-2">
                  {sizes.fields.map((field, i) => (
                    <li key={field.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input {...register(`sizes.${i}.size`)} placeholder="Size" aria-label={`Size ${i + 1} label`} />
                        <FieldError message={errors.sizes?.[i]?.size?.message} />
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          {...register(`sizes.${i}.stock`, { valueAsNumber: true })}
                          aria-label={`Size ${i + 1} stock`}
                        />
                        <FieldError message={errors.sizes?.[i]?.stock?.message} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => sizes.remove(i)} aria-label="Remove size" className="text-red-600">
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <FieldError message={errors.sizes?.message ?? errors.sizes?.root?.message} />
              <Button type="button" variant="outline" size="sm" onClick={() => sizes.append({ size: "", stock: 0 })}>
                <Plus /> Custom size
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="images"
                render={({ field }) => <ImageManager value={field.value} onChange={field.onChange} />}
              />
              <FieldError message={errors.images?.message} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <Field label="Price (₹) *" htmlFor="price" error={errors.price?.message}>
                <Input id="price" type="number" inputMode="decimal" min={0} step="0.01" {...register("price", { valueAsNumber: true })} />
              </Field>
              <Field label="MRP (₹)" htmlFor="mrp" error={errors.mrp?.message} hint={off > 0 ? `Shows ${off}% off` : "Optional"}>
                <Input id="mrp" type="number" inputMode="decimal" min={0} step="0.01" {...register("mrp", { setValueAs: toNumberOrNull })} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="is_visible"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium">Visible in store</span>
                      <span className="text-xs text-ink/60">Hidden products are only seen by admins</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium">Featured</span>
                      <span className="text-xs text-ink/60">Show in the Featured row on the home page</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
            </CardContent>
          </Card>

          {initial && (
            <div className="sm:hidden">
              <DeleteProductButton id={initial.id} name={initial.name} redirectTo="/admin/products" variant="full" />
            </div>
          )}
        </div>
      </div>

      {/* Sticky save bar: sits above the mobile bottom nav */}
      <div className="sticky bottom-[72px] z-20 -mx-4 border-t bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:mx-0 lg:rounded-xl lg:border lg:shadow-card">
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving} className="min-w-32">
            {saving ? <Loader2 className="animate-spin" /> : <Save />} {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
