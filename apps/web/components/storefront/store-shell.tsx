import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { StoreFooter } from "./store-footer"
import { StoreHeader } from "./store-header"

interface StoreShellProps {
  children: ReactNode
  className?: string
}

export function StoreShell({ children, className }: StoreShellProps) {
  return (
    <div className="min-h-screen text-foreground">
      <StoreHeader />
      <main className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8", className)}>
        {children}
      </main>
      <StoreFooter />
    </div>
  )
}
