/* ==========================================================================
   Shugarman iStore — Storefront Type Contracts
   ========================================================================== */

export interface StoreMetadata {
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  heroImageAlt: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  googleMapsUrl?: string;
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
  imageIndices?: number[];
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
  installment: InstallmentPlan | null;
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

/* ---------- Repairs page ---------- */

export interface RepairService {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Starting price in GHC. Null means "call for quote". */
  priceFrom: number | null;
  currency: string;
  turnaround: string;
  warranty: string;
  popular?: boolean;
}

export interface RepairCategory {
  id: string;
  title: string;
  description?: string;
  services: RepairService[];
}

export interface RepairFAQ {
  question: string;
  answer: string;
}

export interface RepairsPageContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaLabel: string;
    ctaHref: string;
    badge: string;
  };
  categories: RepairCategory[];
  whyChooseUs: { icon: string; title: string; description: string }[];
  faqs: RepairFAQ[];
}

/* ---------- About page ---------- */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface AboutPageContent {
  hero: {
    headline: string;
    subheadline: string;
    badge: string;
  };
  story: {
    heading: string;
    paragraphs: string[];
  };
  mission: {
    heading: string;
    statement: string;
  };
  values: { icon: string; title: string; description: string }[];
  milestones: Milestone[];
  team: TeamMember[];
  stats: { label: string; value: string }[];
}

/* ---------- Contact page ---------- */

export type ContactInquiryType =
  | "general"
  | "product"
  | "repair"
  | "installment"
  | "trade-in"
  | "other"

export interface ContactChannel {
  id: string;
  icon: string;
  label: string;
  value: string;
  href: string;
  description: string;
  cta: string;
}

export interface ContactPageContent {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
  };
  channels: ContactChannel[];
  inquiryTypes: { value: ContactInquiryType; label: string }[];
  mapEmbedNote: string;
}
