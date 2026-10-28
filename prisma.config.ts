import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Prisma ORM v7: a URL de conexão fica aqui (não mais no schema.prisma).
//
// - O runtime da aplicação (src/lib/prisma.ts) usa DATABASE_URL, que pode ser a
//   URL "pooled" do Supabase (porta 6543), ideal para serverless.
// - Os comandos do CLI (migrate / db push / studio) usam DIRECT_URL quando
//   existir, pois migrations precisam de uma conexão direta (porta 5432).
//
// Usamos process.env (e não o helper env()) porque nem todo comando precisa da
// URL — assim `prisma generate` e `prisma validate` funcionam sem banco.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
})
