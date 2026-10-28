import Link from 'next/link'
import { Suspense } from 'react'
import { ProductTable } from '@/components/admin/ProductTable'
import { requireSession } from '@/lib/auth'
import { getAdminProducts } from '@/lib/products'

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminContent />
    </Suspense>
  )
}

async function AdminContent() {
  await requireSession()
  const products = await getAdminProducts()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Produtos</h1>
          <p className="text-sm text-neutral-500">
            {products.length} produto(s) no catálogo.
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Novo produto
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  )
}

function AdminLoading() {
  return <div className="h-24 animate-pulse rounded-xl bg-white" />
}
