import { useState, useEffect } from 'react'
import { GearSix, ArrowCounterClockwise, DotsSixVertical } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'
import { Switch } from 'src/components/ui/switch'
import { Separator } from 'src/components/ui/separator'
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
}

export function ColumnConfig({ page, columns, visibleColumns, onColumnsChange }: ColumnConfigProps) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<string[]>(visibleColumns)

  useEffect(() => {
    setLocal(visibleColumns)
  }, [visibleColumns])

  function toggle(id: string) {
    const next = local.includes(id) ? local.filter(c => c !== id) : [...local, id]
    setLocal(next)
    onColumnsChange(next)
    // Persist in background
    api('/preferences/' + page, {
      method: 'PUT',
      body: JSON.stringify({ config: { visible_columns: next } }),
    }).catch(() => {})
  }

  function reset() {
    const defaults = columns.filter(c => c.defaultVisible).map(c => c.id)
    setLocal(defaults)
    onColumnsChange(defaults)
    api('/preferences/' + page, {
      method: 'PUT',
      body: JSON.stringify({ config: { visible_columns: defaults } }),
    }).catch(() => {})
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <GearSix className="h-3.5 w-3.5" />
          Colonnes
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0">
        <div className="px-3 py-2.5 flex items-center justify-between border-b border-border/60">
          <span className="text-xs font-semibold text-foreground">Colonnes visibles</span>
          <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowCounterClockwise className="h-3 w-3" />
            Reinitialiser
          </button>
        </div>
        <div className="py-1 max-h-64 overflow-y-auto">
          {columns.map((col) => (
            <label
              key={col.id}
              className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-accent cursor-pointer transition-colors"
            >
              <Switch
                checked={local.includes(col.id)}
                onCheckedChange={() => toggle(col.id)}
                className="scale-75"
              />
              <span className="text-xs text-foreground">{col.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Hook to load column preferences
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
