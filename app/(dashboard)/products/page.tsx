import { getProductsAction } from "@/actions/products";
import { ProductsView } from "@/components/products/ProductsView";
import { createClient } from "@/lib/supabase/server";
import { getEnabledColumns, toVisibilityMap } from "@/lib/product-columns";

interface ProductsPageProps {
  searchParams: Promise<{ created?: string; uploadError?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const [result, params, supabase] = await Promise.all([
    getProductsAction(),
    searchParams,
    createClient(),
  ]);

  if (!result.data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-500">{result.error}</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const businessId: string = user?.user_metadata?.business_id ?? "";
  const enabledCols = await getEnabledColumns(businessId);
  const columnVisibility = toVisibilityMap(enabledCols);

  const createdCount = params.created ? Number(params.created) : undefined;
  const uploadError = params.uploadError === "true";

  return (
    <ProductsView
      products={result.data}
      createdCount={createdCount}
      uploadError={uploadError}
      initialColumnVisibility={columnVisibility}
    />
  );
}
