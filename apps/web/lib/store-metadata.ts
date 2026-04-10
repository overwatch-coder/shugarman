import type { StoreMetadata } from "./storefront-types"

export function mergeStoreMetadataWithDefaults(
  metadata: Partial<StoreMetadata>,
  defaults: StoreMetadata
): StoreMetadata {
  return {
    ...defaults,
    ...metadata,
    hours: metadata.hours?.length ? metadata.hours : defaults.hours,
    social: metadata.social?.length ? metadata.social : defaults.social,
  }
}