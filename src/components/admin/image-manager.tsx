"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { compressAndUpload, type UploadedImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

type Props = {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
  folder?: "products" | "categories" | "site";
};

function SortableThumb({
  image,
  index,
  count,
  onRemove,
  onMove,
}: {
  image: UploadedImage;
  index: number;
  count: number;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.path });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-[3/4] overflow-hidden rounded-lg border-2 bg-mist",
        index === 0 ? "border-brand" : "border-transparent",
        isDragging && "z-10 opacity-80 shadow-xl",
      )}
    >
      <Image src={image.url} alt="" fill sizes="160px" className="object-cover" />
      {index === 0 && (
        <span className="absolute left-1.5 top-1.5 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Cover</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1 text-red-600 shadow"
        aria-label={`Remove image ${index + 1}`}
      >
        <X className="size-4" />
      </button>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="rounded-full bg-white/90 p-1 disabled:opacity-30"
          aria-label="Move left"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded-full bg-white/90 p-1 active:cursor-grabbing"
          aria-label={`Drag to reorder image ${index + 1}`}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === count - 1}
          className="rounded-full bg-white/90 p-1 disabled:opacity-30"
          aria-label="Move right"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </li>
  );
}

export function ImageManager({ value, onChange, max = 12, folder = "products" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const latest = useRef(value);
  latest.current = value;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - latest.current.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > list.length) toast.warning(`Only ${max} images allowed per product.`);
    setUploading((n) => n + list.length);

    // Sequential keeps memory low on phones; results are appended in selection order.
    for (const file of list) {
      try {
        const uploaded = await compressAndUpload(file, folder);
        onChange([...latest.current, uploaded]);
        latest.current = [...latest.current, uploaded];
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = value.findIndex((i) => i.path === active.id);
    const to = value.findIndex((i) => i.path === over.id);
    onChange(arrayMove(value, from, to));
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value.map((i) => i.path)} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {value.map((img, i) => (
              <SortableThumb
                key={img.path}
                image={img}
                index={i}
                count={value.length}
                onRemove={() => onChange(value.filter((v) => v.path !== img.path))}
                onMove={(dir) => onChange(arrayMove(value, i, i + dir))}
              />
            ))}
            {Array.from({ length: uploading }, (_, i) => (
              <li key={`up-${i}`} className="flex aspect-[3/4] items-center justify-center rounded-lg border-2 border-dashed bg-white">
                <Loader2 className="size-6 animate-spin text-brand" />
              </li>
            ))}
            {value.length + uploading < max && (
              <li>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink/20 bg-white text-ink/60 transition-colors hover:border-brand hover:text-brand"
                >
                  <ImagePlus className="size-7" />
                  <span className="text-xs font-medium">Add photos</span>
                </button>
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-ink/60">
        First image is the cover. Drag (or use the arrows) to reorder. Photos are resized to 1200px and compressed automatically.
      </p>
    </div>
  );
}

/** Single-image picker (category image, hero banner). */
export function SingleImagePicker({
  value,
  onChange,
  folder,
  aspect = "aspect-square",
}: {
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
  folder: "categories" | "site";
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await compressAndUpload(file, folder));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-ink/20 bg-white text-ink/50 hover:border-brand hover:text-brand",
          aspect,
        )}
        aria-label={value ? "Replace image" : "Upload image"}
      >
        {busy ? (
          <Loader2 className="size-6 animate-spin text-brand" />
        ) : value ? (
          <Image src={value.url} alt="" fill sizes="128px" className="object-cover" />
        ) : (
          <ImagePlus className="size-7" />
        )}
      </button>
      {value && !busy && (
        <button type="button" onClick={() => onChange(null)} className="text-sm font-medium text-red-600 hover:underline">
          Remove
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files)} />
    </div>
  );
}
