import type {
  BentoCategory,
  Brand,
  CartItem,
  CartSummary,
  FilterState,
  FooterColumn,
  NavLink,
  ProductCard,
  ProductDetail,
  StoreMetadata,
  TrustPoint,
} from "./storefront-types"

export const storeMetadata: StoreMetadata = {
  name: "Sugar Man iStore",
  tagline: "Every Phone. Every Price. Every Person.",
  description:
    "Premium smartphone retail, accessories, and device support in the heart of Kumasi with flexible installment options.",
  phone: "0558694853",
  whatsapp: "233558694853",
  email: "fosuemmanuel2001@gmail.com",
  address: "Asempa Pharmacy Building, close to Otumfour Statue",
  city: "Kumasi, Adum",
  region: "Ashanti Region",
  country: "Ghana",
  hours: [
    { day: "Mon", open: "8:00 AM", close: "5:00 PM", status: "open" },
    { day: "Tue", open: "8:00 AM", close: "5:00 PM", status: "open" },
    { day: "Wed", open: "8:00 AM", close: "5:00 PM", status: "open" },
    { day: "Thu", open: "8:00 AM", close: "5:00 PM", status: "open" },
    { day: "Fri", open: "8:00 AM", close: "5:00 PM", status: "open" },
    { day: "Sat", open: "8:00 AM", close: "5:00 PM", status: "open" },
    { day: "Sun", open: "-", close: "-", status: "closed" },
  ],
  social: [
    {
      platform: "Instagram",
      handle: "@Shugarman_istore",
      url: "https://instagram.com/Shugarman_istore",
    },
    {
      platform: "WhatsApp",
      handle: "0558694853",
      url: "https://wa.me/233558694853",
    },
  ],
}

export const navigationLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Repairs", href: "#repairs" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
]

export const featuredBrands: Brand[] = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Huawei", slug: "huawei" },
  { name: "Oppo", slug: "oppo" },
  { name: "Realme", slug: "realme" },
  { name: "Tecno", slug: "tecno" },
  { name: "Infinix", slug: "infinix" },
]

export const homeCategories: BentoCategory[] = [
  {
    title: "New Phones",
    subtitle: "The latest flagships, sealed and ready.",
    href: "/shop",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwd8snyiDb8vD17fdgc9f0rlKwPPINUNYK0MnM3CJPrJjEnD3t8vz4Px0EdrwcTvdeI4XRL5QCUfxsSqGKnf_A_9kXjlukkBvz_-LuBYsCQTXxjsSvG7_vPPZKuoPQF0RDYiTvh_8LkNq7JqmGdtBcw562s6KArHjUAVax7LGzWFResWmqkD_ubXUJCtriw8YIOV8v-JZcDdab1STUYXCTd9KGUjhhB2lC-JOxnZ0EqptWxoEHpyXzrkDTZBrCQ7FairY9R0VUeRM",
    imageAlt:
      "A lineup of premium smartphones staged in a dark, cinematic studio.",
    variant: "large",
  },
  {
    title: "Refurbished",
    href: "/shop",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2JXc7QatZzTcQDKSZW23IG5zgU1_IPIryJ9IjT16ktVagqHXJCbVMxIzdfW4Ljgl7S6dkMdz8YVw1CK1uGTToQ1VwpxoDKej8kzGFSt7p87WVy5SrzsyMqCXtI7H0kKqGivC-rKfCyLoAdIfAnczqQBTjr-kpIFzLkBfWr4Sun92Rw9qqeuWVKKnnT6yq1f9dZP0XwY9ojv0sc9RbgOt7BJ3i-sLMuRO_Q0M6PMl6xoVXl93sQeHdMloWOOs1HgjSzzblEUG71qQ",
    imageAlt: "A refurbished iPhone with premium studio lighting.",
    variant: "medium",
  },
  {
    title: "Accessories",
    href: "/shop",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLPMEZCOhMW3UmslazRPPRyC4DGhzzIwcgLnQiWSDN0G3EC1Kxke1hW736JlKN_wzIyxLL7l61zTaLPaAwTLnJaOf5Lh-k13X6aFWObKT_xExLu5qVIjxEVfABiYecYGjVHohOoaCr1Zdf7LAbQu79RnNgu3tiZAoNK-mFCxJbM9upXazUVzzTiYKCOhgXk5Aa4nNmt7Anbh9DeYBVi5Jz7bLiV0GBDhJMIMcXXnj9YTaH5r8xpqTd065tmJL5hD6GxSma5CF6l54",
    imageAlt: "Accessories arranged on a dark textured surface.",
    variant: "medium",
  },
  {
    title: "Repairs",
    href: "#repairs",
    icon: "wrench",
    variant: "medium",
  },
  {
    title: "Installment Plans",
    subtitle: "Buy now, pay later",
    href: "/shop/iphone-15",
    icon: "badge-cent",
    variant: "accent",
  },
]

