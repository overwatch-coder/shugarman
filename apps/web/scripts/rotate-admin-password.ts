import nextEnv from "@next/env"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_ADMIN_EMAIL } from "./lib/admin/mappers"
import { parseCreateAdminOptions } from "./lib/admin/options"
import { getSeedAdminAuth, getSeedProjectId } from "./lib/seed/firebase-admin-seed"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDirectory, "..")
const { loadEnvConfig } = nextEnv

async function main(): Promise<void> {
  loadEnvConfig(appRoot)

  const options = parseCreateAdminOptions(process.argv.slice(2))
  const adminAuth = getSeedAdminAuth()
  const adminEmail = options.email?.trim() || DEFAULT_ADMIN_EMAIL

  console.log(`Project ID: ${getSeedProjectId()}`)
  console.log("Auth mode: service-account-env")
  console.log(`Mode: ${options.dryRun ? "dry-run" : "write"}`)
  console.log(`Admin email: ${adminEmail}`)

  const existingUser = await adminAuth.getUserByEmail(adminEmail)

  if (!options.dryRun) {
    await adminAuth.updateUser(existingUser.uid, {
      password: options.password,
    })
  }

  console.log(`Auth user: rotate-password ${adminEmail}`)
  console.log(`${options.dryRun ? "Dry run complete" : "Password rotation complete"}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Admin password rotation failed: ${message}`)
  process.exitCode = 1
})