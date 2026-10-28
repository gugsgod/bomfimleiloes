/* eslint-disable @next/next/no-img-element */

import type { ImgHTMLAttributes } from 'react'

/**
 * Imagem simples do catálogo. Usa <img> de propósito: as fotos ficam no
 * Supabase Storage (domínio variável por projeto), o que torna o <Image> do
 * Next menos prático aqui.
 */
export function ProductImage({
  alt = '',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return <img loading="lazy" alt={alt} {...props} />
}
