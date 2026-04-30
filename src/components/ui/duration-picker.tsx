import { useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { formatDurationLabel } from 'src/lib/time'
import { cn } from 'src/lib/cn'

interface Props {
  value: number | null
  onChange: (minutes: number | null) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

const PRESETS = [30, 45, 60, 75, 90, 105, 120, 150, 180, 240]

export function DurationPicker({ value, onChange, disabled, className, placeholder = 'Durée…' }: Props) {
  // Inclut la valeur actuelle si elle ne fait pas partie des presets — pour
  // afficher correctement les missions existantes avec une durée atypique.
  const options = useMemo(() => {
    const set = new Set<number>(PRESETS)
    if (value !== null && value > 0) set.add(value)
    return Array.from(set).sort((a, b) => a - b)
  }, [value])

  return (
    <Select
      value={value !== null && value > 0 ? String(value) : ''}
      onValueChange={(v) => onChange(v ? parseInt(v, 10) : null)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {/* ~5 items visibles, scroll au-delà — chaque SelectItem ≈ 36px */}
      <SelectContent position="popper" className="max-h-[12rem]">
        {options.map((mins) => (
          <SelectItem key={mins} value={String(mins)}>
            {formatDurationLabel(mins)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
