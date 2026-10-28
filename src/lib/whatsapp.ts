// Utilitários de WhatsApp. Sem "server-only": usado no modal (cliente).

/** Mantém apenas os dígitos do telefone (com DDI, ex.: 5511999998888). */
export function normalizePhone(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\D/g, '')
}

/**
 * Monta a mensagem substituindo os marcadores {produto} e {preco}.
 */
export function buildMessage(
  template: string,
  productTitle: string,
  priceText: string,
): string {
  return template
    .replaceAll('{produto}', productTitle)
    .replaceAll('{preco}', priceText)
}

/** Monta a URL do WhatsApp com a mensagem pré-preenchida. */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhone(phone)
  const text = encodeURIComponent(message)
  return `https://wa.me/${digits}?text=${text}`
}
