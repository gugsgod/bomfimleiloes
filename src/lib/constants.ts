// Constantes compartilhadas entre servidor e cliente (sem dependências de Node).

export const STATUS = ['AVAILABLE', 'RESERVED', 'SOLD'] as const
export type ProductStatus = (typeof STATUS)[number]

export const STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
}

// Ordem em que os produtos aparecem no catálogo:
// disponíveis primeiro, depois reservados, depois vendidos.
export const STATUS_ORDER: Record<ProductStatus, number> = {
  AVAILABLE: 0,
  RESERVED: 1,
  SOLD: 2,
}

export const MAX_IMAGES_PER_PRODUCT = 8

export const SESSION_COOKIE_NAME = 'bomfim_session'

export function isProductStatus(value: unknown): value is ProductStatus {
  return typeof value === 'string' && (STATUS as readonly string[]).includes(value)
}
