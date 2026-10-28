'use client'

import Link from 'next/link'
import {
  deleteProduct,
  toggleProductPublished,
  updateProductStatus,
} from '@/lib/actions/products'
import { STATUS, STATUS_LABELS } from '@/lib/constants'
import { formatBRL, formatDate } from '@/lib/format'
import type { ProductDTO } from '@/lib/types'
import { ProductImage } from '../ProductImage'

export function ProductTable({ products }: { products: ProductDTO[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <p className="font-semibold text-neutral-700">Nenhum produto cadastrado.</p>
        <Link
          href="/admin/produtos/novo"
          className="mt-3 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Cadastrar o primeiro produto
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Produto</th>
            <th className="px-4 py-3 font-semibold">Preço</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Visibilidade</th>
            <th className="px-4 py-3 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {products.map((product) => {
            const cover = product.images[0]?.url
            return (
              <tr key={product.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {cover ? (
                        <ProductImage
                          src={cover}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium text-neutral-900">
                        {product.title}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(product.createdAt)} · {product.images.length} foto(s)
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 font-semibold text-neutral-900">
                  {formatBRL(product.priceCents)}
                </td>

                <td className="px-4 py-3">
                  <form action={updateProductStatus}>
                    <input type="hidden" name="id" value={product.id} />
                    <select
                      name="status"
                      defaultValue={product.status}
                      onChange={(event) => event.currentTarget.form?.requestSubmit()}
                      className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-amber-500"
                    >
                      {STATUS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </form>
                </td>

                <td className="px-4 py-3">
                  <form action={toggleProductPublished}>
                    <input type="hidden" name="id" value={product.id} />
                    <input
                      type="hidden"
                      name="published"
                      value={product.published ? 'false' : 'true'}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.published
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                    >
                      {product.published ? 'Publicado' : 'Oculto'}
                    </button>
                  </form>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Editar
                    </Link>
                    <form
                      action={deleteProduct}
                      onSubmit={(event) => {
                        if (
                          !window.confirm(
                            `Excluir "${product.title}"? Esta ação não pode ser desfeita.`,
                          )
                        ) {
                          event.preventDefault()
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
