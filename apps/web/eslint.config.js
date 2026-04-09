import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
	...nextJsConfig,
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"no-restricted-syntax": [
				"error",
				{
					selector: "Literal[value=/\\[var\\(--sf-/]",
					message:
						"Use semantic Tailwind theme classes like bg-surface-high, text-foreground, or text-content-secondary instead of arbitrary [var(--sf-...)] utilities.",
				},
				{
					selector: "TemplateElement[value.raw=/\\[var\\(--sf-/]",
					message:
						"Use semantic Tailwind theme classes like bg-surface-high, text-foreground, or text-content-secondary instead of arbitrary [var(--sf-...)] utilities.",
				},
			],
		},
	},
]