export const trustPoints: TrustPoint[] = [
  {
    icon: "badge-check",
    title: "Authenticity Guaranteed",
    description:
      "Every device is vetted by our engineers and comes with warranty-backed confidence.",
  },
  {
    icon: "zap",
    title: "Express Kumasi Delivery",
    description:
      "Order early and receive your device the same day within the Kumasi metropolitan area.",
  },
  {
    icon: "shield-check",
    title: "After-Sales Care",
    description:
      "Enjoy setup assistance, migration support, and dependable device care after purchase.",
  },
]

export const footerColumns: FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "New Releases", href: "/shop" },
      { label: "Certified Refurbished", href: "/shop" },
      { label: "Technical Repairs", href: "#repairs" },
      { label: "Trade-in Program", href: "#trade-in" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Shipping Info", href: "#shipping" },
      { label: "Store Locator", href: "#contact" },
    ],
  },
]

export const products: ProductCard[] = [
  {
    slug: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 9500,
    currency: "GHC",
    condition: "refurbished",
    subtitle: "Refurbished - Grade A",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCMYckldbu-EPU378uCYB0dU0iJNOXTuE1nSuKuE57z-3exUjyQjMkwJUY7PL6AraFUvmXTQgKJRQqqIkOcgsucqiR-Gbpp6UMPCTKAyDt5UYgj0kRXptQ0LFAi1KAP4b3yrjOPB6koQDb-_fKB9xUrqlelnhmHMUZJQbMFsjJ1LBVsFRHNXML6rmoscCTFgzmZ4sNWinoPxgyIM-HW_1ae8o4ify_-940j1VwtUhQcgv5aXUTZuy0PPwljl3NwyfhJoIsaxSky9OI",
    imageAlt: "iPhone 15 Pro Max in a dramatic studio setup.",
    badge: "-15%",
  },
  {
    slug: "galaxy-s23-ultra",
    name: "Galaxy S23 Ultra",
    brand: "Samsung",
    price: 11200,
    currency: "GHC",
    condition: "new",
    subtitle: "Brand New / Unlocked",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqAPSkVzur30_S5wocRRZg7weWY9jeOInWk5e8g8zPDSSZdD835w32Hm3BnEDgnDOx_MTmVcOm1KdJqm9BDAqGuzy2AXzuqs76LqifA7PbZJWHRkq0q8ZfYn4Orkj_7-21ig6M2ueUgm7ASlde1BJsGLC_0LFU4Lt6I95HDpMbUxzReK8OmdJpgrclf7UlaNfOtZLH7pJ_Q0KVJoryHMt9m0eXDRp0tEX-Ep_fhVK-8_AdNuTnkROYDF_S3HroFXcssynDE_gvecU",
    imageAlt: "Galaxy S23 Ultra standing with stylus in a dark product scene.",
  },
  {
    slug: "google-pixel-8-pro",
    name: "Google Pixel 8 Pro",
    brand: "Google",
    price: 7800,
    currency: "GHC",
    condition: "new",
    subtitle: "Imported / Mint Condition",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASHxaWjy-VjAVVKyosLn24ARtPMjl3Y5097StzuSBsE5-Zj_RedBzuQWUzu6dssCyg16ap6v7xSrYWm_sUUFJmWrZV08lrV3LagkI-IAwwFbM-5j_2lIiwrmMkxHQBqK6mL8X8jz587-XA3I_tf3TejLkW05Es15geH7Afqozi-a3773Vxe3II-ZFCLPgevG-WGIsw-H6CKa6aUqiVAm9-owAKLWpVHcQdwS448GbHQs4ViSyD-8QcSrFpULL4bejhxQr9z-zK-0s",
    imageAlt: "Pixel 8 Pro in white against a dark stone surface.",
  },
  {
    slug: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 3500,
    currency: "GHC",
    condition: "new",
    subtitle: "Premium Audio",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvXHbPAGkJkelgTROFn5uMOUwnJsbp7BxU731ixeF2qosx2zoSD_ZxG6KHhusuMJxwxoVqkkMo1636cNQh3iVoXN725ZBT7M8eNNhpXiESi1mfCc9gITdnXWNUUnMXZH6AIW6IuxhpxKH48E5nx1bxh_JiDYmtLWd6JB92-DNf6ZqalN6U6W4iLZvusj6GBOCV8YtYU58XCSJKwB_nFna149aUu61ihgHEzWcuRGcG6_dznhb4Tek2oTGNxDi6E9B_pBza97wX5U8",
    imageAlt: "Sony WH-1000XM5 headphones in matte black.",
  },
  {
    slug: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    price: 4200,
    currency: "GHC",
    condition: "new",
    subtitle: "128GB / Flexible Plan Available",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDB5EpLf8S1zmUAQgbYdjAU25pDJ9dYltb75Wbn0fOnsxfIl4L63m8VyyMoWkGGywncRICqsERXV3TDnatmrS_UKhDZYqkmbLnOWPT65HsC9K6AuGl2vN2wySOYgRx3mxJTcjH8NN8PiADw_Oh0zMqv0CMgg15UfO3k8wMAEUXYm62G1Ih7C1jtpgWXQAVT4RZhseQhjpQCGHYrNfedf4Yyiy0D_LI-Dx8cgFpJlaiX5HSpzvxSE84Z-B00yljU7m_ZxsY6jN-cWsE",
    imageAlt: "Pink iPhone 15 shown with cinematic product lighting.",
    badge: "New",
  },
  {
    slug: "ipad-pro-12-9",
    name: "iPad Pro 12.9",
    brand: "Apple",
    price: 14990,
    currency: "GHC",
    condition: "new",
    subtitle: "Space Gray | 1TB Wi-Fi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfDwKTfOUE8OUbkl1T6gee-fSZlVeA99221IJOnTsS6zqffFJGhN85u_d9xVzS35usOcXwHXzxdfL9S2GM8b8v7OWOtHerKjNfBy0a_GSACQ_hIrXT6Bj4poACBcKqC_kdsRslaygOVMhhBZjL46qqd6pVfV_nYeITde6xck021NsQhg4nnaofyJV3tP1dPmjy_KXS9d4msPwsfEwlKDoqsZI0pxeziaWjVA-WhrvA-LKMhIaHgNUfqVqwxWOT4xAI98Cb9qEjiLI",
    imageAlt: "iPad Pro with red abstract wallpaper.",
    badge: "New",
  },
]

