export interface SeedOptions {
  dryRun: boolean
}

export function parseSeedOptions(argv: string[]): SeedOptions {
  const flags = new Set(argv)

  for (const flag of flags) {
    if (flag !== "--dry-run") {
      throw new Error(`Unknown flag: ${flag}`)
    }
  }

  return {
    dryRun: flags.has("--dry-run"),
  }
}