import { useState } from 'react'
import { Plus, X } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Input } from 'src/components/ui/input'
import { Badge } from 'src/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'
import { DatePicker } from 'src/components/shared/date-picker'

export interface FilterField {
  id: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'number' | 'date'
  options?: { value: string; label: string }[]
  // Custom accessor used when the record's shape doesn't match the filter id
  // (e.g. nested objects like `mission.technicien.user_id`).
  getValue?: (record: any) => string | number | boolean | null | undefined
}

export interface ActiveFilter {
  field: string
  operator: string
  value: string
}

const TEXT_OPERATORS = [
  { value: 'contains', label: 'contient' },
  { value: 'equals', label: 'est' },
  { value: 'not_equals', label: 'n\'est pas' },
  { value: 'starts_with', label: 'commence par' },
]

const SELECT_OPERATORS = [
  { value: 'equals', label: 'est' },
  { value: 'not_equals', label: 'n\'est pas' },
]

const BOOLEAN_OPERATORS = [
  { value: 'equals', label: 'est' },
]

const NUMBER_OPERATORS = [
  { value: 'equals', label: '=' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '>=' },
  { value: 'lte', label: '<=' },
]

const DATE_OPERATORS = [
  { value: 'equals', label: 'est le' },
  { value: 'before', label: 'avant le' },
  { value: 'after', label: 'après le' },
]

function getOperators(type: FilterField['type']) {
  switch (type) {
    case 'select': return SELECT_OPERATORS
    case 'boolean': return BOOLEAN_OPERATORS
    case 'number': return NUMBER_OPERATORS
    case 'date': return DATE_OPERATORS
    default: return TEXT_OPERATORS
  }
}

