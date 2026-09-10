import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, permanentRedirect } from "next/navigation";

import { resaleProducts } from "../../../../data/products";
import { SHIPPING } from "../../../../data/shipping";
import {
  findProductBySlug,
  productDisplayName,
  productSeoDescription,
  productSeoTitle,
  productSlug,
} from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { ContactBar } from "@/components/contact-bar";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPdpActions } from "@/components/product-pdp-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isListedSold, schemaAvailability } from "@/lib/sold";
import { isSoldId } from "@/lib/sold-store";

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

  const title = productSeoTitle(product);
  const description = productSeoDescription(product);
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
      images: [{ url: absoluteImage(product.image), alt: productDisplayName(product) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage(product.image)],
    },
  };
}

export const dynamic = "force-dynamic";

function ProductJsonLd({
  product,
  slug,
  sold,
}: {
  product: NonNullable<ReturnType<typeof findProductBySlug>>;
  slug: string;
  sold: boolean;
}) {
  const displayName = productDisplayName(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description: productSeoDescription(product),
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
      availability: schemaAvailability(sold),
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
  await connection();
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();

  const canonicalSlug = productSlug(product);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/product/${canonicalSlug}`);
  }

  const displayName = productDisplayName(product);
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  const registrySold = await isSoldId(product.id, productSlug(product)).catch(
    () => false
  );
  const soldOut = isListedSold(product, registrySold ? new Set([product.id]) : new Set());

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background pb-16">
      <ProductJsonLd
        product={product}
        slug={canonicalSlug}
        sold={soldOut}
      />

      <SiteHeader />

      <main className="flex flex-col">
        <ProductGallery images={gallery} alt={displayName} soldOut={soldOut} />

        <div className="flex flex-col gap-4 px-5 py-5">
          {product.condition && (
            <span className="inline-block w-fit rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {product.condition}
            </span>
          )}
          <h1 className="font-serif text-3xl leading-tight tracking-tight">
            {displayName}
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
          <ContactBar />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
