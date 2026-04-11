"use server"

/* ==========================================================================
   Storefront Data Access Layer
   Reads from Firestore with graceful fallback to mock data.
   ========================================================================== */

import { adminDb } from "@/lib/firebase-admin"
import { normalizeHomeCategories, normalizeHomeCategoriesHeading, type HomeCategoriesHeading } from "@/lib/home-content"
import { mergeStoreMetadataWithDefaults } from "@/lib/store-metadata"
import type { HomeContentDoc, ProductDoc, StoreSettingsDoc, ReviewDoc } from "@/lib/schemas"
import type { ProductCard, ProductDetail, StoreMetadata } from "./storefront-types"
import {
  products as mockProducts,
  productDetails as mockProductDetails,
  storeMetadata as mockStoreMetadata,
  homeCategoriesHeading as defaultHomeCategoriesHeading,
  homeCategories as mockHomeCategories,
  trustPoints as mockTrustPoints,
  featuredBrands as mockFeaturedBrands,
} from "./storefront-data"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function docToCard(doc: ProductDoc): ProductCard {
  return {
    slug: doc.slug,
    name: doc.name,
    brand: doc.brand,
    price: doc.price,
    currency: doc.currency,
    condition: doc.condition,
    subtitle: doc.subtitle,
    image: doc.image,
    imageAlt: doc.imageAlt,
    badge: doc.badge,
  }
}

function docToDetail(doc: ProductDoc, relatedCards: ProductCard[]): ProductDetail {
  return {
    slug: doc.slug,
    name: doc.name,
    brand: doc.brand,
    price: doc.price,
    currency: doc.currency,
    condition: doc.condition,
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    colors: doc.colors,
    storageOptions: doc.storageOptions,
    inStock: doc.inStock,
    images: doc.images,
    specs: doc.specs,
    installment: doc.installment!,
    relatedProducts: relatedCards,
  }
}

function settingsToMetadata(doc: StoreSettingsDoc): StoreMetadata {
  return mergeStoreMetadataWithDefaults({
    name: doc.name,
    tagline: doc.tagline,
    description: doc.description,
    heroImage: doc.heroImage,
    heroImageAlt: doc.heroImageAlt,
    phone: doc.phone,
    whatsapp: doc.whatsapp,
    email: doc.email,
    address: doc.address,
    city: doc.city,
    region: doc.region,
    country: doc.country,
    hours: doc.hours,
    social: doc.social,
  }, mockStoreMetadata)
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getStorefrontProducts(): Promise<ProductCard[]> {
  try {
    const snap = await adminDb.collection("products").where("inStock", "==", true).get()
    if (snap.empty) return mockProducts
    return snap.docs.map((d) => docToCard({ slug: d.id, ...d.data() } as ProductDoc))
  } catch {
    return mockProducts
  }
}

export async function getStorefrontProductDetail(
  slug: string
): Promise<ProductDetail | null> {
  try {
    const doc = await adminDb.collection("products").doc(slug).get()
    if (!doc.exists) return mockProductDetails[slug] ?? null

    const data = { slug: doc.id, ...doc.data() } as ProductDoc

    // Fetch related products
    let related: ProductCard[] = []
    if (data.relatedSlugs?.length) {
      const relSnap = await adminDb
        .collection("products")
        .where("__name__", "in", data.relatedSlugs.slice(0, 10))
        .get()
      related = relSnap.docs.map((d) => docToCard({ slug: d.id, ...d.data() } as ProductDoc))
    }

    return docToDetail(data, related)
  } catch {
    return mockProductDetails[slug] ?? null
  }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

/** Returns only approved reviews for a product, newest first — safe for public display. */
export async function getApprovedReviewsForProduct(
  productSlug: string
): Promise<ReviewDoc[]> {
  try {
    const snap = await adminDb
      .collection("reviews")
      .where("productSlug", "==", productSlug)
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .get()
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ReviewDoc))
  } catch {
    return []
  }
}

// ─── Store Metadata ───────────────────────────────────────────────────────────

export async function getStorefrontMetadata(): Promise<StoreMetadata> {
  try {
    const doc = await adminDb.doc("settings/store").get()
    if (!doc.exists) return mockStoreMetadata
    return settingsToMetadata(doc.data() as StoreSettingsDoc)
  } catch {
    return mockStoreMetadata
  }
}

// ─── Home Content ─────────────────────────────────────────────────────────────

async function getHomeContentDoc(): Promise<HomeContentDoc | null> {
  try {
    const doc = await adminDb.doc("content/home").get()
    if (!doc.exists) return null
    return doc.data() as HomeContentDoc
  } catch {
    return null
  }
}

export async function getHomeCategoriesHeading(): Promise<HomeCategoriesHeading> {
  const homeContent = await getHomeContentDoc()
  return normalizeHomeCategoriesHeading(homeContent?.categoriesHeading, defaultHomeCategoriesHeading)
}

export async function getHomeCategories() {
  const homeContent = await getHomeContentDoc()
  return normalizeHomeCategories(homeContent?.categories, mockHomeCategories)
}

export async function getTrustPoints() {
  return mockTrustPoints
}

export async function getFeaturedBrands() {
  return mockFeaturedBrands
}
