import * as React from 'react'
import { CalendarBlank } from '@phosphor-icons/react'
import { format, parse, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

import { cn } from 'src/lib/cn'
import { Button } from 'src/components/ui/button'
import { Calendar } from 'src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
  id?: string
  /** Kept for API compatibility — Popover is always modal so it works inside Dialog/Sheet. */
  modal?: boolean
  'aria-invalid'?: boolean
}

function isoToDate(value?: string): Date | undefined {
  if (!value) return undefined
  const d = parse(value, 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : undefined
}

function dateToIso(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Choisir une date',
  className,
  disabled,
  required,
  min,
  max,
  id,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = isoToDate(value)
  const minDate = isoToDate(min)
  const maxDate = isoToDate(max)

  return (
    // modal: needed so the popover works inside Dialog/Sheet (cf. tech-picker)
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-required={required}
          className={cn(
            'h-9 w-full min-w-0 rounded-xl bg-card border-border/60 shadow-xs px-3.5 py-1 font-normal text-base md:text-sm justify-between gap-2 hover:border-border/90 hover:bg-card',
            'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/10',
            !selected && 'text-muted-foreground/70',
            className,
          )}
        >
          <span className="truncate">
            {selected ? format(selected, 'd MMM yyyy', { locale: fr }) : placeholder}
          </span>
          <CalendarBlank className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-elevation-overlay z-[60]" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) onChange?.(dateToIso(date))
            setOpen(false)
          }}
          locale={fr}
          disabled={
            minDate || maxDate
              ? (date) =>
                  (minDate ? date < minDate : false) ||
                  (maxDate ? date > maxDate : false)
              : undefined
          }
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
