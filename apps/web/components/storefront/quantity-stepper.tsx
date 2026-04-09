"use client"

import { Minus, Plus } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { AnimatedCounter } from "./motion-primitives"

interface QuantityStepperProps {
  value: number
  onChange?: (value: number) => void
  className?: string
}

export function QuantityStepper({
  value,
  onChange,
  className,
}: QuantityStepperProps) {
  function updateQuantity(nextValue: number) {
    onChange?.(Math.max(1, nextValue))
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md bg-surface-high text-foreground",
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => updateQuantity(value - 1)}
        className="flex size-9 items-center justify-center text-content-secondary transition-colors hover:text-primary"
      >
        <Minus className="size-3.5" />
      </button>
      <AnimatedCounter
        value={value}
        className="min-w-8 px-2 text-center font-mono text-sm font-bold"
        formatter={(nextValue) => String(nextValue).padStart(2, "0")}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => updateQuantity(value + 1)}
        className="flex size-9 items-center justify-center text-content-secondary transition-colors hover:text-primary"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