const iPhone15Detail: ProductDetail = {
  slug: "iphone-15",
  name: "iPhone 15",
  brand: "Apple",
  price: 4200,
  currency: "GHC",
  condition: "new",
  rating: 4.5,
  reviewCount: 124,
  colors: [
    { name: "Rose", hex: "#EF4444" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Yellow", hex: "#FACC15" },
    { name: "White", hex: "#F3F4F6" },
    { name: "Black", hex: "#171717" },
  ],
  storageOptions: [
    { label: "128GB", value: "128gb" },
    { label: "256GB", value: "256gb" },
    { label: "512GB", value: "512gb" },
  ],
  inStock: true,
  images: [
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDB5EpLf8S1zmUAQgbYdjAU25pDJ9dYltb75Wbn0fOnsxfIl4L63m8VyyMoWkGGywncRICqsERXV3TDnatmrS_UKhDZYqkmbLnOWPT65HsC9K6AuGl2vN2wySOYgRx3mxJTcjH8NN8PiADw_Oh0zMqv0CMgg15UfO3k8wMAEUXYm62G1Ih7C1jtpgWXQAVT4RZhseQhjpQCGHYrNfedf4Yyiy0D_LI-Dx8cgFpJlaiX5HSpzvxSE84Z-B00yljU7m_ZxsY6jN-cWsE",
      alt: "Pink iPhone 15 front and back presentation image.",
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTQ-qPPOsh-FQzWLsJSIUvCYm1-oT_m-ehNy_v9CRL76mmY8-10SpkFFTetk0bbccBY3HrVgEclpyJKq7XwhxVx1a-1ABaM_Im5nuY_5R5nSq6J96HgV8GDqjELUG8otVDq7qagAaLRFz4izByu_BIPVq4oOFrbBz3_0UIvGd9Z1jJemqycbsYmQ7jOtVHswmNRVZUbgtH9dC7o08JrQG9izoX4yTA6QB-Uq2aRp-7Q33hpIGaNuBXVAihGN-TIXdwDZHkSX9aQIk",
      alt: "iPhone 15 display close-up thumbnail.",
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHP_qlJCf20rDet0aKTDXsdBEBeUEhjR32sMv7QqJdfLMzKgdx0XWF50RgUW2tTjAcEOfut9Tq3kboRF0TiZmhtNSO-QddnQ5_tKQOZh6_1ci80gQKCIL9SMpSFWjnMFPq5tuw_159pS4IN2JpInPfdxCqnF4SZkTuc5Q3seFWqMUkwRpIx-DnZoxNgvUjqDC7HWE7N7ZeiXVcpZ-WplYkgq73xUwBgJ9NeW5Y3Vswx_bfOOhpbHjI80-YwEiI7GIuU4PGxFiVDaI",
      alt: "iPhone 15 side profile thumbnail.",
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs5UBuE4-5zWN1eKUIhlmQZrgfVoBYKZwUWGbfQeQNUp5TxA3Ys_ELE40YC6X-zj8_VGqoD74CH0OKt0gCOoKN3_s3lMmu8dGgrCYauixt8t8QmFJ0zzGDAr9O_1gVaiYdI7e0lr0Jtj_LoUA6lKacvtgGDt_nTRVmkJlYg3TJIIuClBUiA_xlMrW1Y4r2xF-6h3CdmoA-xnaR-JRGP3qMlwdQ8wlEIOw7PG8RNNu0S3HpOF8dYAPanVoxKPDYD5L8zWmfblUkouA",
      alt: "iPhone 15 rear camera thumbnail.",
    },
  ],
  specs: [
    { label: "Display", value: '6.1" Super Retina XDR' },
    { label: "Chipset", value: "A16 Bionic" },
    { label: "Camera", value: "48MP Main | Ultra Wide" },
    { label: "Charging", value: "USB-C Precision Port" },
  ],
  installment: {
    downPaymentPercent: 50,
    downPayment: 2100,
    weeklyRate: 175,
    weeks: 12,
    totalPrice: 4200,
    interestNote: "Zero hidden interest for iStore Members.",
  },
  relatedProducts: products.slice(1, 5),
}

