'use client'

import type { ProductDTO } from '@/lib/types'
import { formatBRL } from '@/lib/format'
import { ProductImage } from './ProductImage'
import { StatusBadge } from './StatusBadge'

export function ProductCard({
  product,
  onOpen,
}: {
  product: ProductDTO
  onOpen: (product: ProductDTO) => void
}) {
  const cover = product.images[0]?.url
  const sold = product.status === 'SOLD'

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {cover ? (
          <ProductImage
            src={cover}
            alt={product.title}
            className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
              sold ? 'opacity-60 grayscale' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Sem foto
          </div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={product.status} />
        </div>
        {sold ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="-rotate-6 rounded-md bg-neutral-900/80 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white">
              Vendido
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold text-neutral-900">
          {product.title}
        </h3>
        <div className="mt-auto text-lg font-bold text-neutral-900">
          {formatBRL(product.priceCents)}
        </div>
      </div>
    </button>
  )
}
