import { STATUS_LABELS, type ProductStatus } from '@/lib/constants'

const STYLES: Record<ProductStatus, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  RESERVED: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  SOLD: 'bg-neutral-200 text-neutral-700 ring-neutral-500/20',
}

export function StatusBadge({
  status,
  className = '',
}: {
  status: ProductStatus
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STYLES[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
