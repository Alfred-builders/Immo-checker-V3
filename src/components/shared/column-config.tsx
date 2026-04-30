import { useState, useEffect } from 'react'
import { GearSix, ArrowCounterClockwise, DotsSixVertical } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'
import { Switch } from 'src/components/ui/switch'
import { api } from '../../lib/api-client'

export interface ColumnDef {
  id: string
  label: string
  defaultVisible: boolean
}

interface ColumnConfigProps {
  page: string
  columns: ColumnDef[]
  visibleColumns: string[]
  onColumnsChange: (visible: string[]) => void
  // Optional: enable drag-reorder. When `order` is supplied the columns are
  // rendered in that order in the popover and a drag handle moves them around.
  // The parent owns persistence (it can save order alongside other prefs in
  // its own preference key — this component only signals the new order).
  order?: string[]
  onOrderChange?: (order: string[]) => void
}

export function ColumnConfig({ page, columns, visibleColumns, onColumnsChange, order, onOrderChange }: ColumnConfigProps) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<string[]>(visibleColumns)
  const [dragId, setDragId] = useState<string | null>(null)

  useEffect(() => {
    setLocal(visibleColumns)
  }, [visibleColumns])

  // When the parent didn't supply an order, fall back to the natural column order.
  const reorderEnabled = !!order && !!onOrderChange
  const orderedIds: string[] = reorderEnabled
    ? [
        ...order!.filter((id) => columns.some((c) => c.id === id)),
        ...columns.map((c) => c.id).filter((id) => !order!.includes(id)),
      ]
    : columns.map((c) => c.id)

  const orderedColumns: ColumnDef[] = orderedIds
    .map((id) => columns.find((c) => c.id === id))
    .filter((c): c is ColumnDef => !!c)

  function toggle(id: string) {
    const next = local.includes(id) ? local.filter(c => c !== id) : [...local, id]
    setLocal(next)
    onColumnsChange(next)
    if (!reorderEnabled) {
      // Legacy callers persist via this component directly.
      api('/preferences/' + page, {
        method: 'PUT',
        body: JSON.stringify({ config: { visible_columns: next } }),
      }).catch(() => {})
    }
  }

  function reset() {
    const defaults = columns.filter(c => c.defaultVisible).map(c => c.id)
    setLocal(defaults)
    onColumnsChange(defaults)
    if (reorderEnabled && onOrderChange) {
      onOrderChange(columns.map((c) => c.id))
    } else {
      api('/preferences/' + page, {
        method: 'PUT',
        body: JSON.stringify({ config: { visible_columns: defaults } }),
      }).catch(() => {})
    }
  }

  function handleDrop(targetId: string) {
    if (!reorderEnabled || !onOrderChange || !dragId || dragId === targetId) {
      setDragId(null)
      return
    }
    const without = orderedIds.filter((id) => id !== dragId)
    const targetIndex = without.indexOf(targetId)
    const next = [...without.slice(0, targetIndex), dragId, ...without.slice(targetIndex)]
    onOrderChange(next)
    setDragId(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <GearSix className="h-3.5 w-3.5" />
          Colonnes
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <div className="px-3 py-2.5 flex items-center justify-between border-b border-border/60">
          <span className="text-xs font-semibold text-foreground">Colonnes visibles</span>
          <button onClick={reset} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowCounterClockwise className="h-3 w-3" />
            Reinitialiser
          </button>
        </div>
        <div className="py-1 max-h-72 overflow-y-auto">
          {orderedColumns.map((col) => {
            const draggable = reorderEnabled
            return (
              <div
                key={col.id}
                draggable={draggable}
                onDragStart={() => draggable && setDragId(col.id)}
                onDragOver={(e) => draggable && e.preventDefault()}
                onDrop={() => draggable && handleDrop(col.id)}
                onDragEnd={() => setDragId(null)}
                className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent transition-colors ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${dragId === col.id ? 'opacity-40' : ''}`}
              >
                {draggable && (
                  <DotsSixVertical
                    className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0"
                    weight="bold"
                  />
                )}
                <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                  <Switch
                    checked={local.includes(col.id)}
                    onCheckedChange={() => toggle(col.id)}
                    className="scale-75"
                  />
                  <span className="text-xs text-foreground">{col.label}</span>
                </label>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Hook to load column preferences (legacy — only handles visibility)
export function useColumnPreferences(page: string, defaultColumns: ColumnDef[]) {
  const defaults = defaultColumns.filter(c => c.defaultVisible).map(c => c.id)
  const [visible, setVisible] = useState<string[]>(defaults)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api<{ visible_columns?: string[] } | null>('/preferences/' + page, { skipAuthRedirect: true })
      .then((config) => {
        if (config?.visible_columns) {
          setVisible(config.visible_columns)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [page])

  return { visible, setVisible, loaded }
}
