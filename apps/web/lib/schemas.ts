/* ==========================================================================
   Firestore Data Schemas — mirrors existing storefront-types + orders
   ========================================================================== */

// ─── Products ─────────────────────────────────────────────────────────────────

export type ProductCondition = "new" | "refurbished"

export interface ProductColor {
  name: string
  hex: string
  /** Indices into the `images` array that belong to this colour variant */
  imageIndices?: number[]
}

export interface ProductStorage {
  label: string
  value: string
}

export interface InstallmentPlan {
  downPaymentPercent: number
  downPayment: number
  weeklyRate: number
  weeks: number
  totalPrice: number
  interestNote: string
}

export interface TechSpec {
  label: string
  value: string
}

export interface ProductImage {
  src: string
  alt: string
}

/** Firestore: /products/{slug} */
export interface ProductDoc {
  slug: string
  name: string
  brand: string
  price: number
  currency: string
  condition: ProductCondition
  subtitle: string
  category: string
  image: string
  imageAlt: string
  badge?: string
  inStock: boolean
  featured: boolean
  rating: number
  reviewCount: number
  colors: ProductColor[]
  storageOptions: ProductStorage[]
  images: ProductImage[]
  specs: TechSpec[]
  installment: InstallmentPlan | null
  relatedSlugs: string[]
  createdAt: string    // ISO timestamp
  updatedAt: string    // ISO timestamp
}

/** Firestore: /categories/{slug} */
export interface CategoryDoc {
  slug: string
  name: string
  order: number
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export type PaymentMethodType = "momo" | "cash" | "installment"

export interface OrderShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  notes: string
}

export interface OrderShippingMethod {
  id: string
  label: string
  price: number
  estimate: string
}

export interface OrderPaymentMethod {
  type: PaymentMethodType
  momoProvider?: string
  momoNumber?: string
}

export interface OrderLineItem {
  slug: string
  name: string
  variant: string
  image: string
  price: number
  currency: string
  quantity: number
}

/** Firestore: /orders/{orderId} */
export interface OrderDoc {
  id: string
  status: OrderStatus
  customer: OrderShippingAddress
  shipping: OrderShippingMethod
  payment: OrderPaymentMethod
  items: OrderLineItem[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  notes: string
  createdAt: string   // ISO timestamp
  updatedAt: string   // ISO timestamp
}

// ─── Store Settings ───────────────────────────────────────────────────────────

export interface StoreHours {
  day: string
  open: string
  close: string
  status: "open" | "closed"
}

export interface SocialLink {
  platform: string
  handle: string
  url: string
}

/** Firestore: /settings/store */
export interface StoreSettingsDoc {
  name: string
  tagline: string
  description: string
  phone: string
  whatsapp: string
  email: string
  address: string
  city: string
  region: string
  country: string
  hours: StoreHours[]
  social: SocialLink[]
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export type AdminRole = "admin" | "owner" | "manager" | "editor"

/** Firestore: /admins/{uid} */
export interface AdminDoc {
  uid: string
  email: string
  displayName: string
  role: AdminRole
  createdAt: string
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationLevel = "info" | "warning" | "error" | "success"

export type NotificationEvent =
  | "new_order"
  | "low_stock"
  | "catalog_change"
  | "settings_change"
  | "image_upload_failure"

/** Firestore: /notifications/{id} */
export interface NotificationDoc {
  id: string
  event: NotificationEvent
  level: NotificationLevel
  title: string
  message: string
  read: boolean
  /** slug, orderId, etc. — identifies the related resource */
  resourceSlug?: string
  resourceType?: "product" | "order" | "brand" | "category" | "settings"
  createdAt: string
}

// ─── Brands (content) ─────────────────────────────────────────────────────────

/** Firestore: /brands/{slug} */
export interface BrandDoc {
  name: string
  slug: string
  logo?: string
  featured: boolean
}

// ─── Home Content ─────────────────────────────────────────────────────────────

export interface HeroBannerDoc {
  headline: string
  subheadline: string
  ctaLabel: string
  ctaHref: string
  image?: string
  active: boolean
}

export interface BentoCategoryDoc {
  title: string
  subtitle?: string
  href: string
  image?: string
  imageAlt?: string
  icon?: string
  variant: "large" | "medium" | "accent"
  order: number
}

export interface TrustPointDoc {
  icon: string
  title: string
  description: string
  order: number
}

/** Firestore: /content/home */
export interface HomeContentDoc {
  hero: HeroBannerDoc
  categories: BentoCategoryDoc[]
  trustPoints: TrustPointDoc[]
}
