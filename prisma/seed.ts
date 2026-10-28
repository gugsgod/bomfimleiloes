import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? ''
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: 'Bomfim Leilões',
  logoUrl: '',
  whatsappNumber: '',
  whatsappMessage: 'Olá! Tenho interesse no produto: {produto} ({preco}).',
  heroTitle: 'Produtos com preço de leilão',
  heroSubtitle:
    'Itens de devolução da Amazon e de outras lojas, revisados e prontos para você.',
}

const SAMPLE_PRODUCTS = [
  {
    title: 'Fone de ouvido Bluetooth (devolução Amazon)',
    description:
      'Fone sem fio com estojo de carregamento. Produto de devolução, testado e funcionando. Acompanha cabo USB.',
    priceCents: 14990,
    status: 'AVAILABLE',
    images: [
      'https://picsum.photos/seed/fone1/900/700',
      'https://picsum.photos/seed/fone2/900/700',
    ],
  },
  {
    title: 'Cafeteira elétrica 15 xícaras',
    description:
      'Cafeteira em bom estado, com pequenas marcas de uso na base. Funcionamento perfeito.',
    priceCents: 8990,
    status: 'RESERVED',
    images: ['https://picsum.photos/seed/cafe1/900/700'],
  },
  {
    title: 'Aspirador de pó vertical sem fio',
    description:
      'Aspirador portátil com bateria recarregável. Bateria segura bem a carga. Vem com bico para cantos.',
    priceCents: 24990,
    status: 'SOLD',
    images: ['https://picsum.photos/seed/aspirador1/900/700'],
  },
]

async function main() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    })
  }
  console.log('Configurações padrão garantidas.')

  const count = await prisma.product.count()
  if (count === 0) {
    for (const sample of SAMPLE_PRODUCTS) {
      await prisma.product.create({
        data: {
          title: sample.title,
          description: sample.description,
          priceCents: sample.priceCents,
          status: sample.status,
          published: true,
          images: {
            create: sample.images.map((url, index) => ({
              url,
              sortOrder: index,
            })),
          },
        },
      })
    }
    console.log(`${SAMPLE_PRODUCTS.length} produtos de exemplo criados.`)
  } else {
    console.log('Já existem produtos cadastrados; nada foi criado.')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
