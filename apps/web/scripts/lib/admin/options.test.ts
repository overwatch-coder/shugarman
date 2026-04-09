import assert from "node:assert/strict"
import test from "node:test"

import { parseCreateAdminOptions } from "./options"

test("parseCreateAdminOptions requires a password", () => {
  assert.throws(() => parseCreateAdminOptions([]), /Missing required flag: --password/)
})

test("parseCreateAdminOptions reads password, display name, and dry-run", () => {
  assert.deepEqual(parseCreateAdminOptions([
    "--email",
    "someone@example.com",
    "--password",
    "super-secret",
    "--display-name",
    "Bella Moner",
    "--dry-run",
  ]), {
    email: "someone@example.com",
    password: "super-secret",
    displayName: "Bella Moner",
    dryRun: true,
  })
})

test("parseCreateAdminOptions allows omitted email so the caller can use the default", () => {
  assert.equal(parseCreateAdminOptions(["--password", "super-secret"]).email, undefined)
})

test("parseCreateAdminOptions rejects unknown flags", () => {
  assert.throws(() => parseCreateAdminOptions(["--password", "x", "--role", "admin"]), /Unknown flag: --role/)
})