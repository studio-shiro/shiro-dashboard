export type ColumnType = 'text' | 'number' | 'image' | 'select' | 'date' | 'display'
export type ColumnGroup = 'basic' | 'inventory' | 'media' | 'meta' | 'system'

export interface ColumnDefinition {
  key: string
  label: string
  type: ColumnType
  required: boolean
  defaultEnabled: boolean
  group: ColumnGroup
}

export const PRODUCT_COLUMNS: ColumnDefinition[] = [
  { key: 'product',  label: 'Producto',       type: 'text',    required: true,  defaultEnabled: true, group: 'basic' },
  { key: 'sku',      label: 'SKU',            type: 'text',    required: false, defaultEnabled: true, group: 'basic' },
  { key: 'image',    label: 'Imagen',         type: 'image',   required: false, defaultEnabled: true, group: 'media' },
  { key: 'brand',    label: 'Marca',          type: 'select',  required: false, defaultEnabled: true, group: 'meta' },
  { key: 'category', label: 'Categoría',      type: 'select',  required: false, defaultEnabled: true, group: 'meta' },
  { key: 'batches',  label: 'Vencimientos',   type: 'display', required: false, defaultEnabled: true, group: 'inventory' },
  { key: 'cost',     label: 'Costo Unitario', type: 'number',  required: true,  defaultEnabled: true, group: 'inventory' },
  { key: 'price',    label: 'Precio Final',   type: 'number',  required: true,  defaultEnabled: true, group: 'inventory' },
  { key: 'stock',    label: 'Stock',          type: 'number',  required: true,  defaultEnabled: true, group: 'inventory' },
  { key: 'actions',  label: 'Acciones',       type: 'display', required: true,  defaultEnabled: true, group: 'system' },
]

export const COLUMN_MAP: Record<string, ColumnDefinition> =
  Object.fromEntries(PRODUCT_COLUMNS.map(c => [c.key, c]))
