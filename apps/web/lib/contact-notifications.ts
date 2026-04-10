import type { ContactInquiryType, NotificationDoc } from "@/lib/schemas"

export function buildContactNotification(
  data: {
    name: string
    email: string
    inquiryType: ContactInquiryType
  },
  contactId: string,
  createdAt: string
): Omit<NotificationDoc, "id"> {
  const senderName = data.name.trim() || data.email

  return {
    event: "new_contact",
    level: "info",
    title: "New contact message",
    message: `${senderName} sent a ${data.inquiryType} inquiry.`,
    read: false,
    resourceSlug: contactId,
    resourceType: "contact",
    createdAt,
  }
}