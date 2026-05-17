"use server"

import { adminDb } from "@/lib/firebase-admin"
import { normalizeCurrencyCode } from "@/lib/admin/product-editor-helpers"
import { normalizeProductDoc } from "@/lib/product-doc-normalizer"
import type { ProductDoc } from "@/lib/schemas"

const COLLECTION = "products"

export async function getProducts(): Promise<ProductDoc[]> {
  try {
    const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get()
    return snap.docs.map((doc) => normalizeProductDoc(doc.id, doc.data() as Partial<ProductDoc>))
  } catch {
    return []
  }
}

export async function getProduct(slug: string): Promise<ProductDoc | null> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(slug).get()
    if (!doc.exists) return null
    return normalizeProductDoc(doc.id, doc.data() as Partial<ProductDoc>)
  } catch {
    return null
  }
}

export async function saveProduct(data: ProductDoc): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString()
    const normalizedData = normalizeProductDoc(data.slug, data)
    const existing = await adminDb.collection(COLLECTION).doc(normalizedData.slug).get()

    const doc: Omit<ProductDoc, "slug"> & { updatedAt: string; createdAt: string } = {
      name: normalizedData.name,
      brand: normalizedData.brand,
      price: normalizedData.price,
      currency: normalizedData.currency || "GHC",
      condition: normalizedData.condition,
      subtitle: normalizedData.subtitle,
      category: normalizedData.category || "smartphones",
      image: normalizedData.image,
      imageAlt: normalizedData.imageAlt,
      ...(normalizedData.badge ? { badge: normalizedData.badge } : { badge: "" }),
      published: normalizedData.published,
      inStock: normalizedData.inStock,
      featured: normalizedData.featured,
      rating: normalizedData.rating,
      reviewCount: normalizedData.reviewCount,
      colors: normalizedData.colors,
      storageOptions: normalizedData.storageOptions,
      images: normalizedData.images,
      specs: normalizedData.specs,
      installment: normalizedData.installment,
      relatedSlugs: normalizedData.relatedSlugs,
      createdAt: existing.exists ? (existing.data()?.createdAt ?? now) : now,
      updatedAt: now,
    }

    await adminDb.collection(COLLECTION).doc(normalizedData.slug).set({
      ...doc,
      currency: normalizeCurrencyCode(doc.currency),
    })
    return { success: true }
  } catch (err) {
    console.error("saveProduct:", err)
    return { success: false, error: "Failed to save product" }
  }
}

export async function updateProductPublished(
  slug: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION).doc(slug).update({
      published,
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (err) {
    console.error("updateProductPublished:", err)
    return { success: false, error: "Failed to update product visibility" }
  }
}

export async function deleteProduct(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION).doc(slug).delete()
    return { success: true }
  } catch (err) {
    console.error("deleteProduct:", err)
    return { success: false, error: "Failed to delete product" }
  }
}
