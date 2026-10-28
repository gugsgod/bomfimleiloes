import Link from 'next/link'
import type { SiteSettings } from '@/lib/types'

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {settings.siteName || 'Catálogo'}. Todos os direitos reservados.
        </p>
        <Link
          href="/admin"
          className="text-neutral-400 underline-offset-4 hover:text-neutral-700 hover:underline"
        >
          Área do administrador
        </Link>
      </div>
    </footer>
  )
}
