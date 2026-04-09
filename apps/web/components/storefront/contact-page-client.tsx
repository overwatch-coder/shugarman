"use client"

import { useState } from "react"
import {
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Send,
} from "lucide-react"
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6"
import Link from "next/link"
import { motion } from "framer-motion"

import type { ContactPageContent, StoreMetadata } from "@/lib/storefront-types"

/* ── Icon resolvers ──────────────────────────────────────────────── */
const channelIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp: FaWhatsapp,
  phone: Phone,
  "phone-call": PhoneCall,
  mail: Mail,
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  WhatsApp: FaWhatsapp,
}

function ChannelIcon({ name, className }: { name: string; className?: string }) {
  const Comp = channelIconMap[name] ?? MessageSquare
  return <Comp className={className} />
}

/* ── Fade-in helper ──────────────────────────────────────────────── */
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
interface ContactPageClientProps {
  content: ContactPageContent
  storeMetadata: StoreMetadata
}

export function ContactPageClient({ content, storeMetadata }: ContactPageClientProps) {
  const { hero, channels, inquiryTypes, mapEmbedNote } = content

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: inquiryTypes[0]?.value ?? "general",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // When a back-office API is ready, POST formState here.
    setSubmitted(true)
  }

  return (
    <div className="pb-24 pt-12">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative mb-20 overflow-hidden rounded-3xl bg-[var(--sf-text)] px-8 py-20 text-white dark:bg-[var(--sf-surface)] md:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 size-[420px] rounded-full bg-primary opacity-15 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <MessageSquare className="size-3" />
            {hero.badge}
          </span>
          <h1 className="font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70 md:text-lg">{hero.subheadline}</p>
        </div>
      </section>

      {/* ── Contact channels ───────────────────────────────────── */}
      <section className="mb-20">
        <FadeIn className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Reach Us</p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-4xl">
            Choose Your Channel
          </h2>
        </FadeIn>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((ch, i) => (
            <FadeIn key={ch.id} delay={i * 0.07}>
              <Link
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
                  <ChannelIcon
                    name={ch.icon}
                    className="size-5 text-primary transition-colors group-hover:text-white"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">
                    {ch.label}
                  </p>
                  <p className="mt-1 font-label text-base font-bold text-[var(--sf-text)]">{ch.value}</p>
                </div>
                <p className="text-sm leading-6 text-[var(--sf-text-secondary)]">{ch.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {ch.cta}
                  <Send className="size-3.5" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Two-column: Form + Sidebar ─────────────────────────── */}
      <section className="mb-20 grid gap-10 lg:grid-cols-5">
        {/* Form */}
        <FadeIn className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-8 md:p-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Send a Message</p>
            <h2 className="font-display mb-8 text-2xl font-black uppercase tracking-tight text-[var(--sf-text)] md:text-3xl">
              Contact Form
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-green-500/10">
                  <Send className="size-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--sf-text)]">Message Received!</h3>
                <p className="max-w-sm text-sm leading-6 text-[var(--sf-text-secondary)]">
                  Thank you for reaching out. We&rsquo;ll get back to you within 24 hours, or faster via WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setFormState({ name: "", email: "", phone: "", inquiryType: "general", message: "" })
                  }}
                  className="mt-2 text-sm font-semibold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Kwame Mensah"
                    className="w-full rounded-xl border border-[var(--sf-outline)] bg-[var(--sf-bg)] px-4 py-3 text-sm text-[var(--sf-text)] placeholder:text-[var(--sf-text-muted)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Email & Phone row */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="kwame@email.com"
                      className="w-full rounded-xl border border-[var(--sf-outline)] bg-[var(--sf-bg)] px-4 py-3 text-sm text-[var(--sf-text)] placeholder:text-[var(--sf-text-muted)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">
                      Phone (optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formState.phone}
                      onChange={handleChange}
                      placeholder="0558 694 853"
                      className="w-full rounded-xl border border-[var(--sf-outline)] bg-[var(--sf-bg)] px-4 py-3 text-sm text-[var(--sf-text)] placeholder:text-[var(--sf-text-muted)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Inquiry type */}
                <div>
                  <label htmlFor="inquiryType" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">
                    Inquiry Type
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formState.inquiryType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--sf-outline)] bg-[var(--sf-bg)] px-4 py-3 text-sm text-[var(--sf-text)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {inquiryTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--sf-text-muted)]">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help…"
                    className="w-full resize-none rounded-xl border border-[var(--sf-outline)] bg-[var(--sf-bg)] px-4 py-3 text-sm leading-6 text-[var(--sf-text)] placeholder:text-[var(--sf-text-muted)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-[var(--sf-red-hover)]"
                >
                  <Send className="size-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </FadeIn>

        {/* Sidebar — Location, Hours, Socials */}
        <FadeIn delay={0.1} className="space-y-6 lg:col-span-2">
          {/* Location card */}
          <div className="rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">Find Us</p>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-[var(--sf-text)]">{storeMetadata.address}</p>
                <p className="text-sm text-[var(--sf-text-secondary)]">
                  {storeMetadata.city}, {storeMetadata.region}
                </p>
              </div>
            </div>
            {/* Map placeholder */}
            <div className="flex h-40 items-center justify-center rounded-xl bg-[var(--sf-surface-low)] text-xs text-[var(--sf-text-muted)]">
              <div className="text-center">
                <MapPin className="mx-auto mb-1 size-6 text-primary/50" />
                {mapEmbedNote}
              </div>
            </div>
          </div>

          {/* Hours card */}
          <div className="rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Opening Hours</span>
            </div>
            <div className="space-y-2">
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

          {/* Social card */}
          <div className="rounded-2xl border border-[var(--sf-outline)] bg-[var(--sf-surface)] p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">Follow Us</p>
            <div className="flex gap-3">
              {storeMetadata.social.map((s) => {
                const SIcon = socialIconMap[s.platform]
                if (!SIcon) return null
                return (
                  <Link
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--sf-outline)] bg-[var(--sf-surface-low)] text-[var(--sf-text-secondary)] transition-colors hover:border-primary hover:text-primary"
                  >
                    <SIcon className="size-4" />
                  </Link>
                )
              })}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── WhatsApp CTA banner ────────────────────────────────── */}
      <FadeIn>
        <section className="rounded-3xl bg-primary px-8 py-14 text-center text-white md:px-16">
          <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Prefer to Chat?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/80">
            Skip the form — send us a WhatsApp message and get a reply within minutes during store hours.
          </p>
          <Link
            href={`https://wa.me/${storeMetadata.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-black uppercase tracking-wide text-primary transition-opacity hover:opacity-90"
          >
            <FaWhatsapp className="size-4" />
            Message Us on WhatsApp
          </Link>
        </section>
      </FadeIn>
    </div>
  )
}
