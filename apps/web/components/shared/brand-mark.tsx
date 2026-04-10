import { cn } from "@workspace/ui/lib/utils"

import { BRAND_NAME } from "@/lib/brand"

export function BrandMark({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string
  iconClassName?: string
  textClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(220,38,38,0.35)]",
          iconClassName
        )}
        aria-hidden
      >
        <svg viewBox="0 0 64 64" className="size-6 fill-none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="4" opacity="0.35" />
          <path
            d="M41 18c-3.2-2.1-7-3.2-11.2-3.2-7.6 0-13.7 4.2-13.7 10.3 0 5.4 4.3 8 11.9 9.6 6.1 1.2 8.3 2.4 8.3 4.8 0 2.6-2.7 4.4-6.9 4.4-4.3 0-8.6-1.5-12.2-4.4l-4.7 5.6c4.1 3.8 10 6 16.7 6 9.8 0 16-4.8 16-11.6 0-5.8-3.9-8.7-11.1-10.2-6.4-1.3-9.1-2.2-9.1-4.6 0-2.3 2.4-3.7 6.1-3.7 3.7 0 7 1.1 10.1 3.3L41 18Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className={cn("font-black tracking-tight", textClassName)}>{BRAND_NAME}</span>
    </span>
  )
}