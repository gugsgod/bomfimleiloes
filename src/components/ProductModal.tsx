'use client'

import { useEffect, useState } from 'react'
import type { ProductDTO, SiteSettings } from '@/lib/types'
import { formatBRL } from '@/lib/format'
import { buildMessage, buildWhatsAppUrl, normalizePhone } from '@/lib/whatsapp'
import { ProductImage } from './ProductImage'
import { StatusBadge } from './StatusBadge'

const FALLBACK_MESSAGE = 'Olá! Tenho interesse no produto: {produto} ({preco}).'

export function ProductModal({
  product,
  settings,
  onClose,
}: {
  product: ProductDTO
  settings: SiteSettings
  onClose: () => void
}) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const phone = normalizePhone(settings.whatsappNumber)
  const priceText = formatBRL(product.priceCents)
  const message = buildMessage(
    settings.whatsappMessage || FALLBACK_MESSAGE,
    product.title,
    priceText,
  )
  const whatsappUrl = phone ? buildWhatsAppUrl(phone, message) : ''

  const images = product.images
  const current = images[active]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.title}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-0 sm:grid-cols-2">
          {/* Galeria */}
          <div className="bg-neutral-50 p-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
              {current ? (
                <ProductImage
                  src={current.url}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                  Sem foto
                </div>
              )}
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() =>
                      setActive((value) => (value - 1 + images.length) % images.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-neutral-700 shadow hover:bg-white"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima foto"
                    onClick={() => setActive((value) => (value + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-neutral-700 shadow hover:bg-white"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActive(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                      index === active ? 'border-amber-500' : 'border-transparent'
                    }`}
                  >
                    <ProductImage
                      src={image.url}
                      alt={`${product.title} — foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Detalhes */}
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <StatusBadge status={product.status} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-1 -mt-1 rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-neutral-900">{product.title}</h2>
              <p className="mt-2 text-3xl font-black text-amber-600">{priceText}</p>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>

            <div className="mt-auto pt-2">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-bold text-white transition hover:bg-emerald-700"
                >
                  Falar no WhatsApp
                </a>
              ) : (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
                  Número de WhatsApp ainda não configurado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
