"use server"

import nodemailer from "nodemailer"

import { getSession } from "@/lib/admin-auth"
import { buildContactNotification } from "@/lib/contact-notifications"
import { adminDb } from "@/lib/firebase-admin"
import type { ContactInquiryType, ContactMessageDoc, ContactReplyDoc } from "@/lib/schemas"

const COLLECTION = "contactMessages"

function mapContactMessage(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot) {
  return {
    id: doc.id,
    ...doc.data(),
  } as ContactMessageDoc
}

async function appendReply({
  contactId,
  reply,
  status,
}: {
  contactId: string
  reply: ContactReplyDoc
  status: ContactMessageDoc["status"]
}) {
  const contactRef = adminDb.collection(COLLECTION).doc(contactId)
  const existing = await contactRef.get()
  if (!existing.exists) {
    return { success: false as const, error: "Contact message not found." }
  }

  const contact = mapContactMessage(existing)
  const nextMessage: ContactMessageDoc = {
    ...contact,
    read: true,
    status,
    updatedAt: reply.sentAt,
    replies: [...(contact.replies ?? []), reply],
  }

  await contactRef.set({ ...nextMessage, id: undefined }, { merge: false })

  return { success: true as const, contact: nextMessage }
}

export async function getContactMessages(): Promise<ContactMessageDoc[]> {
  try {
    const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").limit(100).get()
    return snap.docs.map((doc) => mapContactMessage(doc))
  } catch {
    return []
  }
}

export async function createContactMessage(data: {
  name: string
  email: string
  phone: string
  inquiryType: ContactInquiryType
  message: string
}) {
  try {
    const now = new Date().toISOString()
    const ref = adminDb.collection(COLLECTION).doc()
    const notificationRef = adminDb.collection("notifications").doc()
    const batch = adminDb.batch()

    batch.set(ref, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      inquiryType: data.inquiryType,
      message: data.message,
      status: "new",
      read: false,
      replies: [],
      createdAt: now,
      updatedAt: now,
    })

    batch.set(notificationRef, buildContactNotification(data, ref.id, now))

    await batch.commit()
    return { success: true as const, id: ref.id }
  } catch (err) {
    console.error("createContactMessage:", err)
    return { success: false as const, error: "Failed to save your message." }
  }
}

export async function markContactMessageRead(contactId: string) {
  try {
    await adminDb.collection(COLLECTION).doc(contactId).update({
      read: true,
      status: "read",
      updatedAt: new Date().toISOString(),
    })
    return { success: true as const }
  } catch (err) {
    console.error("markContactMessageRead:", err)
    return { success: false as const, error: "Failed to update contact message." }
  }
}

export async function sendContactReply(data: {
  contactId: string
  toEmail: string
  subject: string
  message: string
}) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false as const, error: "You must be signed in to send replies." }
    }

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT ?? 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || session.email

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      return {
        success: false as const,
        error: "SMTP is not configured. Use the mail app option or add SMTP env vars.",
      }
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.sendMail({
      from: smtpFrom,
      to: data.toEmail,
      subject: data.subject,
      text: data.message,
      replyTo: session.email,
    })

    const now = new Date().toISOString()
    const reply: ContactReplyDoc = {
      id: `${Date.now()}`,
      channel: "email",
      subject: data.subject,
      message: data.message,
      sentAt: now,
      sentBy: session.displayName || session.email,
    }

    return appendReply({ contactId: data.contactId, reply, status: "replied" })
  } catch (err) {
    console.error("sendContactReply:", err)
    return { success: false as const, error: "Failed to send email reply." }
  }
}

export async function recordMailtoReply(data: {
  contactId: string
  subject: string
  message: string
}) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false as const, error: "You must be signed in to reply." }
    }

    const now = new Date().toISOString()
    const reply: ContactReplyDoc = {
      id: `${Date.now()}`,
      channel: "mailto",
      subject: data.subject,
      message: data.message,
      sentAt: now,
      sentBy: session.displayName || session.email,
    }

    return appendReply({ contactId: data.contactId, reply, status: "replied" })
  } catch (err) {
    console.error("recordMailtoReply:", err)
    return { success: false as const, error: "Failed to record reply draft." }
  }
}