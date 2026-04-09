import { getStoreSettings } from "@/lib/actions/settings"
import { SettingsClient } from "@/components/admin/settings-client"

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings()
  return <SettingsClient initialSettings={settings} />
}
