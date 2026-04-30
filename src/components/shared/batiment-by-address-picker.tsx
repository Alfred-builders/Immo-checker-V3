import { useState, useEffect, useRef } from 'react'
import { Buildings, Plus, Check, MagnifyingGlass, X, SpinnerGap } from '@phosphor-icons/react'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { useBatiments, useBatimentDetail } from 'src/features/patrimoine/api'
import { formatBatimentLabel, formatAddressShort } from 'src/features/patrimoine/labels'
import { CreateBuildingModal } from 'src/features/patrimoine/components/create-building-modal'
import { cn } from '../../lib/cn'

interface Props {
  /** Currently selected building id (controlled). */
  value: string | null
  onChange: (batimentId: string | null) => void
  className?: string
}

/**
 * Building picker — search by name OR address (Flat Checker · avr. 2026).
 *
 * One unified search bar. Matches drop down below as cards. If no match,
 * the user clicks "Créer un nouveau bâtiment" to open a popup (separate
 * Dialog). On success the new building is auto-selected.
 *
 * Why a popup and not an inline section: this picker is rendered inside the
 * lot modal's <form>. A nested <form> for create would bubble its submit to
 * the outer form and trigger the lot modal's onCreated redirect. The popup
 * is its own Dialog, separate from the lot form, so submits stay scoped.
 */
export function BatimentByAddressPicker({ value, onChange, className }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce 200ms — server search hits designation, num_batiment, address.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 200)
    return () => clearTimeout(t)
  }, [query])

  // No query → show the 3 most recently created buildings as suggestions.
  // With a query → server-side full-text match on designation/num/address.
  const { data: searchData, isFetching } = useBatiments(
    debouncedQuery
      ? { search: debouncedQuery, limit: 8 }
      : { sort: 'recent', limit: 3 },
  )
  const matches = searchData?.data ?? []

  // Pull selected building's full data when value is set but not in current page.
  const { data: selectedDetail } = useBatimentDetail(
    value && !matches.find((b) => b.id === value) ? value : undefined,
  )
  const selected = matches.find((b) => b.id === value) ?? selectedDetail ?? null

  // Close dropdown on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-xs">Bâtiment *</Label>

      {/* Selected state — chip with change button.
          Two lines: building label + address (rue, ville). The address comes
          from `adresse_principale` (list response) or `adresses[]` (detail). */}
      {selected ? (() => {
        const adr =
          (selected as { adresse_principale?: { rue: string; ville: string } | null }).adresse_principale ??
          (selected as { adresses?: Array<{ type: string; rue: string; ville: string }> }).adresses?.find((a) => a.type === 'principale') ??
          null
        const addressText = formatAddressShort(adr, 45)
        const fullAddress = adr ? `${adr.rue}, ${adr.ville}` : undefined
        return (
          <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/[0.04] px-3 py-2">
            <Buildings className="h-4 w-4 text-primary shrink-0" weight="duotone" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{formatBatimentLabel(selected)}</p>
              {addressText && (
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5" title={fullAddress}>{addressText}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => { onChange(null); setQuery(''); setOpen(true) }}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 shrink-0"
            >
              Changer
            </button>
          </div>
        )
      })() : (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder="Rechercher par nom, numéro ou adresse…"
              className="pl-9 pr-9 h-9"
            />
            {isFetching && (
              <SpinnerGap className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
            {!isFetching && query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setOpen(true) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Effacer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {open && (
            <div className="absolute z-40 w-full mt-1 bg-surface-overlay border border-border/60 rounded-xl shadow-elevation-overlay overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {/* Loading */}
                {isFetching && matches.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground text-center">Recherche…</div>
                )}

                {/* No query — surface a discreet header above the recents */}
                {!isFetching && matches.length > 0 && !debouncedQuery && (
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 bg-muted/20 border-b border-border/30">
                    Bâtiments récents
                  </div>
                )}

                {/* Empty state — no query AND no buildings exist yet */}
                {!isFetching && matches.length === 0 && !debouncedQuery && (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    Aucun bâtiment encore. Créez-en un ci-dessous.
                  </div>
                )}

                {/* No results */}
                {!isFetching && matches.length === 0 && debouncedQuery && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Aucun bâtiment trouvé pour « {debouncedQuery} ».
                    </p>
                  </div>
                )}

                {/* Matches */}
                {matches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => { onChange(b.id); setOpen(false); setQuery('') }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors border-b border-border/30 last:border-b-0"
                  >
                    <Buildings className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" weight="duotone" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{formatBatimentLabel(b)}</p>
                      <p
                        className="text-[11px] text-muted-foreground truncate"
                        title={b.adresse_principale ? `${b.adresse_principale.rue}, ${b.adresse_principale.ville}` : undefined}
                      >
                        {formatAddressShort(b.adresse_principale, 40) ?? '—'}
                        {typeof b.nb_lots === 'number' && b.nb_lots > 0 && ` · ${b.nb_lots} lot${b.nb_lots > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    {b.id === value && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Create CTA — opens the building popup. */}
              <div className="border-t border-border/60 p-1">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setShowCreate(true) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Créer un nouveau bâtiment
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Popup creation — sits on top of the lot modal. CreateBuildingModal is
          its own <Dialog>+<form>, fully independent from the outer lot form.
          The current search query pre-fills the address autocomplete so the
          user doesn't retype what they just typed. */}
      <CreateBuildingModal
        open={showCreate}
        onOpenChange={setShowCreate}
        initialQuery={query.trim() || undefined}
        onCreated={(newId) => { onChange(newId); setShowCreate(false); setQuery('') }}
      />
    </div>
  )
}
