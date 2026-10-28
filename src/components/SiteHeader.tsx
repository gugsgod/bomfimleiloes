import Link from 'next/link'
import type { SiteSettings } from '@/lib/types'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { ProductImage } from './ProductImage'

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const phone = settings.whatsappNumber?.replace(/\D/g, '') ?? ''
  const whatsappUrl = phone
    ? buildWhatsAppUrl(phone, 'Olá! Vim pelo site e gostaria de mais informações.')
    : ''

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {settings.logoUrl ? (
            <ProductImage
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-10 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-lg font-black text-white">
              {(settings.siteName || 'B').trim().charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate text-lg font-bold text-neutral-900">
            {settings.siteName || 'Catálogo'}
          </span>
        </Link>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:inline-flex"
          >
            Falar no WhatsApp
          </a>
        ) : null}
      </div>
    </header>
  )
}
