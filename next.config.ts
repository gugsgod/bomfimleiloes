import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Mantém Prisma e o driver do Postgres fora do bundle do servidor. Sem isto,
  // o empacotador pode quebrar a conexão (erros de "Connection closed" em
  // escritas). Essencial para funcionar na Vercel.
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  experimental: {
    serverActions: {
      // Uploads de fotos passam por Server Actions. 4mb cobre fotos de celular
      // já comprimidas no navegador. (O Vercel limita a ~4,5MB por requisição.)
      bodySizeLimit: '4mb',
    },
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
