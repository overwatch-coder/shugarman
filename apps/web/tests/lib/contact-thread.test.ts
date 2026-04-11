import test from "node:test"
import assert from "node:assert/strict"

import type { ContactMessageDoc } from "@/lib/schemas"
import { buildContactThread } from "@/lib/contact-thread"

test("buildContactThread keeps the original message and sent replies in one timeline", () => {
  const contact: ContactMessageDoc = {
    id: "contact_1",
    name: "Jane",
    email: "jane@example.com",
    phone: "",
    inquiryType: "general",
    message: "Can I get pricing?",
    status: "replied",
    read: true,
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
    replies: [
      {
        id: "reply_1",
        channel: "email",
        subject: "Re: Pricing",
        message: "Yes, here is the quote.",
        sentAt: "2026-04-10T10:00:00.000Z",
        sentBy: "Admin User",
      },
    ],
  }

  const thread = buildContactThread(contact)

  assert.equal(thread.length, 2)
  assert.equal(thread[0]?.direction, "inbound")
  assert.equal(thread[1]?.direction, "outbound")
  assert.equal(thread[1]?.byline, "Admin User")
})