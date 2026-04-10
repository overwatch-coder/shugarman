"use client"

import { useMemo, useState, useTransition } from "react"
import { Mail, MailOpen, MessageSquareMore, Search } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import type { ContactMessageDoc } from "@/lib/schemas"
import {
  markContactMessageRead,
  recordMailtoReply,
  sendContactReply,
} from "@/lib/actions/contacts"

function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function buildReplySubject(contact: ContactMessageDoc) {
  return `Re: ${contact.inquiryType.replace(/-/g, " ")} enquiry from ${contact.name}`
}

function buildMailtoHref(toEmail: string, subject: string, message: string) {
  const params = new URLSearchParams({ subject, body: message })
  return `mailto:${toEmail}?${params.toString()}`
}

const STATUS_STYLES: Record<ContactMessageDoc["status"], string> = {
  new: "bg-primary/10 text-primary",
  read: "bg-blue-500/10 text-blue-500",
  replied: "bg-emerald-500/10 text-emerald-500",
}

export function ContactsClient({
  initialMessages,
}: {
  initialMessages: ContactMessageDoc[]
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [replySubject, setReplySubject] = useState("")
  const [replyMessage, setReplyMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  const selectedContact = messages.find((message) => message.id === selectedContactId) ?? null
  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return messages

    return messages.filter((message) => {
      return [message.name, message.email, message.phone, message.message]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    })
  }, [messages, search])

  function syncMessage(nextMessage: ContactMessageDoc) {
    setMessages((prev) => prev.map((message) => (message.id === nextMessage.id ? nextMessage : message)))
  }

  function openContact(contact: ContactMessageDoc) {
    setSelectedContactId(contact.id)
    setReplySubject(buildReplySubject(contact))
    setReplyMessage(`Hi ${contact.name},\n\nThanks for contacting SHUGARMAN iSTORE.\n\n`)

    if (contact.read) {
      return
    }

    const optimistic = { ...contact, read: true, status: "read" as const }
    syncMessage(optimistic)
    startTransition(async () => {
      const result = await markContactMessageRead(contact.id)
      if (!result.success) {
        toast.error(result.error ?? "Failed to mark message as read.")
      }
    })
  }

  function handleSendRealEmail() {
    if (!selectedContact) return

    startTransition(async () => {
      const result = await sendContactReply({
        contactId: selectedContact.id,
        toEmail: selectedContact.email,
        subject: replySubject,
        message: replyMessage,
      })

      if (result.success) {
        syncMessage(result.contact)
        toast.success("Reply sent to customer.")
      } else {
        toast.error(result.error ?? "Failed to send reply.")
      }
    })
  }

  function handleOpenMailApp() {
    if (!selectedContact) return

    window.location.href = buildMailtoHref(selectedContact.email, replySubject, replyMessage)

    startTransition(async () => {
      const result = await recordMailtoReply({
        contactId: selectedContact.id,
        subject: replySubject,
        message: replyMessage,
      })

      if (result.success) {
        syncMessage(result.contact)
        toast.success("Reply draft opened in your mail app.")
      } else {
        toast.error(result.error ?? "Failed to record reply draft.")
      }
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Contacts</h1>
          <p className="mt-1 text-sm text-content-secondary">
            Review customer enquiries, inspect full messages, and reply from one place.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-secondary" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone, or message…"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-content-secondary">
            No contact messages yet.
          </div>
        ) : (
          filteredMessages.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => openContact(contact)}
              className="flex w-full items-start justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left transition-colors hover:bg-accent/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold text-foreground">{contact.name}</p>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[contact.status]}`}>
                    {contact.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-content-secondary">
                  {contact.email}{contact.phone ? ` · ${contact.phone}` : ""}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-content-secondary">{contact.message}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] uppercase tracking-wider text-content-muted">
                  {contact.inquiryType}
                </p>
                <p className="mt-2 text-[11px] text-content-secondary">{formatRelativeDate(contact.createdAt)}</p>
              </div>
            </button>
          ))
        )}
      </div>

      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContactId(null)}>
        <DialogContent className="max-h-[90dvh] !max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-0">
          {selectedContact ? (
            <>
              <DialogHeader className="border-b border-border px-6 py-5">
                <DialogTitle className="text-xl font-black text-foreground">
                  {selectedContact.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedContact.email}{selectedContact.phone ? ` · ${selectedContact.phone}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 px-6 py-5">
                <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 md:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Inquiry</p>
                    <p className="mt-1 text-sm text-foreground">{selectedContact.inquiryType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Received</p>
                    <p className="mt-1 text-sm text-foreground">{formatRelativeDate(selectedContact.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Status</p>
                    <p className="mt-1 text-sm text-foreground">{selectedContact.status}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Customer Message</p>
                  <div className="mt-2 rounded-xl border border-border bg-surface p-4 text-sm leading-7 text-foreground whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquareMore className="size-4 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Reply</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    <input
                      value={replySubject}
                      onChange={(event) => setReplySubject(event.target.value)}
                      placeholder="Reply subject"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
                    />
                    <textarea
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      rows={8}
                      placeholder="Write your reply…"
                      className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
                    />
                  </div>
                </div>

                {selectedContact.replies.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Reply History</p>
                    <div className="mt-3 space-y-3">
                      {selectedContact.replies.map((reply) => (
                        <div key={reply.id} className="rounded-xl border border-border bg-surface p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-foreground">{reply.subject}</p>
                            <p className="text-[11px] text-content-secondary">
                              {reply.channel} · {formatRelativeDate(reply.sentAt)}
                            </p>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-content-secondary">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-border bg-card px-6 py-4 sm:justify-between">
                <div className="text-xs text-content-secondary hidden">
                  Use real email when SMTP is configured, or open a prefilled draft in your mail app.
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleOpenMailApp}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    <MailOpen className="size-4" />
                    Open Mail App
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRealEmail}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Mail className="size-4" />
                    Send From Here
                  </button>
                </div>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}