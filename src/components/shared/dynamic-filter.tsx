import { useState } from 'react'
import { Plus, X, Funnel } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Input } from 'src/components/ui/input'
import { Badge } from 'src/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'

export interface FilterField {
  id: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'number'
  options?: { value: string; label: string }[]
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

function getOperators(type: FilterField['type']) {
  switch (type) {
    case 'select': return SELECT_OPERATORS
    case 'boolean': return BOOLEAN_OPERATORS
    case 'number': return NUMBER_OPERATORS
    default: return TEXT_OPERATORS
  }
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
            <p className="text-xs text-muted-foreground mb-2">Ajoutez un filtre pour affiner les resultats</p>
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
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Valeur..." /></SelectTrigger>
                    <SelectContent>
                      {fieldDef.options?.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : fieldDef?.type === 'boolean' ? (
                  <Select value={f.value} onValueChange={(v) => updateFilter(i, { value: v })}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true" className="text-xs">Oui</SelectItem>
                      <SelectItem value="false" className="text-xs">Non</SelectItem>
                    </SelectContent>
                  </Select>
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
