import { getProductsAction } from "@/actions/products";
import { ProductsView } from "@/components/products/ProductsView";

export default async function ProductsPage() {
  const result = await getProductsAction();

  if (!result.data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-500">{result.error}</p>
      </div>
    );
  }

  return <ProductsView products={result.data} />;
}
