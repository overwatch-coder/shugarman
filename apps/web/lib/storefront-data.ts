import type {
  AboutPageContent,
  BentoCategory,
  Brand,
  CartItem,
  CartSummary,
  ContactPageContent,
  FilterState,
  FooterColumn,
  NavLink,
  ProductCard,
  ProductDetail,
  RepairsPageContent,
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
      platform: "Facebook",
      handle: "Shugarman",
      url: "https://facebook.com/Shugarman",
    },
    {
      platform: "Instagram",
      handle: "@Shugarman_istore",
      url: "https://instagram.com/Shugarman_istore",
    },
    {
      platform: "TikTok",
      handle: "@Shugarman_istore",
      url: "https://tiktok.com/@Shugarman_istore",
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
  { label: "Repairs", href: "/repairs" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
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
    href: "/shop?condition=new",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwd8snyiDb8vD17fdgc9f0rlKwPPINUNYK0MnM3CJPrJjEnD3t8vz4Px0EdrwcTvdeI4XRL5QCUfxsSqGKnf_A_9kXjlukkBvz_-LuBYsCQTXxjsSvG7_vPPZKuoPQF0RDYiTvh_8LkNq7JqmGdtBcw562s6KArHjUAVax7LGzWFResWmqkD_ubXUJCtriw8YIOV8v-JZcDdab1STUYXCTd9KGUjhhB2lC-JOxnZ0EqptWxoEHpyXzrkDTZBrCQ7FairY9R0VUeRM",
    imageAlt:
      "A lineup of premium smartphones staged in a dark, cinematic studio.",
    variant: "large",
  },
  {
    title: "Refurbished",
    href: "/shop?condition=refurbished",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2JXc7QatZzTcQDKSZW23IG5zgU1_IPIryJ9IjT16ktVagqHXJCbVMxIzdfW4Ljgl7S6dkMdz8YVw1CK1uGTToQ1VwpxoDKej8kzGFSt7p87WVy5SrzsyMqCXtI7H0kKqGivC-rKfCyLoAdIfAnczqQBTjr-kpIFzLkBfWr4Sun92Rw9qqeuWVKKnnT6yq1f9dZP0XwY9ojv0sc9RbgOt7BJ3i-sLMuRO_Q0M6PMl6xoVXl93sQeHdMloWOOs1HgjSzzblEUG71qQ",
    imageAlt: "A refurbished iPhone with premium studio lighting.",
    variant: "medium",
  },
  {
    title: "Accessories",
    href: "/shop?category=Accessories",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLPMEZCOhMW3UmslazRPPRyC4DGhzzIwcgLnQiWSDN0G3EC1Kxke1hW736JlKN_wzIyxLL7l61zTaLPaAwTLnJaOf5Lh-k13X6aFWObKT_xExLu5qVIjxEVfABiYecYGjVHohOoaCr1Zdf7LAbQu79RnNgu3tiZAoNK-mFCxJbM9upXazUVzzTiYKCOhgXk5Aa4nNmt7Anbh9DeYBVi5Jz7bLiV0GBDhJMIMcXXnj9YTaH5r8xpqTd065tmJL5hD6GxSma5CF6l54",
    imageAlt: "Accessories arranged on a dark textured surface.",
    variant: "medium",
  },
  {
    title: "Repairs",
    href: "/repairs",
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
      { label: "New Releases", href: "/shop?condition=new&sort=newest" },
      { label: "Certified Refurbished", href: "/shop?condition=refurbished" },
      { label: "Technical Repairs", href: "/repairs" },
      { label: "Trade-in Program", href: "#trade-in" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
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

/* ==========================================================================
   Repairs Page Content
   ========================================================================== */

export const repairsPageContent: RepairsPageContent = {
  hero: {
    badge: "Certified Repair Centre",
    headline: "Expert Device Repair You Can Trust",
    subheadline:
      "From cracked screens to battery swaps, our certified technicians restore your device to peak condition — fast, affordable, and warranty-backed.",
    ctaLabel: "Book a Repair via WhatsApp",
    ctaHref: "https://wa.me/233558694853",
  },
  categories: [
    {
      id: "screen",
      title: "Screen & Display",
      description: "Original or premium OEM-quality replacements with full touch calibration.",
      services: [
        {
          id: "iphone-screen",
          name: "iPhone Screen Replacement",
          description: "OLED / LCD replacement with touch and Face ID calibration. Original quality parts.",
          icon: "smartphone",
          priceFrom: 350,
          currency: "GHC",
          turnaround: "1 – 2 hours",
          warranty: "90 days",
          popular: true,
        },
        {
          id: "samsung-screen",
          name: "Samsung Screen Replacement",
          description: "Super AMOLED replacements for all Galaxy S and A series models.",
          icon: "smartphone",
          priceFrom: 320,
          currency: "GHC",
          turnaround: "1 – 3 hours",
          warranty: "90 days",
        },
        {
          id: "other-screen",
          name: "Other Brand Screens",
          description: "Tecno, Infinix, Huawei, Oppo and Realme screen replacements.",
          icon: "smartphone",
          priceFrom: 180,
          currency: "GHC",
          turnaround: "Same day",
          warranty: "60 days",
        },
      ],
    },
    {
      id: "battery",
      title: "Battery & Charging",
      description: "Restore all-day battery life with genuine-spec cells and charge port servicing.",
      services: [
        {
          id: "battery-replace",
          name: "Battery Replacement",
          description: "Genuine-capacity battery swap for iPhone, Samsung and most Android brands.",
          icon: "battery-charging",
          priceFrom: 150,
          currency: "GHC",
          turnaround: "30 – 60 mins",
          warranty: "60 days",
          popular: true,
        },
        {
          id: "charge-port",
          name: "Charging Port Repair",
          description: "Clean, repair or replace USB-C / Lightning ports that won't charge or sync.",
          icon: "plug",
          priceFrom: 120,
          currency: "GHC",
          turnaround: "1 – 2 hours",
          warranty: "60 days",
        },
      ],
    },
    {
      id: "water",
      title: "Water & Physical Damage",
      description: "Ultrasonic cleaning and component-level board repair for liquid and impact damage.",
      services: [
        {
          id: "water-damage",
          name: "Water Damage Treatment",
          description: "Disassembly, ultrasonic board cleaning and corrosion treatment to recover your device.",
          icon: "droplets",
          priceFrom: null,
          currency: "GHC",
          turnaround: "24 – 48 hours",
          warranty: "30 days",
        },
        {
          id: "back-glass",
          name: "Back Glass Replacement",
          description: "Restore the original look and structural integrity with a premium back glass panel.",
          icon: "layers",
          priceFrom: 200,
          currency: "GHC",
          turnaround: "2 – 4 hours",
          warranty: "60 days",
        },
      ],
    },
    {
      id: "software",
      title: "Software & Diagnostics",
      description: "Professional flashing, unlocking, data transfer and full device health checks.",
      services: [
        {
          id: "software-repair",
          name: "Software Repair & Flashing",
          description: "Fix bootloops, factory reset, OS reinstall and network unlock for all brands.",
          icon: "terminal",
          priceFrom: 80,
          currency: "GHC",
          turnaround: "1 – 3 hours",
          warranty: "N/A",
        },
        {
          id: "data-transfer",
          name: "Data Transfer & Backup",
          description: "Safe migration of contacts, photos, messages and apps to your new or repaired device.",
          icon: "hard-drive",
          priceFrom: 60,
          currency: "GHC",
          turnaround: "1 – 2 hours",
          warranty: "N/A",
        },
        {
          id: "diagnostics",
          name: "Full Device Diagnostics",
          description: "Comprehensive 30-point health check with written report — free with any repair.",
          icon: "stethoscope",
          priceFrom: 50,
          currency: "GHC",
          turnaround: "Under 30 mins",
          warranty: "N/A",
        },
      ],
    },
  ],
  whyChooseUs: [
    {
      icon: "badge-check",
      title: "Certified Technicians",
      description:
        "Our engineers are trained on Apple, Samsung and Android platforms to deliver precision repairs.",
    },
    {
      icon: "shield-check",
      title: "Warranty on Every Repair",
      description:
        "All repairs come with a 30 – 90 day warranty. If the same fault returns, we fix it for free.",
    },
    {
      icon: "clock",
      title: "Fast Turnaround",
      description:
        "Most screen and battery repairs are done within the hour while you wait in-store.",
    },
    {
      icon: "wallet",
      title: "Transparent Pricing",
      description:
        "We quote before we start. No hidden costs, no surprises — just honest repair pricing.",
    },
  ],
  faqs: [
    {
      question: "How long does a typical repair take?",
      answer:
        "Screen and battery replacements usually take 30 minutes to 2 hours. Water damage and board-level repairs may take 24 – 48 hours. We'll give you a precise estimate when you bring in your device.",
    },
    {
      question: "Do you use original parts?",
      answer:
        "We use OEM-quality or genuine manufacturer parts for all screen and battery replacements. We'll always let you know the part grade before starting.",
    },
    {
      question: "Will my data be safe?",
      answer:
        "Yes. We never wipe your data without your explicit consent. For water-damage cases we recommend a backup first — we can help with that too.",
    },
    {
      question: "Can I track the status of my repair?",
      answer:
        "Absolutely. Drop us a WhatsApp message with your name and we'll send you a real-time update on your device's status.",
    },
    {
      question: "Do you repair devices still under manufacturer warranty?",
      answer:
        "Third-party repairs may void the manufacturer warranty. We'll advise you on the best route — including referral to the official service centre if that's what's best for you.",
    },
  ],
}

/* ==========================================================================
   About Page Content
   ========================================================================== */

export const aboutPageContent: AboutPageContent = {
  hero: {
    badge: "Kumasi's Trusted Phone Store",
    headline: "We Believe Every Person Deserves a Great Phone",
    subheadline:
      "Sugar Man iStore was built on one simple conviction: premium smartphones shouldn't be out of reach for anyone in Kumasi.",
  },
  story: {
    heading: "Our Story",
    paragraphs: [
      "Sugar Man iStore opened its doors in the heart of Kumasi's Adum district with a singular mission — to make world-class smartphones accessible to every Ghanaian. We've seen how a great device can transform education, business and daily life, and we wanted to be the store that breaks down the price barrier.",
      "Located at the iconic Asempa Pharmacy Building near the Otumfour Statue, we've grown from a small retail counter into Kumasi's go-to destination for new phones, certified refurbished devices, expert repairs, and flexible installment plans that fit real budgets.",
      "Every phone we sell is personally vetted. Every repair is done by trained technicians. And every customer walks out knowing we stand behind our work.",
    ],
  },
  mission: {
    heading: "Our Mission",
    statement:
      "To democratize access to premium mobile technology in Ghana — sold with integrity, backed by expertise, and built around the community we serve.",
  },
  values: [
    {
      icon: "heart-handshake",
      title: "Community First",
      description:
        "We are a Kumasi store, serving Kumasi people. Every decision we make puts our community's needs at the centre.",
    },
    {
      icon: "badge-check",
      title: "Integrity in Every Sale",
      description:
        "No hidden fees, no misleading specs. We give honest advice even if it means recommending a cheaper device.",
    },
    {
      icon: "zap",
      title: "Expertise You Can Rely On",
      description:
        "Our team keeps up with every new release and repair technique so you get accurate guidance every time.",
    },
    {
      icon: "users",
      title: "Flexible for Everyone",
      description:
        "50% down and the rest over 12 weeks. We built installment plans so no one is priced out of their dream device.",
    },
  ],
  milestones: [
    {
      year: "2021",
      title: "Store Opens",
      description: "Sugar Man iStore launches in Adum, Kumasi, selling new and refurbished smartphones.",
    },
    {
      year: "2022",
      title: "Repair Centre Launched",
      description: "We hire certified technicians and open a dedicated repair station for all major brands.",
    },
    {
      year: "2023",
      title: "Installment Plans Introduced",
      description: "Our 50% down / 12-week payment plan makes premium phones accessible to thousands more customers.",
    },
    {
      year: "2024",
      title: "Social Community Grows",
      description: "15 000+ followers across Instagram and TikTok, sharing unboxings, reviews and repair tips.",
    },
    {
      year: "2025",
      title: "iStore.com Launches",
      description: "Our online storefront goes live, bringing the Sugar Man iStore experience to all of Ghana.",
    },
  ],
  team: [
    {
      id: "emmanuel",
      name: "Emmanuel Fosu",
      role: "Founder & CEO",
      bio: "Emmanuel founded Sugar Man iStore with a passion for making great technology accessible. He personally oversees every product selection and pricing decision.",
    },
    {
      id: "repair-lead",
      name: "Repair Team",
      role: "Certified Technicians",
      bio: "Our technicians are trained on Apple, Samsung and Android platforms. They bring precision, speed and transparency to every job that comes through the door.",
    },
  ],
  stats: [
    { label: "Phones Sold", value: "2,000+" },
    { label: "Happy Customers", value: "1,800+" },
    { label: "Repairs Completed", value: "500+" },
    { label: "Brands Carried", value: "7+" },
  ],
}

/* ==========================================================================
   Contact Page Content
   ========================================================================== */

export const contactPageContent: ContactPageContent = {
  hero: {
    badge: "Get in Touch",
    headline: "We're Here to Help",
    subheadline:
      "Have a question about a phone, a repair, or an installment plan? Reach out through any channel below and we'll respond promptly.",
  },
  channels: [
    {
      id: "whatsapp",
      icon: "whatsapp",
      label: "WhatsApp",
      value: "0558 694 853",
      href: "https://wa.me/233558694853",
      description: "Fastest response. Chat with us directly — product queries, repair bookings, anything.",
      cta: "Open WhatsApp Chat",
    },
    {
      id: "phone",
      icon: "phone",
      label: "Call Us",
      value: "0558 694 853",
      href: "tel:+233558694853",
      description: "Prefer a call? Ring us during business hours Mon – Sat, 8:00 AM – 5:00 PM.",
      cta: "Call Now",
    },
    {
      id: "phone-alt",
      icon: "phone-call",
      label: "Alternate Line",
      value: "0595 458 055",
      href: "tel:+233595458055",
      description: "Secondary line available during store hours if the primary is busy.",
      cta: "Call Alternate",
    },
    {
      id: "email",
      icon: "mail",
      label: "Email",
      value: "fosuemmanuel2001@gmail.com",
      href: "mailto:fosuemmanuel2001@gmail.com",
      description: "For detailed inquiries, quotations, or business partnerships. We reply within 24 hours.",
      cta: "Send an Email",
    },
  ],
  inquiryTypes: [
    { value: "general", label: "General Inquiry" },
    { value: "product", label: "Product & Pricing" },
    { value: "repair", label: "Device Repair" },
    { value: "installment", label: "Installment Plans" },
    { value: "trade-in", label: "Trade-in" },
    { value: "other", label: "Other" },
  ],
  mapEmbedNote: "Asempa Pharmacy Building, near Otumfour Statue, Adum, Kumasi, Ghana",
}
