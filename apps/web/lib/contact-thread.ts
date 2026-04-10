import type { ContactMessageDoc } from "@/lib/schemas"

export type ContactThreadEntry =
  | {
      id: string
      direction: "inbound"
      title: string
      body: string
      timestamp: string
      channel: "contact"
      byline: string
    }
  | {
      id: string
      direction: "outbound"
      title: string
      body: string
      timestamp: string
      channel: "email" | "mailto"
      byline: string
    }

export function buildContactThread(contact: ContactMessageDoc): ContactThreadEntry[] {
  return [
    {
      id: `${contact.id}-incoming`,
      direction: "inbound",
      title: `${contact.name} wrote`,
      body: contact.message,
      timestamp: contact.createdAt,
      channel: "contact",
      byline: contact.email,
    },
    ...contact.replies.map((reply) => ({
      id: reply.id,
      direction: "outbound" as const,
      title: reply.subject,
      body: reply.message,
      timestamp: reply.sentAt,
      channel: reply.channel,
      byline: reply.sentBy,
    })),
  ]
}