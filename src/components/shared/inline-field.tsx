import { cn } from '../../lib/cn'

interface InlineFieldProps {
  label: string
  editing: boolean
  value: React.ReactNode
  children: React.ReactNode
  className?: string
  error?: string
  horizontal?: boolean
}

export function InlineField({ label, editing, value, children, className, error, horizontal = true }: InlineFieldProps) {
  if (horizontal) {
    return (
      <div className={cn('py-2 px-1 rounded-lg transition-all duration-200', editing && 'bg-primary/[0.03]', className)}>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground shrink-0">{label}</span>
          {editing ? (
            <div className="flex-1 max-w-[220px]">{children}</div>
          ) : (
            <span className="text-sm font-medium text-foreground truncate">{value || '—'}</span>
          )}
        </div>
        {error && <p className="text-xs text-destructive mt-1 text-right">{error}</p>}
      </div>
    )
  }

  return (
    <div className={cn('py-2 px-1 rounded-lg transition-all duration-200', editing && 'bg-primary/[0.03]', className)}>
      <span className="text-xs text-muted-foreground block mb-1">{label}</span>
      {editing ? (
        <div>{children}</div>
      ) : (
        <span className="text-sm font-medium text-foreground">{value || '—'}</span>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
