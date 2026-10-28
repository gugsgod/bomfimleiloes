import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

export function AdminNav() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-base font-bold text-neutral-900">
            Painel
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="/admin" className="hover:text-neutral-900">
              Produtos
            </Link>
            <Link href="/admin/produtos/novo" className="hover:text-neutral-900">
              Novo produto
            </Link>
            <Link href="/admin/configuracoes" className="hover:text-neutral-900">
              Configurações
            </Link>
            <Link
              href="/"
              target="_blank"
              className="hidden hover:text-neutral-900 sm:inline"
            >
              Ver site ↗
            </Link>
          </nav>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}
