import Link from "next/link";

export function ProductPdpActions({
  productId,
  soldOut,
}: {
  productId: string;
  soldOut: boolean;
}) {
  if (soldOut) {
    return (
      <span className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground opacity-70">
        Sold Out
      </span>
    );
  }

  return (
    <div className="flex gap-2.5">
      <Link
        href={`/?add=${encodeURIComponent(productId)}`}
        className="haptic inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-border text-sm font-semibold"
      >
        Add to bag
      </Link>
      <Link
        href={`/?add=${encodeURIComponent(productId)}&checkout=1`}
        className="haptic inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
      >
        Checkout
      </Link>
    </div>
  );
}
