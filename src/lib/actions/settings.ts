'use server'

import { refresh } from 'next/cache'
import { requireSession } from '@/lib/auth'
import { saveSettings, type SiteSettings } from '@/lib/settings'
import { uploadImage } from '@/lib/supabase'

export type SettingsState = { error?: string; success?: boolean } | undefined

export async function updateSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireSession()

  const values: Partial<SiteSettings> = {
    siteName: String(formData.get('siteName') ?? '').trim(),
    whatsappNumber: String(formData.get('whatsappNumber') ?? '').trim(),
    whatsappMessage: String(formData.get('whatsappMessage') ?? ''),
    heroTitle: String(formData.get('heroTitle') ?? '').trim(),
    heroSubtitle: String(formData.get('heroSubtitle') ?? '').trim(),
  }

  let logoUrl = String(formData.get('logoUrl') ?? '').trim()
  const logoFile = formData.get('logoFile')
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      const uploaded = await uploadImage(logoFile)
      logoUrl = uploaded.url
    } catch (error) {
      return { error: (error as Error).message }
    }
  }
  values.logoUrl = logoUrl

  if (!values.siteName) {
    return { error: 'Informe o nome do site.' }
  }
  if (values.whatsappNumber && values.whatsappNumber.replace(/\D/g, '').length < 10) {
    return { error: 'Informe o número do WhatsApp com DDI e DDD (ex.: 5511999998888).' }
  }

  await saveSettings(values)
  refresh()
  return { success: true }
}
