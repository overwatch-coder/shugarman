import type { TouchedPath } from "./write"

interface StartupSummaryInput {
  projectId: string
  dryRun: boolean
  productCount: number
  categoryCount: number
}

export function printStartupSummary(input: StartupSummaryInput): void {
  console.log(`Project ID: ${input.projectId}`)
  console.log("Auth mode: service-account-env")
  console.log(`Mode: ${input.dryRun ? "dry-run" : "write"}`)
  console.log(`Products prepared: ${input.productCount}`)
  console.log(`Categories prepared: ${input.categoryCount}`)
}

export function printTouchedPaths(touchedPaths: TouchedPath[]): void {
  console.log("Touched paths:")

  for (const touchedPath of [...touchedPaths].sort((left, right) => left.path.localeCompare(right.path))) {
    console.log(`- ${touchedPath.operation} ${touchedPath.path}`)
  }
}

export function printSuccessSummary(touchedPaths: TouchedPath[], dryRun: boolean): void {
  console.log(
    `${dryRun ? "Dry run complete" : "Seed run complete"}: ${touchedPaths.length} path${touchedPaths.length === 1 ? "" : "s"}`
  )
}

export function printFailureSummary(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Seed run failed: ${message}`)
}