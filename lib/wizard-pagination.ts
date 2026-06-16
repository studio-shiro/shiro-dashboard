import type { WizardProduct } from "@/store/productWizard";

/** Splits items into pages where a collapsed row costs 1 unit and an
 *  expanded row costs 2 — keeps every page's rendered height constant
 *  regardless of how many rows are expanded (Figma: 5 collapsed ≡
 *  1 expanded + 3 collapsed, both 5 units). Order is preserved; rows never
 *  get reordered, only split across page boundaries. */
export function paginateByCapacity(
  items: WizardProduct[],
  expandedBarcodes: Set<string>,
  capacity: number,
): WizardProduct[][] {
  const pages: WizardProduct[][] = [];
  let current: WizardProduct[] = [];
  let used = 0;

  for (const item of items) {
    const cost = expandedBarcodes.has(item.barcode) ? 2 : 1;
    if (current.length > 0 && used + cost > capacity) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(item);
    used += cost;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}
