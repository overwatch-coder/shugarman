import type { Firestore } from "firebase-admin/firestore"

import type { CategoryDoc, ProductDoc } from "../../../lib/schemas"

export interface TouchedPath {
  path: string
  operation: "create" | "replace"
}

function isValidIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
}

export async function loadExistingCreatedAtBySlug(
  db: Firestore,
  slugs: string[]
): Promise<Map<string, string>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const snapshot = await db.collection("products").doc(slug).get()
      const createdAt = snapshot.get("createdAt")

      return isValidIsoTimestamp(createdAt) ? [slug, createdAt] : undefined
    })
  )

  return new Map(entries.filter((entry): entry is [string, string] => Boolean(entry)))
}

export async function applySeedWrites(
  db: Firestore,
  products: ProductDoc[],
  categories: CategoryDoc[],
  dryRun: boolean
): Promise<TouchedPath[]> {
  const touchedPaths: TouchedPath[] = []

  for (const product of products) {
    const ref = db.collection("products").doc(product.slug)
    const snapshot = await ref.get()

    touchedPaths.push({
      path: `products/${product.slug}`,
      operation: snapshot.exists ? "replace" : "create",
    })

    if (!dryRun) {
      await ref.set(product)
    }
  }

  for (const category of categories) {
    const ref = db.collection("categories").doc(category.slug)
    const snapshot = await ref.get()

    touchedPaths.push({
      path: `categories/${category.slug}`,
      operation: snapshot.exists ? "replace" : "create",
    })

    if (!dryRun) {
      await ref.set(category)
    }
  }

  return touchedPaths
}