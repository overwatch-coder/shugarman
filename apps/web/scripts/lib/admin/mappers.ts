import type { AdminDoc } from "../../../lib/schemas"

export const DEFAULT_ADMIN_EMAIL = "bellamoner98@gmail.com"
export const DEFAULT_ADMIN_DISPLAY_NAME = "Bella Moner"

interface BuildAdminDocInput {
  uid: string
  email: string
  displayName?: string
  existingCreatedAt?: string
  nowIso: string
}

function isValidIsoTimestamp(value: string | undefined): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
}

export function buildAdminDoc(input: BuildAdminDocInput): AdminDoc {
  return {
    uid: input.uid,
    email: input.email,
    displayName: input.displayName?.trim() || DEFAULT_ADMIN_DISPLAY_NAME,
    role: "admin",
    createdAt: isValidIsoTimestamp(input.existingCreatedAt) ? input.existingCreatedAt : input.nowIso,
  }
}