function formatDateLabel(iso: string): string {
  if (!iso) return '...'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Apply active filters against a record list using each field's `getValue`
// accessor when present. Centralised so the matching logic stays consistent
// with the operator dropdowns shown in the popover.
export function applyDynamicFilters<T>(
  records: T[],
  filters: ActiveFilter[],
  fields: FilterField[],
): T[] {
  if (filters.length === 0) return records
  return records.filter((record) => {
    for (const f of filters) {
      const fieldDef = fields.find((fd) => fd.id === f.field)
      if (!fieldDef) continue

      const raw = fieldDef.getValue
        ? fieldDef.getValue(record as any)
        : (record as any)[f.field]

      if (fieldDef.type === 'date') {
        const recDate = raw ? String(raw).slice(0, 10) : ''
        const filtDate = f.value ? f.value.slice(0, 10) : ''
        if (!filtDate) continue
        if (f.operator === 'equals' && recDate !== filtDate) return false
        if (f.operator === 'before' && (!recDate || recDate >= filtDate)) return false
        if (f.operator === 'after' && (!recDate || recDate <= filtDate)) return false
        continue
      }

      if (fieldDef.type === 'number') {
        const num = Number(raw)
        const target = Number(f.value)
        if (Number.isNaN(target)) continue
        switch (f.operator) {
          case 'equals': if (num !== target) return false; break
          case 'gt': if (!(num > target)) return false; break
          case 'lt': if (!(num < target)) return false; break
          case 'gte': if (!(num >= target)) return false; break
          case 'lte': if (!(num <= target)) return false; break
        }
        continue
      }

      const val = String(raw ?? '').toLowerCase()
      const target = f.value.toLowerCase()
      switch (f.operator) {
        case 'contains': if (!val.includes(target)) return false; break
        case 'equals': if (val !== target) return false; break
        case 'not_equals': if (val === target) return false; break
        case 'starts_with': if (!val.startsWith(target)) return false; break
      }
    }
    return true
  })
}

interface DynamicFilterProps {
  fields: FilterField[]
  filters: ActiveFilter[]
  onChange: (filters: ActiveFilter[]) => void
}

export function DynamicFilter({ fields, filters, onChange }: DynamicFilterProps) {
  const [open, setOpen] = useState(false)

  function addFilter() {
    const first = fields[0]
    if (!first) return
    const ops = getOperators(first.type)
    onChange([...filters, { field: first.id, operator: ops[0].value, value: '' }])
  }

  function updateFilter(index: number, updates: Partial<ActiveFilter>) {
    const next = [...filters]
    next[index] = { ...next[index], ...updates }
    // Reset operator and value when field changes
    if (updates.field) {
      const fieldDef = fields.find(f => f.id === updates.field)
      if (fieldDef) {
        const ops = getOperators(fieldDef.type)
        next[index].operator = ops[0].value
        next[index].value = ''
      }
    }
    onChange(next)
  }

  function removeFilter(index: number) {
    onChange(filters.filter((_, i) => i !== index))
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active filter badges */}
      {filters.map((f, i) => {
        const fieldDef = fields.find(fd => fd.id === f.field)
        const opLabel = getOperators(fieldDef?.type || 'text').find(o => o.value === f.operator)?.label || f.operator
        const valLabel = fieldDef?.type === 'select'
          ? fieldDef.options?.find(o => o.value === f.value)?.label || f.value
          : fieldDef?.type === 'boolean'
            ? f.value === 'true' ? 'Oui' : 'Non'
            : fieldDef?.type === 'date'
              ? formatDateLabel(f.value)
              : f.value

        return (
          <Badge key={i} variant="secondary" className="h-7 gap-1 pl-2 pr-1 text-xs font-normal bg-primary/10 text-primary border-primary/20">
            <span className="font-medium">{fieldDef?.label}</span>
            <span className="text-primary/60">{opLabel}</span>
            <span className="font-medium">{valLabel || '...'}</span>
            <button onClick={() => removeFilter(i)} className="ml-0.5 p-0.5 rounded hover:bg-primary/20">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      })}

      {/* Add filter button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2">
            <Plus className="h-3 w-3" />
            Filtre
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3 space-y-3">
          {filters.length === 0 && (
            <p className="text-[11px] text-muted-foreground mb-2">Ajoutez un filtre pour affiner les resultats</p>
          )}

          {filters.map((f, i) => {
            const fieldDef = fields.find(fd => fd.id === f.field)
            const operators = getOperators(fieldDef?.type || 'text')

            return (
              <div key={i} className="flex items-center gap-2">
                {/* Field */}
                <Select value={f.field} onValueChange={(v) => updateFilter(i, { field: v })}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fields.map(fd => <SelectItem key={fd.id} value={fd.id} className="text-xs">{fd.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Operator */}
                <Select value={f.operator} onValueChange={(v) => updateFilter(i, { operator: v })}>
                  <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {operators.map(op => <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Value */}
                {fieldDef?.type === 'select' ? (
                  <Select value={f.value} onValueChange={(v) => updateFilter(i, { value: v })}>
                    <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Valeur..." /></SelectTrigger>
                    <SelectContent>
                      {fieldDef.options?.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : fieldDef?.type === 'boolean' ? (
                  <Select value={f.value} onValueChange={(v) => updateFilter(i, { value: v })}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true" className="text-[11px]">Oui</SelectItem>
                      <SelectItem value="false" className="text-[11px]">Non</SelectItem>
                    </SelectContent>
                  </Select>
                ) : fieldDef?.type === 'date' ? (
                  <DatePicker
                    value={f.value}
                    onChange={(v) => updateFilter(i, { value: v })}
                    className="w-36 h-8 text-xs"
                  />
                ) : fieldDef?.type === 'number' ? (
                  <Input
                    type="number"
                    value={f.value}
                    onChange={(e) => updateFilter(i, { value: e.target.value })}
                    placeholder="Valeur..."
                    className="w-32 h-8 text-xs"
                  />
                ) : (
                  <Input
                    value={f.value}
                    onChange={(e) => updateFilter(i, { value: e.target.value })}
                    placeholder="Valeur..."
                    className="w-32 h-8 text-xs"
                  />
                )}

                <button onClick={() => removeFilter(i)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}

          <Button variant="ghost" size="sm" className="h-7 text-xs w-full justify-start gap-1 text-muted-foreground" onClick={addFilter}>
            <Plus className="h-3 w-3" /> Ajouter un filtre
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
