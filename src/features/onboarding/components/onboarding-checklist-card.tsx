import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Circle, X, CaretRight, Sparkle } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import { useAuth } from '../../../hooks/use-auth'
import { usePermissions } from '../../../hooks/use-permissions'

interface ChecklistItem {
  id: string
  label: string
  href: string
  done: boolean
}

interface ChecklistResponse {
  items: ChecklistItem[]
  done_count: number
  total: number
  all_done: boolean
}

export function OnboardingChecklistCard() {
  const { workspace } = useAuth()
  const { isAdmin } = usePermissions()
  const storageKey = workspace?.id ? `onboarding_checklist_dismissed_${workspace.id}` : null
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!storageKey) return
    setDismissed(localStorage.getItem(storageKey) === '1')
  }, [storageKey])

  const { data } = useQuery<ChecklistResponse>({
    queryKey: ['workspace', 'onboarding-checklist', workspace?.id],
    queryFn: () => api('/workspaces/current/onboarding-checklist'),
    enabled: !!workspace?.id && !dismissed && isAdmin,
    staleTime: 30_000,
  })

  // Hide for non-admins — only admins can configure the workspace
  if (!isAdmin) return null
  if (!data || data.all_done || dismissed) return null

  function handleDismiss() {
    if (!storageKey) return
    localStorage.setItem(storageKey, '1')
    setDismissed(true)
  }

  const pct = Math.round((data.done_count / data.total) * 100)

  return (
    <section className="px-4 lg:px-6">
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden bg-gradient-to-br from-primary/5 via-card to-card">
        {/* Section header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border/30">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkle size={16} weight="fill" className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Configurez votre espace</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.done_count} / {data.total} étapes complétées — {pct}%
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-accent/60 transition-colors"
            title="Masquer"
            aria-label="Masquer la checklist"
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted/40">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/30 lg:divide-x">
          {data.items.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`group flex items-start gap-3 px-5 py-4 transition-colors ${
                item.done
                  ? 'bg-card/50 hover:bg-accent/30'
                  : 'hover:bg-accent/40'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {item.done ? (
                  <CheckCircle size={20} weight="fill" className="text-emerald-500" />
                ) : (
                  <Circle size={20} className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                  {item.label}
                </p>
                {!item.done && (
                  <p className="text-[11px] text-primary/70 flex items-center gap-0.5 mt-0.5 group-hover:text-primary transition-colors">
                    Configurer <CaretRight size={10} weight="bold" />
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
