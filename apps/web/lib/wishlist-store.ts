import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface WishlistState {
  slugs: string[]
  totalItems: number
  hasItem: (slug: string) => boolean
  toggleItem: (slug: string) => void
  clearWishlist: () => void
}

function computeTotal(slugs: string[]) {
  return slugs.length
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      totalItems: 0,
      hasItem: (slug) => get().slugs.includes(slug),
      toggleItem: (slug) =>
        set((state) => {
          const exists = state.slugs.includes(slug)
          const nextSlugs = exists
            ? state.slugs.filter((entry) => entry !== slug)
            : [...state.slugs, slug]

          return { slugs: nextSlugs, totalItems: computeTotal(nextSlugs) }
        }),
      clearWishlist: () => set({ slugs: [], totalItems: 0 }),
    }),
    {
      name: "shugarman-wishlist",
    }
  )
)