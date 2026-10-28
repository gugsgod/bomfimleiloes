'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { isProductStatus, MAX_IMAGES_PER_PRODUCT } from '@/lib/constants'
import { parsePriceToCents } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { deleteImage, uploadImage } from '@/lib/supabase'

export type ProductFormState = { error?: string } | undefined

type ParsedProduct = {
  title: string
  description: string
  status: string
  priceCents: number
  published: boolean
}

function parseProductForm(
  formData: FormData,
): { ok: true; data: ParsedProduct } | { ok: false; error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const status = String(formData.get('status') ?? 'AVAILABLE')
  const priceCents = parsePriceToCents(String(formData.get('price') ?? ''))
  const published = formData.get('published') != null

  if (title.length < 2) {
    return { ok: false, error: 'Informe um título com pelo menos 2 caracteres.' }
  }
  if (!description) {
    return { ok: false, error: 'Informe uma descrição para o produto.' }
  }
  if (!isProductStatus(status)) {
    return { ok: false, error: 'Status inválido.' }
  }
  if (priceCents == null) {
    return { ok: false, error: 'Informe um preço válido (ex.: 1.250,00).' }
  }
  return { ok: true, data: { title, description, status, priceCents, published } }
}

function getNewImageFiles(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
}

async function uploadNewImages(
  formData: FormData,
  alreadyHave: number,
): Promise<{ path: string; url: string }[]> {
  const files = getNewImageFiles(formData)
  if (files.length === 0) return []
  if (alreadyHave + files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new Error(
      `Cada produto pode ter no máximo ${MAX_IMAGES_PER_PRODUCT} fotos.`,
    )
  }
  return Promise.all(files.map((file) => uploadImage(file)))
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireSession()

  const parsed = parseProductForm(formData)
  if (!parsed.ok) return { error: parsed.error }

  let images: { path: string; url: string }[]
  try {
    images = await uploadNewImages(formData, 0)
  } catch (error) {
    return { error: (error as Error).message }
  }

  await prisma.product.create({
    data: {
      ...parsed.data,
      images: {
        create: images.map((image, index) => ({
          path: image.path,
          url: image.url,
          sortOrder: index,
        })),
      },
    },
  })

  refresh()
  redirect('/admin')
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireSession()

  const existing = await prisma.product.findUnique({ where: { id: productId } })
  if (!existing) return { error: 'Produto não encontrado.' }

  const parsed = parseProductForm(formData)
  if (!parsed.ok) return { error: parsed.error }

  const keptIds = formData.getAll('existingImages').map(String).filter(Boolean)

  const currentImages = await prisma.productImage.findMany({
    where: { productId },
  })
  const keptSet = new Set(keptIds)
  const removed = currentImages.filter((image) => !keptSet.has(image.id))

  let newImages: { path: string; url: string }[]
  try {
    newImages = await uploadNewImages(formData, keptIds.length)
  } catch (error) {
    return { error: (error as Error).message }
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: parsed.data,
    }),
    prisma.productImage.deleteMany({
      where: { id: { in: removed.map((image) => image.id) } },
    }),
    ...keptIds.map((imageId, index) =>
      prisma.productImage.update({
        where: { id: imageId },
        data: { sortOrder: index },
      }),
    ),
    ...(newImages.length > 0
      ? [
          prisma.productImage.createMany({
            data: newImages.map((image, index) => ({
              productId,
              path: image.path,
              url: image.url,
              sortOrder: keptIds.length + index,
            })),
          }),
        ]
      : []),
  ])

  await Promise.all(
    removed
      .filter((image) => image.path)
      .map((image) => deleteImage(image.path as string)),
  )

  refresh()
  redirect('/admin')
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireSession()
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const images = await prisma.productImage.findMany({ where: { productId: id } })
  await prisma.product.delete({ where: { id } })
  await Promise.all(
    images
      .filter((image) => image.path)
      .map((image) => deleteImage(image.path as string)),
  )
  refresh()
}

export async function updateProductStatus(formData: FormData): Promise<void> {
  await requireSession()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !isProductStatus(status)) return
  await prisma.product.update({ where: { id }, data: { status } })
  refresh()
}

export async function toggleProductPublished(formData: FormData): Promise<void> {
  await requireSession()
  const id = String(formData.get('id') ?? '')
  const published = String(formData.get('published') ?? '') === 'true'
  if (!id) return
  await prisma.product.update({ where: { id }, data: { published } })
  refresh()
}
