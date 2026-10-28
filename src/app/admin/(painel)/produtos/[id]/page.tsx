import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ProductForm } from '@/components/admin/ProductForm'
import { updateProduct } from '@/lib/actions/products'
import { requireSession } from '@/lib/auth'
import { getProductById } from '@/lib/products'

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={params} />
    </Suspense>
  )
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await requireSession()
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const action = updateProduct.bind(null, product.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Editar produto</h1>
      <ProductForm action={action} product={product} />
    </div>
  )
}

function Loading() {
  return <div className="h-80 animate-pulse rounded-xl bg-white" />
}
