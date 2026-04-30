import { useState, type ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { cn } from 'src/lib/cn'

interface Props {
  icon: ReactNode
  title: string
  required?: boolean
  hint?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

/**
 * Bloc pliable uniforme : header avec icône + titre + hint contextuel + chevron.
 * Utilisé pour structurer les formulaires longs (création bâtiment, lot, mission)
 * en sections cohérentes — le hint affiche un résumé live du contenu pour qu'on
 * voie l'état des champs sans déplier la section.
 */
export function CollapsibleSection({ icon, title, required, hint, defaultOpen = false, children, className }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn('rounded-lg border border-border/60 bg-card overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-muted-foreground/70 inline-flex">{icon}</span>
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        {required && <span className="text-rose-500 text-[12px] leading-none">*</span>}
        {hint && <span className="text-[11px] text-muted-foreground/80 truncate min-w-0">{hint}</span>}
        <CaretDown
          className={cn(
            'h-3.5 w-3.5 ml-auto text-muted-foreground/70 transition-transform shrink-0',
            !open && '-rotate-90',
          )}
          weight="bold"
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-border/40 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
