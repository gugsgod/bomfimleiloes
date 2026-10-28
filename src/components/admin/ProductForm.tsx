'use client'

import Link from 'next/link'
import {
  startTransition,
  useActionState,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import type { ProductFormState } from '@/lib/actions/products'
import { MAX_IMAGES_PER_PRODUCT, STATUS, STATUS_LABELS } from '@/lib/constants'
import type { ProductDTO } from '@/lib/types'
import { ProductImage } from '../ProductImage'

type ExistingImage = { id: string; url: string }
type NewImage = { file: File; previewUrl: string }

function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

/** Reduz a foto no navegador para caber no limite de upload do Vercel. */
async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    if (!blob || blob.size >= file.size) return file
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export function ProductForm({
  action,
  product,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>
  product?: ProductDTO
}) {
  const [state, dispatch, pending] = useActionState<ProductFormState, FormData>(
    action,
    undefined,
  )
  const [existing, setExisting] = useState<ExistingImage[]>(
    product ? product.images.map((image) => ({ id: image.id, url: image.url })) : [],
  )
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [compressing, setCompressing] = useState(false)

  const totalImages = existing.length + newImages.length
  const canAddMore = totalImages < MAX_IMAGES_PER_PRODUCT

  function handleFilesPicked(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    const room = Math.max(0, MAX_IMAGES_PER_PRODUCT - totalImages)
    const accepted = picked.slice(0, room).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setNewImages((prev) => [...prev, ...accepted])
    event.target.value = ''
  }

  function removeNew(previewUrl: string) {
    setNewImages((prev) => {
      const target = prev.find((item) => item.previewUrl === previewUrl)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.previewUrl !== previewUrl)
    })
  }

  function moveExisting(index: number, direction: -1 | 1) {
    setExisting((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    existing.forEach((image) => formData.append('existingImages', image.id))
    setCompressing(true)
    try {
      const prepared = await Promise.all(newImages.map((item) => compressImage(item.file)))
      prepared.forEach((file) => formData.append('images', file))
    } finally {
      setCompressing(false)
    }
    startTransition(() => dispatch(formData))
  }

  const busy = pending || compressing

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Informações
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
              Título *
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={product?.title}
              placeholder="Ex.: Fone Bluetooth (devolução Amazon)"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              defaultValue={product?.description}
              placeholder="Estado do produto, o que acompanha, marcas de uso…"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-neutral-700">
                Preço (R$) *
              </label>
              <input
                id="price"
                name="price"
                required
                inputMode="decimal"
                defaultValue={product ? centsToInput(product.priceCents) : ''}
                placeholder="1.250,00"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-neutral-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={product?.status ?? 'AVAILABLE'}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                {STATUS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="published"
              defaultChecked={product?.published ?? true}
              className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
            />
            Publicado no site (desmarque para deixar como rascunho)
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Fotos
          </h2>
          <span className="text-xs text-neutral-400">
            {totalImages}/{MAX_IMAGES_PER_PRODUCT} · a primeira foto é a capa
          </span>
        </div>

        {(existing.length > 0 || newImages.length > 0) && (
          <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {existing.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
              >
                <ProductImage
                  src={image.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Mover para a esquerda"
                    onClick={() => moveExisting(index, -1)}
                    className="px-1 text-xs text-white disabled:opacity-40"
                    disabled={index === 0}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Mover para a direita"
                    onClick={() => moveExisting(index, 1)}
                    className="px-1 text-xs text-white disabled:opacity-40"
                    disabled={index === existing.length - 1}
                  >
                    ›
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Remover foto"
                  onClick={() =>
                    setExisting((prev) => prev.filter((item) => item.id !== image.id))
                  }
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-red-600 shadow"
                >
                  ✕
                </button>
                {index === 0 ? (
                  <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Capa
                  </span>
                ) : null}
              </div>
            ))}

            {newImages.map((item, index) => (
              <div
                key={item.previewUrl}
                className="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-amber-300 bg-neutral-50"
              >
                <ProductImage
                  src={item.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remover foto"
                  onClick={() => removeNew(item.previewUrl)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-red-600 shadow"
                >
                  ✕
                </button>
                {existing.length === 0 && index === 0 ? (
                  <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Capa
                  </span>
                ) : (
                  <span className="absolute left-1 top-1 rounded bg-neutral-700/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Nova
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 ${
            canAddMore ? '' : 'pointer-events-none opacity-50'
          }`}
        >
          Adicionar fotos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFilesPicked}
            disabled={!canAddMore}
          />
        </label>
        <p className="mt-2 text-xs text-neutral-400">
          As fotos são reduzidas automaticamente antes do envio.
        </p>
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {busy ? 'Salvando…' : product ? 'Salvar alterações' : 'Criar produto'}
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
