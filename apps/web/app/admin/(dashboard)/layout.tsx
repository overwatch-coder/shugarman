import { redirect } from "next/navigation"
import { getSession } from "@/lib/admin-auth"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/admin/login")

  return <AdminShell admin={session}>{children}</AdminShell>
}
