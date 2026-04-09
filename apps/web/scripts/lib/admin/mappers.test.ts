import assert from "node:assert/strict"
import test from "node:test"

import { DEFAULT_ADMIN_DISPLAY_NAME, DEFAULT_ADMIN_EMAIL, buildAdminDoc } from "./mappers"

test("buildAdminDoc creates an admin document with role admin and a first-run createdAt", () => {
  const nowIso = "2026-04-09T12:00:00.000Z"

  assert.deepEqual(buildAdminDoc({
    uid: "uid-123",
    email: DEFAULT_ADMIN_EMAIL,
    displayName: undefined,
    existingCreatedAt: undefined,
    nowIso,
  }), {
    uid: "uid-123",
    email: DEFAULT_ADMIN_EMAIL,
    displayName: DEFAULT_ADMIN_DISPLAY_NAME,
    role: "admin",
    createdAt: nowIso,
  })
})

test("buildAdminDoc preserves an existing createdAt", () => {
  const nowIso = "2026-04-09T12:00:00.000Z"
  const existingCreatedAt = "2026-04-01T08:15:00.000Z"

  const doc = buildAdminDoc({
    uid: "uid-123",
    email: "custom-admin@example.com",
    displayName: "Bella Moner",
    existingCreatedAt,
    nowIso,
  })

  assert.equal(doc.createdAt, existingCreatedAt)
  assert.equal(doc.email, "custom-admin@example.com")
  assert.equal(doc.role, "admin")
  assert.equal(doc.displayName, "Bella Moner")
})