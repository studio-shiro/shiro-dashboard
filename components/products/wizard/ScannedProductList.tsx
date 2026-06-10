import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import Image from "next/image";

interface ScannedProductListProps {
  items: WizardProduct[];
  onRemove: (barcode: string) => void;
}

export function ScannedProductList({
  items,
  onRemove,
}: ScannedProductListProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-7">
      <p className="heading-lg text-text-500">Productos Agregados</p>
      <div className="relative">
        <div className="flex max-h-[504px] flex-col gap-3.5 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.barcode}
              className="flex h-[60px] items-center justify-between rounded-[14px] border border-border-300 bg-white"
            >
              {/* Thumbnail */}
              <div className="flex w-[69px] shrink-0 items-center justify-center py-1.5">
                <div className="flex size-[47px] items-center justify-center overflow-hidden rounded-lg">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name || item.barcode}
                      className="h-full w-full object-cover"
                      height={46}
                      width={46}
                    />
                  ) : (
                    <PhotoIcon className="size-full text-text-300" />
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="w-[189px] shrink-0 px-2">
                <p className="body-md-semibold truncate text-text-500">
                  {item.name || "—"}
                </p>
              </div>

              {/* Barcode */}
              <div className="min-w-0 flex-1 px-2">
                <p className="body-md-regular truncate text-text-500">
                  {item.barcode}
                </p>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => onRemove(item.barcode)}
                className="shrink-0 pr-2 text-text-400 transition-colors hover:text-text-500"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>
          ))}
        </div>

        {/* Fade at bottom when list is scrollable */}
        {items.length >= 8 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-white" />
        )}
      </div>
    </div>
  );
}
