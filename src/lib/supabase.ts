import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'products'

let cached: SupabaseClient | null = null

/**
 * Cliente Supabase com a service role key. Somente no servidor.
 * Usado para enviar/remover arquivos do bucket de imagens.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.',
    )
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

/** URL pública de um arquivo já armazenado no bucket. */
export function publicUrlFor(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}

/** Gera um caminho único para o arquivo dentro do bucket. */
export function buildStoragePath(originalName: string): string {
  const ext = (originalName.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `products/${unique}.${ext || 'jpg'}`
}

/** Envia um arquivo para o bucket de imagens e retorna caminho + URL pública. */
export async function uploadImage(
  file: File,
): Promise<{ path: string; url: string }> {
  const supabase = getSupabaseAdmin()
  const path = buildStoragePath(file.name)
  const arrayBuffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(`Falha ao enviar imagem: ${error.message}`)
  }

  return { path, url: publicUrlFor(path) }
}

/** Remove um arquivo do bucket (ignora erros de arquivo inexistente). */
export async function deleteImage(path: string): Promise<void> {
  if (!path) return
  try {
    const supabase = getSupabaseAdmin()
    await supabase.storage.from(STORAGE_BUCKET).remove([path])
  } catch {
    // silencioso: o registro no banco é removido de qualquer forma
  }
}
