import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resaleProducts } from "../../../../data/products";
import { SHIPPING } from "../../../../data/shipping";
import { findProductBySlug, productSlug } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPdpActions } from "@/components/product-pdp-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function absoluteImage(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export function generateStaticParams() {
  return resaleProducts.map((product) => ({ slug: productSlug(product) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) {
    return { title: "Piece not found" };
  }

  const brandFirst = product.brand
    ? `${product.brand} | ${product.name}`
    : product.name;
  const title = `${brandFirst} | 2nd Chance Resale`;
  const description = [
    product.brand,
    product.condition,
    product.sizes?.[0] ? `Size ${product.sizes[0]}` : null,
    `$${product.price.toFixed(2)}`,
    "One-of-a-kind piece from 2nd Chance Resale.",
  ]
    .filter(Boolean)
    .join(" · ");
  const canonical = `/product/${productSlug(product)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: absoluteImage(product.image), alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage(product.image)],
    },
  };
}

function ProductJsonLd({
  product,
  slug,
}: {
  product: NonNullable<ReturnType<typeof findProductBySlug>>;
  slug: string;
}) {
  const inStock = (product.stock ?? 1) > 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: (product.images && product.images.length > 0
      ? product.images
      : [product.image]
    ).map(absoluteImage),
    sku: product.id,
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition:
        product.condition === "NEW WITH TAGS"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: SHIPPING.flatRateUsd.toFixed(2),
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  const soldOut = (product.stock ?? 1) <= 0;

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background pb-16">
      <ProductJsonLd product={product} slug={productSlug(product)} />

      <SiteHeader />

      <main className="flex flex-col">
        <ProductGallery images={gallery} alt={product.name} soldOut={soldOut} />

        <div className="flex flex-col gap-4 px-5 py-5">
          {product.condition && (
            <span className="inline-block w-fit rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {product.condition}
            </span>
          )}
          <h1 className="font-serif text-3xl leading-tight tracking-tight">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {product.brand}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl">{money(product.price)}</span>
            {product.originalPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {money(product.originalPrice)}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          {product.sizes?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <ProductPdpActions productId={product.id} soldOut={soldOut} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
