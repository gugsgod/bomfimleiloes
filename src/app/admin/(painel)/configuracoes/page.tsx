import { Suspense } from 'react'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { updateSettings } from '@/lib/actions/settings'
import { requireSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  await requireSession()
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
      <SettingsForm action={updateSettings} settings={settings} />
    </div>
  )
}

function Loading() {
  return <div className="h-80 animate-pulse rounded-xl bg-white" />
}
