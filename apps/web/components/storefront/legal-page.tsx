import type { ReactNode } from "react"

import { StoreShell } from "./store-shell"

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  intro: string
  children: ReactNode
}) {
  return (
    <StoreShell>
      <section className="mx-auto max-w-4xl py-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-content-secondary sm:text-base">
          {intro}
        </p>

        <div className="mt-10 space-y-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
          {children}
        </div>
      </section>
    </StoreShell>
  )
}