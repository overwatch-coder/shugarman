"use server"

import { adminDb } from "@/lib/firebase-admin"
import type { ProductDoc } from "@/lib/schemas"

const COLLECTION = "products"

export async function getProducts(): Promise<ProductDoc[]> {
  try {
    const snap = await adminDb.collection(COLLECTION).orderBy("updatedAt", "desc").get()
    return snap.docs.map((doc) => ({ slug: doc.id, ...doc.data() } as ProductDoc))
  } catch {
    return []
  }
}

export async function getProduct(slug: string): Promise<ProductDoc | null> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(slug).get()
    if (!doc.exists) return null
    return { slug: doc.id, ...doc.data() } as ProductDoc
  } catch {
    return null
  }
}

export async function saveProduct(data: ProductDoc): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString()
    const existing = await adminDb.collection(COLLECTION).doc(data.slug).get()

    const doc: Omit<ProductDoc, "slug"> & { updatedAt: string; createdAt: string } = {
      name: data.name,
      brand: data.brand,
      price: data.price,
      currency: data.currency || "GHC",
      condition: data.condition,
      subtitle: data.subtitle,
      category: data.category || "smartphones",
      image: data.image,
      imageAlt: data.imageAlt,
      badge: data.badge || undefined,
      inStock: data.inStock ?? true,
      featured: data.featured ?? false,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      colors: data.colors || [],
      storageOptions: data.storageOptions || [],
      images: data.images || [],
      specs: data.specs || [],
      installment: data.installment || null,
      relatedSlugs: data.relatedSlugs || [],
      createdAt: existing.exists ? (existing.data()?.createdAt ?? now) : now,
      updatedAt: now,
    }

    await adminDb.collection(COLLECTION).doc(data.slug).set(doc)
    return { success: true }
  } catch (err) {
    console.error("saveProduct:", err)
    return { success: false, error: "Failed to save product" }
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
