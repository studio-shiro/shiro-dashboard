import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import Image from "next/image";

interface ScannedProductListProps {
  items: WizardProduct[];
  onRemove: (barcode: string) => void;
}

// Tooltip anchors to the name cell's top-left corner, not the cursor — its
// position must stay fixed no matter where in the text the mouse hovers.
// Rendered through a portal because the list scrolls (overflow-y-auto),
// which would otherwise clip a tooltip positioned above the row.
function ScannedProductName({ name }: { name: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [name]);

  useEffect(() => {
    if (!tooltipPos) return;
    const close = () => setTooltipPos(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [tooltipPos]);

  function handleMouseEnter() {
    const el = textRef.current;
    if (!el || !isTruncated) return;
    const rect = el.getBoundingClientRect();
    setTooltipPos({ top: rect.top, left: rect.left });
  }

  return (
    <>
      <p
        ref={textRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltipPos(null)}
        className="body-md-semibold truncate text-text-500"
      >
        {name}
      </p>
      {tooltipPos &&
        createPortal(
          <div
            className="pointer-events-none h-[29px] flex flex-col justify-center fixed z-50 max-w-[420px] -translate-y-[calc(100%+8px)] -translate-x-[10px] rounded-md border border-accent-disabled bg-accent-disabled/90 px-3.5 py-2.5 whitespace-nowrap shadow-sm"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            <p className="body-md-semibold text-text-500">{name}</p>
          </div>,
          document.body,
        )}
    </>
  );
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
        <div className="scrollbar-themed flex max-h-[504px] flex-col gap-3.5 overflow-y-auto pr-4">
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
                      className="h-full w-full object-contain"
                      height={46}
                      width={46}
                    />
                  ) : (
                    <PhotoIcon className="size-full text-text-300" />
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="w-[390px] shrink-0 px-2">
                <ScannedProductName name={item.name || "—"} />
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
          <div className="pointer-events-none absolute bottom-0 left-0 right-7 h-8 bg-gradient-to-b from-[rgba(209,208,201,0)] to-border-300" />
        )}
      </div>
    </div>
  );
}
