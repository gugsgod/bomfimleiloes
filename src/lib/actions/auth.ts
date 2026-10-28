'use server'

import { redirect } from 'next/navigation'
import { createSession, destroySession, verifyCredentials } from '@/lib/auth'

export type LoginState = { error?: string } | undefined

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!username || !password) {
    return { error: 'Preencha usuário e senha.' }
  }

  const ok = await verifyCredentials(username, password)
  if (!ok) {
    return { error: 'Usuário ou senha inválidos.' }
  }

  await createSession(username)
  redirect('/admin')
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/admin/login')
}
