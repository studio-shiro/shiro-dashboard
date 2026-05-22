import { getBrandsAction } from "@/actions/brands";
import { BrandsView } from "@/components/brands/BrandsView";

export default async function BrandsPage() {
  const result = await getBrandsAction();

  if ("error" in result) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="body-md-regular text-red-500">{result.error}</p>
      </div>
    );
  }

  return <BrandsView brands={result.data} />;
}
