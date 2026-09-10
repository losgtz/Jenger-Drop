import { HomePage } from "@/components/home-page";
import { parseCatalogQuery } from "@/lib/catalog-query";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: PageProps) {
  const raw = await searchParams;
  return <HomePage initialQuery={parseCatalogQuery(raw)} />;
}
