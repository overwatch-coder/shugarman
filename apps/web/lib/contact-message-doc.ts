import type { ContactMessageDoc } from "@/lib/schemas"

export function toContactMessageFirestoreDoc(contact: ContactMessageDoc) {
  const { id: _id, ...firestoreDoc } = contact
  return firestoreDoc
}