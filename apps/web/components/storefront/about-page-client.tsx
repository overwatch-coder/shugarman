"use client"

import {
  BadgeCheck,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6"
import { motion } from "framer-motion"

import type { AboutPageContent } from "@/lib/storefront-types"
import { storeMetadata } from "@/lib/storefront-data"

/* ── Icon resolver ───────────────────────────────────────────────── */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "heart-handshake": HeartHandshake,
  "badge-check": BadgeCheck,
  zap: Zap,
  users: Users,
}

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = iconMap[name] ?? BadgeCheck
  return <Comp className={className} />
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  WhatsApp: FaWhatsapp,
}

/* ── Fade-in animation helper ───────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
interface AboutPageClientProps {
  content: AboutPageContent
}

export function AboutPageClient({ content }: AboutPageClientProps) {
  const { hero, story, mission, values, milestones, team, stats } = content

  return (
    <div className="pb-24 pt-12">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative mb-20 overflow-hidden rounded-3xl bg-[var(--sf-text)] px-8 py-20 text-white dark:bg-[var(--sf-surface)] md:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary opacity-20 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <MapPin className="size-3" />
            {hero.badge}
          </span>
          <h1 className="font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70 md:text-lg">{hero.subheadline}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`https://wa.me/${storeMetadata.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--sf-red-hover)]"
            >
              <FaWhatsapp className="size-4" />
              Chat With Us
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              Browse Phones
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <FadeIn className="mb-20">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-outline)] lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-1 bg-[var(--sf-surface)] px-6 py-8 text-center"
            >
              <span className="font-display text-4xl font-black uppercase text-primary">{stat.value}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Story ──────────────────────────────────────────────── */}
      <section className="mb-20 grid gap-12 lg:grid-cols-2 lg:items-center">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{story.heading}</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            From a Counter in Adum to Kumasi's #1 Phone Store
          </h2>
        </FadeIn>
        <FadeIn delay={0.1} className="space-y-4">
          {story.paragraphs.map((para, i) => (
            <p key={i} className="text-base leading-7 text-[var(--sf-text-secondary)]">
              {para}
            </p>
          ))}
        </FadeIn>
      </section>

      {/* ── Mission ────────────────────────────────────────────── */}
      <FadeIn className="mb-20">
        <div className="rounded-3xl bg-primary px-8 py-14 text-center text-white md:px-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">
            {mission.heading}
          </p>
          <blockquote className="font-display mx-auto max-w-3xl text-2xl font-black uppercase leading-tight tracking-tight md:text-3xl">
            &ldquo;{mission.statement}&rdquo;
          </blockquote>
        </div>
      </FadeIn>

      {/* ── Values ─────────────────────────────────────────────── */}
      <section className="mb-20">
        <FadeIn className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Our Values</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            What We Stand For
          </h2>
        </FadeIn>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((val, i) => (
            <FadeIn key={val.title} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name={val.icon} className="size-5 text-primary" />
                </div>
                <h3 className="font-label font-bold text-[var(--sf-text)]">{val.title}</h3>
                <p className="text-sm leading-6 text-[var(--sf-text-secondary)]">{val.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Timeline ───────────────────────────────────────────── */}
      <section className="mb-20">
        <FadeIn className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Our Journey</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            Milestones
          </h2>
        </FadeIn>
        <div className="relative mx-auto max-w-3xl">
          {/* Vertical line */}
          <div
            aria-hidden
            className="absolute left-[27px] top-2 hidden h-[calc(100%-16px)] w-px bg-[var(--sf-outline)] sm:block"
          />
          <div className="space-y-10">
            {milestones.map((m, i) => (
              <FadeIn key={m.year} delay={i * 0.07} className="flex gap-6">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                    {m.year}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="size-4 text-primary" />
                    <h3 className="font-label font-bold text-[var(--sf-text)]">{m.title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--sf-text-secondary)]">{m.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ───────────────────────────────────────────────── */}
      <section className="mb-20">
        <FadeIn className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">The Team</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            The People Behind the Store
          </h2>
        </FadeIn>
        <div className="grid gap-6 sm:grid-cols-2">
          {team.map((member) => (
            <FadeIn key={member.id}>
              <div className="flex flex-col gap-4 rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-8">
                {/* Avatar placeholder */}
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-black text-primary">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-label text-lg font-bold text-[var(--sf-text)]">{member.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{member.role}</p>
                </div>
                <p className="text-sm leading-7 text-[var(--sf-text-secondary)]">{member.bio}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Store Info & Social ─────────────────────────────────── */}
      <FadeIn>
        <section className="grid gap-10 rounded-3xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-8 md:grid-cols-2 md:p-12">
          {/* Location & Hours */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">Visit Us</p>
            <div className="mb-4 flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-[var(--sf-text)]">{storeMetadata.address}</p>
                <p className="text-sm text-[var(--sf-text-secondary)]">
                  {storeMetadata.city}, {storeMetadata.region}, {storeMetadata.country}
                </p>
              </div>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-[var(--sf-text)]">{storeMetadata.phone}</p>
                <p className="text-sm text-[var(--sf-text-secondary)]">Mon – Sat, 8:00 AM – 5:00 PM</p>
              </div>
            </div>
            {/* Hours table */}
            <div className="rounded-xl bg-[var(--sf-surface-low)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="size-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">Opening Hours</span>
              </div>
              <div className="space-y-1.5">
                {storeMetadata.hours.map((h) => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className="font-medium text-[var(--sf-text)]">{h.day}</span>
                    {h.status === "closed" ? (
                      <span className="text-[var(--sf-text-muted)]">Closed</span>
                    ) : (
                      <span className="text-[var(--sf-text-secondary)]">
                        {h.open} – {h.close}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">Follow Us</p>
            <div className="space-y-3">
              {storeMetadata.social.map((s) => {
                const SocialIcon = socialIconMap[s.platform]
                if (!SocialIcon) return null
                return (
                  <Link
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-[var(--sf-outline)] bg-[var(--sf-surface-low)] px-5 py-3.5 transition-colors hover:border-primary hover:text-primary"
                  >
                    <SocialIcon className="size-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--sf-text)]">{s.platform}</p>
                      <p className="text-xs text-[var(--sf-text-muted)]">{s.handle}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Link
              href={`https://wa.me/${storeMetadata.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-[var(--sf-red-hover)]"
            >
              <FaWhatsapp className="size-4" />
              Message Us on WhatsApp
            </Link>
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
