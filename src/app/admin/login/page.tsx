import Link from 'next/link'
import { LoginForm } from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-neutral-900">Painel</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-500">
          Entre para gerenciar o catálogo.
        </p>
        <LoginForm />
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-neutral-400 hover:text-neutral-700"
        >
          ← Voltar ao site
        </Link>
      </div>
    </main>
  )
}
