import { Suspense } from 'react'
import { Catalog } from '@/components/Catalog'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getCatalogProducts } from '@/lib/products'
import { getSettings } from '@/lib/settings'

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}

async function HomeContent() {
  const [settings, products] = await Promise.all([
    getSettings(),
    getCatalogProducts(),
  ])

  return (
    <>
      <SiteHeader settings={settings} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <section className="mb-8">
          <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            {settings.heroSubtitle}
          </p>
        </section>

        <Catalog products={products} settings={settings} />
      </main>

      <SiteFooter settings={settings} />
    </>
  )
}

function HomeSkeleton() {
  return (
    <>
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-8 space-y-3">
          <div className="h-7 w-72 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              <div className="aspect-[4/3] w-full animate-pulse bg-neutral-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-5 w-1/3 animate-pulse rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
