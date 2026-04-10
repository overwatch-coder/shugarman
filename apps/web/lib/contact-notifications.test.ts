import test from "node:test"
import assert from "node:assert/strict"

import { buildContactNotification } from "./contact-notifications"

test("buildContactNotification creates a new contact alert for admins", () => {
  const notification = buildContactNotification(
    {
      name: "Kwame Mensah",
      email: "kwame@example.com",
      inquiryType: "repair",
    },
    "contact-123",
    "2026-04-10T09:00:00.000Z"
  )

  assert.deepEqual(notification, {
    event: "new_contact",
    level: "info",
    title: "New contact message",
    message: "Kwame Mensah sent a repair inquiry.",
    read: false,
    resourceSlug: "contact-123",
    resourceType: "contact",
    createdAt: "2026-04-10T09:00:00.000Z",
  })
})

test("buildContactNotification falls back to email when sender name is blank", () => {
  const notification = buildContactNotification(
    {
      name: "   ",
      email: "kwame@example.com",
      inquiryType: "general",
    },
    "contact-123",
    "2026-04-10T09:00:00.000Z"
  )

  assert.equal(notification.message, "kwame@example.com sent a general inquiry.")
})