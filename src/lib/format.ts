// Formatação de valores. Sem "server-only" para poder ser usado no cliente.

export function formatBRL(cents: number): string {
  const value = Number.isFinite(cents) ? cents / 100 : 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Converte um preço digitado em centavos.
 * Aceita formatos como "1.250,00", "1250", "1250.50" e "12,50".
 * Retorna null quando o valor é inválido.
 */
export function parsePriceToCents(input: string | null | undefined): number | null {
  if (input == null) return null
  let text = String(input).replace(/[^\d.,-]/g, '').trim()
  if (!text) return null

  if (text.includes(',')) {
    // Formato brasileiro: ponto separa milhar, vírgula separa decimal.
    text = text.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    // Somente pontos, agrupados de 3 em 3 => separador de milhar.
    text = text.replace(/\./g, '')
  }

  const value = Number(text)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100)
}

/** Formata uma data para exibição (pt-BR). */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
