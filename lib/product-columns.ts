import { createClient } from '@/lib/supabase/server'
import { PRODUCT_COLUMNS, type ColumnDefinition } from './product-column-registry'

export async function getEnabledColumns(businessId: string): Promise<ColumnDefinition[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_product_columns')
    .select('column_key, enabled')
    .eq('business_id', businessId)

  if (!data || data.length === 0) {
    await supabase.from('business_product_columns').insert(
      PRODUCT_COLUMNS.map((col, i) => ({
        business_id: businessId,
        column_key: col.key,
        enabled: col.defaultEnabled,
        sort_order: i,
      }))
    )
    return PRODUCT_COLUMNS.filter(c => c.defaultEnabled)
  }

  const enabledKeys = new Set(data.filter(r => r.enabled).map(r => r.column_key))
  return PRODUCT_COLUMNS.filter(c => enabledKeys.has(c.key))
}

export function toVisibilityMap(columns: ColumnDefinition[]): Record<string, boolean> {
  return Object.fromEntries(PRODUCT_COLUMNS.map(c => [c.key, columns.some(e => e.key === c.key)]))
}
