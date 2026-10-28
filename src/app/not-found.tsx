import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <p className="text-6xl font-black text-amber-500">404</p>
      <h1 className="mt-4 text-xl font-bold text-neutral-900">
        Página não encontrada
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        O item que você procura pode ter sido removido ou vendido.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        Voltar ao catálogo
      </Link>
    </main>
  )
}
