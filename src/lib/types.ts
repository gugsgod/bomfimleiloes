import type { ProductStatus } from './constants'

// Tipos compartilhados entre servidor e cliente. Apenas tipos (sem runtime),
// então podem ser importados por componentes cliente sem arrastar o servidor.

export type ProductImageDTO = {
  id: string
  url: string
  path: string | null
  sortOrder: number
}

export type ProductDTO = {
  id: string
  title: string
  description: string
  priceCents: number
  status: ProductStatus
  published: boolean
  createdAt: string
  updatedAt: string
  images: ProductImageDTO[]
}

export type SiteSettings = {
  siteName: string
  logoUrl: string
  whatsappNumber: string
  whatsappMessage: string
  heroTitle: string
  heroSubtitle: string
}
