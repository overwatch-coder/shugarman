/* ==========================================================================
   Shugarman iStore — Storefront Type Contracts
   ========================================================================== */

export interface StoreMetadata {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  hours: { day: string; open: string; close: string; status: "open" | "closed" }[];
  social: { platform: string; handle: string; url: string }[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Brand {
  name: string;
  slug: string;
}

export type ProductCondition = "new" | "refurbished";

export interface ProductCard {
  slug: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  subtitle: string;
  image: string;
  imageAlt: string;
  badge?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductStorage {
  label: string;
  value: string;
}

export interface InstallmentPlan {
  downPaymentPercent: number;
  downPayment: number;
  weeklyRate: number;
  weeks: number;
  totalPrice: number;
  interestNote: string;
}

export interface TechSpec {
  label: string;
  value: string;
}

export interface ProductDetail {
  slug: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  rating: number;
  reviewCount: number;
  colors: ProductColor[];
  storageOptions: ProductStorage[];
  inStock: boolean;
  images: { src: string; alt: string }[];
  specs: TechSpec[];
  installment: InstallmentPlan;
  relatedProducts: ProductCard[];
}

export interface CartItem {
  slug: string;
  name: string;
  variant: string;
  image: string;
  imageAlt: string;
  price: number;
  currency: string;
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  shipping: number | "free";
  tax: number;
  total: number;
  currency: string;
  installmentMonthly?: number;
  installmentMonths?: number;
}

export type Category = "smartphones" | "tablets" | "laptops" | "wearables";

export interface FilterState {
  categories: Category[];
  brands: string[];
  conditions: ProductCondition[];
  priceRange: [number, number];
  colors: string[];
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface BentoCategory {
  title: string;
  subtitle?: string;
  href: string;
  image?: string;
  imageAlt?: string;
  icon?: string;
  variant: "large" | "medium" | "accent";
}

export interface TrustPoint {
  icon: string;
  title: string;
  description: string;
}
