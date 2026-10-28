'use client'

import { useState } from 'react'
import type { ProductDTO, SiteSettings } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { ProductModal } from './ProductModal'

export function Catalog({
  products,
  settings,
}: {
  products: ProductDTO[]
  settings: SiteSettings
}) {
  const [selected, setSelected] = useState<ProductDTO | null>(null)

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
        <p className="text-lg font-semibold text-neutral-700">
          Nenhum produto disponível no momento.
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Volte em breve — novos itens são adicionados com frequência.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpen={setSelected} />
        ))}
      </div>

      {selected ? (
        <ProductModal
          key={selected.id}
          product={selected}
          settings={settings}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  )
}
