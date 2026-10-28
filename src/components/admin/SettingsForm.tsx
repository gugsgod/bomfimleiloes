'use client'

import { useActionState } from 'react'
import type { SettingsState } from '@/lib/actions/settings'
import type { SiteSettings } from '@/lib/types'
import { ProductImage } from '../ProductImage'

export function SettingsForm({
  action,
  settings,
}: {
  action: (state: SettingsState, formData: FormData) => Promise<SettingsState>
  settings: SiteSettings
}) {
  const [state, dispatch, pending] = useActionState<SettingsState, FormData>(
    action,
    undefined,
  )

  return (
    <form action={dispatch} className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Identidade do site
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-neutral-700">
              Nome do site / loja
            </label>
            <input
              id="siteName"
              name="siteName"
              defaultValue={settings.siteName}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">Logo</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {settings.logoUrl ? (
                  <ProductImage
                    src={settings.logoUrl}
                    alt="Logo atual"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-neutral-400">sem logo</span>
                )}
              </div>
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                className="text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
              />
            </div>
            <input type="hidden" name="logoUrl" defaultValue={settings.logoUrl} />
            <p className="mt-1 text-xs text-neutral-400">
              Envie uma imagem quadrada ou horizontal (PNG/JPG). Deixe em branco para manter.
            </p>
          </div>

          <div>
            <label htmlFor="heroTitle" className="block text-sm font-medium text-neutral-700">
              Título de destaque
            </label>
            <input
              id="heroTitle"
              name="heroTitle"
              defaultValue={settings.heroTitle}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label htmlFor="heroSubtitle" className="block text-sm font-medium text-neutral-700">
              Subtítulo de destaque
            </label>
            <textarea
              id="heroSubtitle"
              name="heroSubtitle"
              rows={2}
              defaultValue={settings.heroSubtitle}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Contato pelo WhatsApp
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-neutral-700">
              Número do WhatsApp
            </label>
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              inputMode="tel"
              defaultValue={settings.whatsappNumber}
              placeholder="5511999998888"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
            <p className="mt-1 text-xs text-neutral-400">
              Somente números, com DDI e DDD. Ex.: 5511999998888.
            </p>
          </div>

          <div>
            <label htmlFor="whatsappMessage" className="block text-sm font-medium text-neutral-700">
              Mensagem padrão
            </label>
            <textarea
              id="whatsappMessage"
              name="whatsappMessage"
              rows={3}
              defaultValue={settings.whatsappMessage}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
            <p className="mt-1 text-xs text-neutral-400">
              Use <code>{'{produto}'}</code> e <code>{'{preco}'}</code> para inserir o nome e o
              preço do item escolhido.
            </p>
          </div>
        </div>
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Configurações salvas com sucesso.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? 'Salvando…' : 'Salvar configurações'}
      </button>
    </form>
  )
}
