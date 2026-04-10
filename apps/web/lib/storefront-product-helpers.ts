import type { InstallmentPlan } from "./storefront-types"

export function hasInstallmentPlan(
  installment: InstallmentPlan | null | undefined
): installment is InstallmentPlan {
  return Boolean(
    installment &&
      typeof installment.downPaymentPercent === "number" &&
      typeof installment.downPayment === "number" &&
      typeof installment.weeklyRate === "number" &&
      typeof installment.weeks === "number" &&
      typeof installment.totalPrice === "number" &&
      typeof installment.interestNote === "string"
  )
}

export function isExternalImageSource(src: string) {
  return /^https?:\/\//i.test(src)
}