import test from "node:test"
import assert from "node:assert/strict"

import type { ContactMessageDoc } from "@/lib/schemas"
import { toContactMessageFirestoreDoc } from "@/lib/contact-message-doc"

test("toContactMessageFirestoreDoc omits the document id while preserving replies", () => {
  const contact: ContactMessageDoc = {
    id: "contact_123",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+233000000000",
    inquiryType: "general",
    message: "Need help with a device.",
    status: "replied",
    read: true,
    replies: [
      {
        id: "reply_1",
        channel: "email",
        subject: "Re: Your message",
        message: "We can help.",
        sentAt: "2026-04-10T10:00:00.000Z",
        sentBy: "Admin",
      },
    ],
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
  }

  const firestoreDoc = toContactMessageFirestoreDoc(contact)

  assert.equal("id" in firestoreDoc, false)
  assert.deepEqual(firestoreDoc.replies, contact.replies)
  assert.equal(firestoreDoc.status, "replied")
})