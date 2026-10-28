// Servidor Postgres local (PGlite, WASM) para desenvolvimento — não vai para
// produção. Sobe um Postgres "de verdade" em 127.0.0.1:5432, sem precisar
// instalar nada.
//
//   npm run db:local      (deixe rodando em um terminal)
//   npm run db:seed       (em outro terminal, aplica os dados de exemplo)
//   npm run dev
//
// Os dados ficam na pasta ./.pglite.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'

const PORT = Number(process.env.PGLITE_PORT ?? 5432)
const HOST = process.env.PGLITE_HOST ?? '127.0.0.1'

const db = new PGlite('./.pglite')

const existing = await db.query(`SELECT to_regclass('public."Product"') AS t`)
if (!existing.rows[0]?.t) {
  const initPath = fileURLToPath(new URL('../prisma/init.sql', import.meta.url))
  if (!existsSync(initPath)) {
    console.error('prisma/init.sql não encontrado. Rode: npm run db:sql')
    process.exit(1)
  }
  await db.exec(readFileSync(initPath, 'utf8'))
  console.log('Esquema aplicado.')
} else {
  console.log('Esquema já existente.')
}

const server = new PGLiteSocketServer({ db, port: PORT, host: HOST, maxConnections: 10 })
await server.start()
console.log(`Postgres local (PGlite) ouvindo em ${HOST}:${PORT}`)
console.log('Pressione Ctrl+C para parar.')
