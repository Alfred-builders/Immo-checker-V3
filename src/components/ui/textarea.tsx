import * as React from "react"

import { cn } from "src/lib/cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border-0 bg-muted/40 px-3.5 py-2.5 text-base transition-all outline-none placeholder:text-muted-foreground/50 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring/15 focus-visible:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
