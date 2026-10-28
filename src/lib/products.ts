import 'server-only'
import { prisma } from './prisma'
import { STATUS_ORDER, isProductStatus } from './constants'
import type { ProductDTO } from './types'

export type { ProductDTO, ProductImageDTO } from './types'

type ProductRow = {
  id: string
  title: string
  description: string
  priceCents: number
  status: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  images: { id: string; url: string; path: string | null; sortOrder: number }[]
}

function toDTO(row: ProductRow): ProductDTO {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceCents: row.priceCents,
    status: isProductStatus(row.status) ? row.status : 'AVAILABLE',
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      path: image.path,
      sortOrder: image.sortOrder,
    })),
  }
}

/**
 * Ordena o catálogo: disponíveis, depois reservados, depois vendidos.
 * Dentro de cada grupo, os mais recentes primeiro.
 */
export function sortForCatalog(products: ProductDTO[]): ProductDTO[] {
  return [...products].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (byStatus !== 0) return byStatus
    return b.createdAt.localeCompare(a.createdAt)
  })
}

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
}

/** Produtos visíveis no site (não ocultos), já ordenados. */
export async function getCatalogProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: { published: true },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })
  return sortForCatalog(rows.map(toDTO))
}

/** Todos os produtos, inclusive ocultos (painel admin). */
export async function getAdminProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(toDTO)
}

export async function getProductById(id: string): Promise<ProductDTO | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  })
  return row ? toDTO(row) : null
}
