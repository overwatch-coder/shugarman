import { getNotifications } from "@/lib/actions/notifications"
import { NotificationsClient } from "@/components/admin/notifications-client"

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications()
  return <NotificationsClient initialNotifications={notifications} />
}
