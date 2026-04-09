import nextEnv from "@next/env"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { getSeedDb, getSeedProjectId } from "./lib/seed/firebase-admin-seed"
import { products as storefrontProducts } from "../lib/storefront-data"
import { buildCategoryDocs, buildProductDocs } from "./lib/seed/mappers"
import { parseSeedOptions } from "./lib/seed/options"
import {
  printFailureSummary,
  printStartupSummary,
  printSuccessSummary,
  printTouchedPaths,
} from "./lib/seed/report"
import { applySeedWrites, loadExistingCreatedAtBySlug } from "./lib/seed/write"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDirectory, "..")
const { loadEnvConfig } = nextEnv

async function main(): Promise<void> {
  loadEnvConfig(appRoot)

  const options = parseSeedOptions(process.argv.slice(2))
  const seedDb = getSeedDb()
  const categories = buildCategoryDocs()

  printStartupSummary({
    projectId: getSeedProjectId(),
    dryRun: options.dryRun,
    productCount: storefrontProducts.length,
    categoryCount: categories.length,
  })

  const productSlugs = storefrontProducts.map((product) => product.slug)
  const existingCreatedAtBySlug = await loadExistingCreatedAtBySlug(seedDb, productSlugs)
  const nowIso = new Date().toISOString()
  const products = buildProductDocs(nowIso, existingCreatedAtBySlug)

  const touchedPaths = await applySeedWrites(seedDb, products, categories, options.dryRun)

  printTouchedPaths(touchedPaths)
  printSuccessSummary(touchedPaths, options.dryRun)
}

main().catch((error) => {
  printFailureSummary(error)
  process.exitCode = 1
})