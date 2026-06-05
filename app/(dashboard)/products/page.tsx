import { getProductsAction } from "@/actions/products";
import { ProductsView } from "@/components/products/ProductsView";

interface ProductsPageProps {
  searchParams: Promise<{ created?: string; uploadError?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const result = await getProductsAction();
  const params = await searchParams;

  if (!result.data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-500">{result.error}</p>
      </div>
    );
  }

  const createdCount = params.created ? Number(params.created) : undefined;
  const uploadError = params.uploadError === "true";

  return (
    <ProductsView
      products={result.data}
      createdCount={createdCount}
      uploadError={uploadError}
    />
  );
}
