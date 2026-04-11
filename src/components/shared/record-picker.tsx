import { useState, useRef, useEffect } from 'react'
import { MagnifyingGlass, Plus, Check } from '@phosphor-icons/react'
import { Input } from 'src/components/ui/input'
import { cn } from '../../lib/cn'

interface RecordPickerOption {
  id: string
  label: string
  sublabel?: string
  meta?: string
}

interface RecordPickerProps {
  options: RecordPickerOption[]
  value?: string | null
  onChange: (id: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  isLoading?: boolean
  onSearch?: (query: string) => void
  onCreateClick?: () => void
  createLabel?: string
  className?: string
}

export function RecordPicker({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  isLoading,
  onSearch,
  onCreateClick,
  createLabel = 'Créer',
  className,
}: RecordPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.id === value)

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(search.toLowerCase()) ||
        o.meta?.toLowerCase().includes(search.toLowerCase())
      )
    : options

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (onSearch) onSearch(search)
  }, [search, onSearch])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-input bg-background transition-colors',
          'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring',
          !selected && 'text-muted-foreground'
        )}
      >
        {selected ? (
          <span className="truncate">{selected.label}</span>
        ) : (
          <span>{placeholder}</span>
        )}
        <MagnifyingGlass className="h-3.5 w-3.5 ml-2 shrink-0 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-40 w-full mt-1 bg-surface-overlay border border-border/60 rounded-xl shadow-elevation-overlay overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-border/60">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading && (
              <div className="p-3 text-sm text-muted-foreground text-center">Chargement...</div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground text-center">Aucun résultat</div>
            )}
            {!isLoading &&
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    onChange(option.id)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{option.label}</p>
                    {option.sublabel && (
                      <p className="text-xs text-muted-foreground truncate">{option.sublabel}</p>
                    )}
                  </div>
                  {option.meta && (
                    <span className="text-xs text-muted-foreground shrink-0">{option.meta}</span>
                  )}
                  {option.id === value && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              ))}
          </div>

          {/* Create button */}
          {onCreateClick && (
            <div className="border-t border-border/60 p-1">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded transition-colors"
                onClick={() => {
                  setOpen(false)
                  setSearch('')
                  onCreateClick()
                }}
              >
                <Plus className="h-4 w-4" />
                {createLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
