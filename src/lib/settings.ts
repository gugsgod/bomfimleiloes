import 'server-only'
import { prisma } from './prisma'
import type { SiteSettings } from './types'

export type { SiteSettings }

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Bomfim Leilões',
  logoUrl: '',
  whatsappNumber: '',
  whatsappMessage: 'Olá! Tenho interesse no produto: {produto} ({preco}).',
  heroTitle: 'Produtos com preço de leilão',
  heroSubtitle:
    'Itens de devolução da Amazon e de outras lojas, revisados e prontos para você.',
}

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany()
  const result: SiteSettings = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    if ((SETTING_KEYS as string[]).includes(row.key)) {
      result[row.key as keyof SiteSettings] = row.value
    }
  }
  return result
}

export async function saveSettings(values: Partial<SiteSettings>): Promise<void> {
  const entries = Object.entries(values).filter(([key]) =>
    (SETTING_KEYS as string[]).includes(key),
  )
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value ?? '') },
        update: { value: String(value ?? '') },
      }),
    ),
  )
}
