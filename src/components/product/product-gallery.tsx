"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string; alt: string | null };

function HoverZoomImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const [origin, setOrigin] = useState<string | null>(null);
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onMouseLeave={() => setOrigin(null)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={cn("object-cover transition-transform duration-200 ease-out", origin && "md:scale-[2]")}
        style={origin ? { transformOrigin: origin } : undefined}
      />
    </div>
  );
}

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [lightboxRef, lightboxApi] = useEmblaCarousel({ loop: images.length > 1, startIndex: 0 });
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (lightboxOpen && lightboxApi) lightboxApi.scrollTo(selected, true);
  }, [lightboxOpen, lightboxApi, selected]);

  if (!images.length) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-mist text-ink/30">
        <ImageOff className="size-14" />
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="scrollbar-none flex gap-2 overflow-x-auto md:max-h-[640px] md:w-20 md:flex-col md:overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={selected === i}
              className={cn(
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md border-2 bg-mist transition md:w-full",
                selected === i ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1">
        <div className="overflow-hidden rounded-xl bg-mist" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {images.map((img, i) => (
              <div key={img.id} className="relative aspect-[3/4] min-w-0 flex-[0_0_100%]">
                <button
                  type="button"
                  className="block h-full w-full cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open full-screen image"
                >
                  <HoverZoomImage src={img.url} alt={img.alt ?? `${name} — image ${i + 1}`} priority={i === 0} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/90 p-2 text-ink shadow md:hidden">
          <Maximize2 className="size-4" />
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow transition hover:bg-white md:block"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow transition hover:bg-white md:block"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
              {images.map((img, i) => (
                <span
                  key={img.id}
                  className={cn("h-1.5 rounded-full bg-white/80 transition-all", selected === i ? "w-5 bg-brand" : "w-1.5")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="h-[100dvh] max-h-none w-screen max-w-none rounded-none border-0 bg-black p-0 sm:p-0">
          <DialogTitle className="sr-only">{name} — images</DialogTitle>
          <div className="h-full overflow-hidden" ref={lightboxRef}>
            <div className="flex h-full">
              {images.map((img, i) => (
                <div key={img.id} className="relative h-full min-w-0 flex-[0_0_100%]">
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${name} — image ${i + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => lightboxApi?.scrollPrev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => lightboxApi?.scrollNext()}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30"
                aria-label="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
