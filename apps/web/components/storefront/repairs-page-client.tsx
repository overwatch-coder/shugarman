"use client"

import { useState } from "react"
import {
  BadgeCheck,
  BatteryCharging,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  HardDrive,
  Layers,
  Plug,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Terminal,
  Wallet,
  Wrench,
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

import type { RepairsPageContent, RepairService } from "@/lib/storefront-types"

/* ── Icon resolver ───────────────────────────────────────────────── */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  "battery-charging": BatteryCharging,
  plug: Plug,
  droplets: Droplets,
  layers: Layers,
  terminal: Terminal,
  "hard-drive": HardDrive,
  stethoscope: Stethoscope,
  "badge-check": BadgeCheck,
  "shield-check": ShieldCheck,
  clock: Clock,
  wallet: Wallet,
  wrench: Wrench,
}

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = iconMap[name] ?? Wrench
  return <Comp className={className} />
}

/* ── Service card ───────────────────────────────────────────────── */
function ServiceCard({ service }: { service: RepairService }) {
  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-6 transition-shadow hover:shadow-lg">
      {service.popular && (
        <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
          Popular
        </span>
      )}
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
        <Icon name={service.icon} className="size-5 text-primary" />
      </div>
      <div>
        <h3 className="font-label text-base font-bold text-[var(--sf-text)]">{service.name}</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--sf-text-secondary)]">{service.description}</p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-[var(--sf-outline)] pt-4 text-xs">
        <div>
          <p className="text-[var(--sf-text-muted)]">Starting from</p>
          <p className="font-mono font-bold text-[var(--sf-text)]">
            {service.priceFrom === null
              ? "Call for Quote"
              : `${service.currency} ${service.priceFrom.toLocaleString()}`}
          </p>
        </div>
        <div>
          <p className="text-[var(--sf-text-muted)]">Turnaround</p>
          <p className="font-bold text-[var(--sf-text)]">{service.turnaround}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[var(--sf-text-muted)]">Warranty</p>
          <p className="font-bold text-[var(--sf-text)]">{service.warranty}</p>
        </div>
      </div>
    </div>
  )
}

/* ── FAQ item ───────────────────────────────────────────────────── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[var(--sf-outline)] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-[var(--sf-text)] transition-colors hover:text-primary"
      >
        {question}
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-primary" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-[var(--sf-text-muted)]" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-7 text-[var(--sf-text-secondary)]">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
interface RepairsPageClientProps {
  content: RepairsPageContent
}

export function RepairsPageClient({ content }: RepairsPageClientProps) {
  const { hero, categories, whyChooseUs, faqs } = content
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "")

  const currentCategory = categories.find((c) => c.id === activeCategory) ?? categories[0]

  return (
    <div className="pb-24 pt-12">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative mb-20 overflow-hidden rounded-3xl bg-[var(--sf-text)] px-8 py-20 text-white dark:bg-[var(--sf-surface)] md:px-16">
        {/* Red glow blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary opacity-20 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <Wrench className="size-3" />
            {hero.badge}
          </span>
          <h1 className="font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70 md:text-lg">{hero.subheadline}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={hero.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--sf-red-hover)]"
            >
              <FaWhatsapp className="size-4" />
              {hero.ctaLabel}
            </Link>
            <Link
              href="#services"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ──────────────────────────────────────── */}
      <section className="mb-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Why Choose Us</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            Repair With Confidence
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon name={item.icon} className="size-5 text-primary" />
              </div>
              <h3 className="font-label font-bold text-[var(--sf-text)]">{item.title}</h3>
              <p className="text-sm leading-6 text-[var(--sf-text-secondary)]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────── */}
      <section id="services" className="mb-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Services</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            Our Repair Menu
          </h2>
        </div>

        {/* Category tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                activeCategory === cat.id
                  ? "border-primary bg-primary text-white"
                  : "border-[var(--sf-outline)] bg-[var(--sf-surface)] text-[var(--sf-text-secondary)] hover:border-primary hover:text-primary"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Category description */}
        {currentCategory?.description && (
          <p className="mb-6 text-sm text-[var(--sf-text-secondary)]">{currentCategory.description}</p>
        )}

        {/* Service cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentCategory?.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="mb-20 rounded-3xl bg-primary px-8 py-14 text-center text-white md:px-16">
        <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          Not Sure What's Wrong?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/80">
          Bring your device in and we'll run a free 30-point diagnostic. No obligation. No hidden fees.
          Just honest expert advice.
        </p>
        <Link
          href={hero.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-black uppercase tracking-wide text-primary transition-opacity hover:opacity-90"
        >
          <FaWhatsapp className="size-4" />
          Message Us on WhatsApp
        </Link>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            Common Questions
          </h2>
        </div>
        <div className="rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] px-6 py-2">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </div>
  )
}
