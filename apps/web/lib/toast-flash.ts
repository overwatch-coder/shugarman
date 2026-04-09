const SUCCESS_TOAST_KEY = "admin-success-toast"

export function queueSuccessToast(message: string) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(SUCCESS_TOAST_KEY, message)
}

export function consumeSuccessToast() {
  if (typeof window === "undefined") return null

  const message = window.sessionStorage.getItem(SUCCESS_TOAST_KEY)
  if (!message) return null

  window.sessionStorage.removeItem(SUCCESS_TOAST_KEY)
  return message
}