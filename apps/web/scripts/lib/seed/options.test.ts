import test from "node:test"
import assert from "node:assert/strict"

import { parseSeedOptions } from "./options.js"

test("parseSeedOptions enables dryRun when the flag is present", () => {
  assert.deepEqual(parseSeedOptions(["--dry-run"]), { dryRun: true })
})

test("parseSeedOptions defaults dryRun to false", () => {
  assert.deepEqual(parseSeedOptions([]), { dryRun: false })
})

test("parseSeedOptions rejects unknown flags", () => {
  assert.throws(() => parseSeedOptions(["--reset"]), /Unknown flag: --reset/)
})