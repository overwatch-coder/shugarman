import { redirect } from "next/navigation"
import { getSession } from "@/lib/admin-auth"
import { AdminShell } from "@/components/admin/admin-shell"
import { getNotifications } from "@/lib/actions/notifications"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/admin/login")

  const notifications = await getNotifications(6)

  return (
    <AdminShell admin={session} initialNotifications={notifications}>
      {children}
    </AdminShell>
  )
}
