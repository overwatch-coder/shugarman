"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Toaster, toast } from "sonner"

import { useAppTheme } from "@/components/theme-provider"
import { consumeSuccessToast } from "@/lib/toast-flash"

export function AppToaster() {
  const pathname = usePathname()
  const { theme } = useAppTheme()

  useEffect(() => {
    const message = consumeSuccessToast()
    if (message) {
      toast.success(message)
    }
  }, [pathname])

  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme === "dark" ? "dark" : "light"}
      toastOptions={{ className: "font-body" }}
    />
  )
}