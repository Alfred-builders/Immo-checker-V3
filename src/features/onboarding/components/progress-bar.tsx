interface ProgressBarProps {
  steps: { id: number; label: string }[]
  currentStep: number
  skippedSteps: number[]
}

export function ProgressBar({ steps, currentStep, skippedSteps }: ProgressBarProps) {
  // Fill ratio reaches each step dot as it becomes current (step 1 = 0%, last = 100%)
  const fillPct = steps.length > 1
    ? (Math.max(0, Math.min(currentStep - 1, steps.length - 1)) / (steps.length - 1)) * 100
    : 0

  return (
    <div className="space-y-4">
      {/* Step labels row */}
      <div className="flex items-start justify-between gap-2">
        {steps.map((step) => {
          const isDone = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isSkipped = skippedSteps.includes(step.id)
          return (
            <div
              key={step.id}
              className={`flex-1 min-w-0 ${
                step.id === 1 ? 'text-left' : step.id === steps.length ? 'text-right' : 'text-center'
              }`}
            >
              <p
                className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
                  isCurrent ? 'text-primary' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/40'
                }`}
              >
                Étape {step.id}
              </p>
              <p
                className={`text-[13px] font-medium mt-1 truncate ${
                  isCurrent
                    ? 'text-foreground'
                    : isDone
                      ? isSkipped ? 'text-muted-foreground/60 italic' : 'text-foreground/70'
                      : 'text-muted-foreground/40'
                }`}
                title={step.label}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Track with gradient fill + step dots overlaid */}
      <div className="relative px-1">
        <div className="h-[3px] bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${fillPct}%`,
              background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)',
            }}
          />
        </div>
        <div className="absolute inset-x-1 inset-y-0 flex items-center justify-between pointer-events-none">
          {steps.map((step) => {
            const isDone = step.id < currentStep
            const isCurrent = step.id === currentStep
            return (
              <div
                key={step.id}
                className={`h-2.5 w-2.5 rounded-full border-[1.5px] transition-all duration-300 ${
                  isCurrent
                    ? 'bg-primary border-primary ring-[3px] ring-primary/20'
                    : isDone
                      ? 'bg-primary border-primary'
                      : 'bg-card border-muted-foreground/25'
                }`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
