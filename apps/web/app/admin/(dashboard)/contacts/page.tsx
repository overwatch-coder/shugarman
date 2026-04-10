import { ContactsClient } from "@/components/admin/contacts-client"
import { getContactMessages } from "@/lib/actions/contacts"

export default async function AdminContactsPage() {
  const messages = await getContactMessages()
  return <ContactsClient initialMessages={messages} />
}