export const productDetails: Record<string, ProductDetail> = {
  [iPhone15Detail.slug]: iPhone15Detail,
}

export const defaultFilters: FilterState = {
  categories: ["smartphones"],
  brands: ["Apple"],
  conditions: ["new"],
  priceRange: [0, 25000],
  colors: [],
}

export const cartItems: CartItem[] = [
  {
    slug: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    variant: "Natural Titanium / 512GB / Cinematic Kit",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBWpdFv67XTgpNA31WtLHTxML6MiRgcz2qvKFjSmeChPEI_5a3gkwnrdHcaQf5Ki-bWU1KhVwlsy9ereCiPl-VtjxCi5PQGcKOjfnHl3FyUIhGlpP93UiFU6VIXmDahfdI1wOf27_Akp3WH-2NSL7OedPWru-qrqadPICFXSNz0nItOBRdqRNH_hY1Se5-JpJkyIAkXKSIn04L4V-axmFRvqPQfQN70FKuQyhKdQpdC7fTdrfvUBgDar5HTPyu2WoTRFGMIEFalsUk",
    imageAlt: "iPhone 15 Pro Max cart item image.",
    price: 13990,
    currency: "GHC",
    quantity: 1,
  },
  {
    slug: "macbook-pro-m3-max",
    name: "MacBook Pro M3 Max",
    variant: "Space Black / 64GB RAM / 2TB SSD",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvD2mpw3sj0Mzdd146vFJwERhObvZ3V2Wb56YqpBvQk-7SniYZFYNhBzPBkgl_tKGvGOPj2tNy_EZof8nixqTZ24Yk9cIlYHoOnTRzREHa4177-9ZQRVle69D2FGukxAQLxt-HXFPilEwTTLcW2uifE-a30XlXf5MDtsE1hGeDIjjufHyDNfL3bOsTmtmi4peZQlv9lx0LZ5cI4_rd4SfIAExg5269jGfdpoRfLp5wuerlksGgXDOULXyNV_6J0sWS_yF7IC7RzGc",
    imageAlt: "MacBook Pro cart item image.",
    price: 34990,
    currency: "GHC",
    quantity: 1,
  },
]

export const cartSummary: CartSummary = {
  subtotal: 48980,
  shipping: "free",
  tax: 4123.3,
  total: 53103.3,
  currency: "GHC",
  installmentMonthly: 4425.2,
  installmentMonths: 12,
}
