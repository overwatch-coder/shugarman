import { getSession } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { AccountSettingsClient } from "@/components/admin/account-settings-client"

export default async function AdminAccountPage() {
  const session = await getSession()
  if (!session) redirect("/admin/login")

  return (
    <AccountSettingsClient
      displayName={session.displayName}
      email={session.email}
      role={session.role}
    />
  )
}
