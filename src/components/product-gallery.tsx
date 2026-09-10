"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoldBadge } from "@/components/sold-badge";

function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [current, setCurrent] = React.useState(src);
  React.useEffect(() => setCurrent(src), [src]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      onError={() => setCurrent("/placeholder.svg")}
      className={className}
    />
  );
}

export function ProductGallery({
  images,
  alt,
  soldOut,
}: {
  images: string[];
  alt: string;
  soldOut: boolean;
}) {
  const [index, setIndex] = React.useState(0);
  const gallery = images.length > 0 ? images : ["/placeholder.svg"];
  const src = gallery[index] ?? gallery[0];
  const multi = gallery.length > 1;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "relative aspect-square w-full bg-secondary",
          soldOut && "opacity-50 grayscale"
        )}
      >
        <ProductImage
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55">
            <SoldBadge size="md" className="bg-background" />
          </span>
        )}
        {multi && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setIndex((i) => (i - 1 + gallery.length) % gallery.length)
              }
              className="haptic absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setIndex((i) => (i + 1) % gallery.length)}
              className="haptic absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
              {index + 1} / {gallery.length}
            </span>
          </>
        )}
      </div>
      {multi && (
        <div className="flex gap-2 overflow-x-auto px-5 py-3">
          {gallery.map((thumb, i) => (
            <button
              key={`${thumb}-${i}`}
              type="button"
              aria-label={`Photo ${i + 1} of ${gallery.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "haptic size-14 shrink-0 overflow-hidden rounded-lg border bg-secondary",
                i === index
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border"
              )}
            >
              <ProductImage
                src={thumb}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
