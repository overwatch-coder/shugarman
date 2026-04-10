function normalizeBucketName(bucket: string) {
  return bucket.replace(/^gs:\/\//, "").trim()
}

export function getStorageBucketCandidates({
  configuredBucket,
  projectId,
}: {
  configuredBucket: string | undefined
  projectId: string | undefined
}) {
  const normalizedConfiguredBucket = normalizeBucketName(configuredBucket ?? "")
  const normalizedProjectId = (projectId ?? "").trim()
  const candidates = new Set<string>()

  if (normalizedConfiguredBucket) {
    candidates.add(normalizedConfiguredBucket)

    if (normalizedConfiguredBucket.endsWith(".firebasestorage.app")) {
      candidates.add(`${normalizedConfiguredBucket.replace(/\.firebasestorage\.app$/, "")}.appspot.com`)
    }

    if (normalizedConfiguredBucket.endsWith(".appspot.com")) {
      candidates.add(`${normalizedConfiguredBucket.replace(/\.appspot\.com$/, "")}.firebasestorage.app`)
    }
  }

  if (normalizedProjectId) {
    candidates.add(`${normalizedProjectId}.appspot.com`)
    candidates.add(`${normalizedProjectId}.firebasestorage.app`)
  }

  return [...candidates]
}