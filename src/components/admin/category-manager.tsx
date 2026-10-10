"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderTree, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SingleImagePicker } from "@/components/admin/image-manager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteCategory, saveCategory } from "@/lib/actions/categories";
import { DEPARTMENTS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { categorySchema, type CategoryFormValues } from "@/lib/validations";
import type { Department } from "@/lib/supabase/database.types";
import type { Category } from "@/lib/types";

type CategoryWithCount = Category & { product_count: number };

function CategoryDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: CategoryFormValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    values: initial,
  });
  const name = watch("name");

  const submit = handleSubmit((values) =>
    startTransition(async () => {
      const res = await saveCategory(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success(values.id ? "Category updated" : "Category added");
      onOpenChange(false);
      router.refresh();
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial.id ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            Under {initial.department === "kids" ? "Kids" : "Ladies"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name *</Label>
            <Input id="cat-name" {...register("name")} placeholder="e.g. Frocks" />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" {...register("slug")} placeholder={slugify(name || "") || "auto"} autoCapitalize="none" />
              {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Order</Label>
              <Input id="cat-order" type="number" inputMode="numeric" min={0} {...register("sort_order", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Image (optional)</Label>
            <Controller
              control={control}
              name="image"
              render={({ field }) => <SingleImagePicker value={field.value} onChange={field.onChange} folder="categories" />}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryManager({ categories }: { categories: CategoryWithCount[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryFormValues | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithCount | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew(department: Department) {
    const max = Math.max(0, ...categories.filter((c) => c.department === department).map((c) => c.sort_order));
    setEditing({ id: null, department, name: "", slug: "", sort_order: max + 1, image: null });
  }

  function openEdit(c: Category) {
    setEditing({
      id: c.id,
      department: c.department,
      name: c.name,
      slug: c.slug,
      sort_order: c.sort_order,
      image: c.image_url && c.image_path ? { url: c.image_url, path: c.image_path } : null,
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deleteCategory(deleting.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success(`Deleted “${deleting.name}”`);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {DEPARTMENTS.map((dept) => {
        const list = categories.filter((c) => c.department === dept.value);
        return (
          <section key={dept.value} className="rounded-xl border bg-white shadow-sm">
            <header className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg">{dept.label}</h2>
              <Button size="sm" onClick={() => openNew(dept.value)}>
                <Plus /> Add
              </Button>
            </header>
            {list.length ? (
              <ul className="divide-y">
                {list.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist">
                      {c.image_url ? (
                        <Image src={c.image_url} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <FolderTree className="size-5 text-ink/40" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-ink/60">
                        /{c.slug} · {c.product_count} {c.product_count === 1 ? "product" : "products"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDeleting(c)}
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-center text-sm text-ink/60">No subcategories yet.</p>
            )}
          </section>
        );
      })}

      {editing && <CategoryDialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)} initial={editing} />}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.product_count
                ? `${deleting.product_count} product(s) use this category. They will be kept, but without a subcategory.`
                : "This category has no products."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {pending && <Loader2 className="animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
