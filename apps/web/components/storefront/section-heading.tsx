import { cn } from "@workspace/ui/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  accent?: string
  description?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-5xl leading-none tracking-tight text-foreground md:text-6xl">
        {title}
        {accent ? <span className="text-primary"> {accent}</span> : null}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-content-secondary md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
