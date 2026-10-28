import { Suspense } from 'react'
import { ProductForm } from '@/components/admin/ProductForm'
import { createProduct } from '@/lib/actions/products'
import { requireSession } from '@/lib/auth'

export default function NewProductPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  await requireSession()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Novo produto</h1>
      <ProductForm action={createProduct} />
    </div>
  )
}

function Loading() {
  return <div className="h-80 animate-pulse rounded-xl bg-white" />
}
