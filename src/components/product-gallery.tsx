"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const src = images[index] ?? images[0];

  return (
    <div
      className={cn(
        "relative aspect-square w-full bg-secondary",
        soldOut && "opacity-50 grayscale"
      )}
    >
      <ProductImage src={src} alt={alt} className="h-full w-full object-cover" />
      {soldOut && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55">
          <span className="rounded-full bg-background px-5 py-2 text-sm font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Sold Out
          </span>
        </span>
      )}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="haptic absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="haptic absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
