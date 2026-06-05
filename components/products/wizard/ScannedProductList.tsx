import { XMarkIcon } from "@heroicons/react/24/outline";
import { CubeIcon } from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";

interface ScannedProductListProps {
  items: WizardProduct[];
  onRemove: (barcode: string) => void;
}

export function ScannedProductList({ items, onRemove }: ScannedProductListProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5">
      <p className="heading-lg text-text-500">Productos Agregados</p>
      <div className="flex max-h-[440px] flex-col gap-3.5 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.barcode}
            className="flex h-[60px] items-center justify-between rounded-2xl border border-border-300 bg-white"
          >
            {/* Thumbnail */}
            <div className="flex w-[69px] items-center justify-center py-1.5">
              <div className="size-[47px] overflow-hidden rounded-lg border border-border-100">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name || item.barcode}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-background-300">
                    <CubeIcon className="size-5 text-text-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="w-[189px] px-2">
              <p className="body-md-semibold truncate text-text-500">
                {item.name || "—"}
              </p>
            </div>

            {/* Barcode */}
            <div className="flex-1 px-2">
              <p className="body-md-regular truncate text-text-500">
                {item.barcode}
              </p>
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => onRemove(item.barcode)}
              className="pr-2 text-text-400 transition-colors hover:text-text-500"
            >
              <XMarkIcon className="size-6" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
