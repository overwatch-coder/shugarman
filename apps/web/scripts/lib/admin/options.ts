export interface CreateAdminOptions {
  email?: string
  password: string
  displayName?: string
  dryRun: boolean
}

function requireFlagValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for flag: ${flag}`)
  }

  return value
}

export function parseCreateAdminOptions(argv: string[]): CreateAdminOptions {
  let email: string | undefined
  let password: string | undefined
  let displayName: string | undefined
  let dryRun = false

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    switch (arg) {
      case "--email":
        email = requireFlagValue(arg, argv[index + 1])
        index += 1
        break
      case "--password":
        password = requireFlagValue(arg, argv[index + 1])
        index += 1
        break
      case "--display-name":
        displayName = requireFlagValue(arg, argv[index + 1])
        index += 1
        break
      case "--dry-run":
        dryRun = true
        break
      default:
        throw new Error(`Unknown flag: ${arg}`)
    }
  }

  if (!password) {
    throw new Error("Missing required flag: --password")
  }

  return {
    email,
    password,
    displayName,
    dryRun,
  }
}