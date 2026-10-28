import 'server-only'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE_NAME } from './constants'

const COOKIE_NAME = SESSION_COOKIE_NAME
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 dias

export type Session = { username: string }

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET não está definida. Gere uma com: openssl rand -base64 32')
  }
  return new TextEncoder().encode(secret)
}

/** Compara usuário/senha com as credenciais definidas no ambiente. */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME ?? ''
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? ''
  if (!expectedUser || !passwordHash) return false
  if (username.trim() !== expectedUser) return false
  try {
    return await bcrypt.compare(password, passwordHash)
  } catch {
    return false
  }
}

async function encrypt(session: Session): Promise<string> {
  return new SignJWT({ username: session.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())
}

async function decrypt(token: string | undefined): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    })
    if (typeof payload.username !== 'string') return null
    return { username: payload.username }
  } catch {
    return null
  }
}

export async function createSession(username: string): Promise<void> {
  const token = await encrypt({ username })
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  return decrypt(cookieStore.get(COOKIE_NAME)?.value)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/** Garante uma sessão válida ou redireciona para o login. */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }
  return session
}
