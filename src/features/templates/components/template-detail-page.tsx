import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft, Plus, MagnifyingGlass, X, SpinnerGap, Minus, Package,
} from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Skeleton } from 'src/components/ui/skeleton'
import { ScrollArea } from 'src/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import {
  useTypePieceDetail,
  useTemplatePieceItems,
  useCatalogueItems,
  useLinkPieceItem,
  useUnlinkPieceItem,
  useUpdatePieceItem,
} from '../api'
import type { CatalogueContexte, CatalogueCategorie, CatalogueItem, TemplatePieceItem } from '../types'
import { catalogueCategorieLabels } from '../types'

const categorieColors: Record<CatalogueCategorie, string> = {
  revetement_sol: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  revetement_mur: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  revetement_plafond: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  menuiserie: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  plomberie: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  electricite: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  chauffage: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  ventilation: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  electromenager: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  mobilier: 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  equipement: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  serrurerie: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  vitrage: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  exterieur: 'bg-lime-50 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
  divers: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  structure: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  securite: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}

type ContexteTab = CatalogueContexte

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ContexteTab>('edl')
  const [showAddItem, setShowAddItem] = useState(false)

  const { data: piece, isLoading: pieceLoading } = useTypePieceDetail(id)
  const { data: templateItems, isLoading: itemsLoading } = useTemplatePieceItems(id)

  const isLoading = pieceLoading || itemsLoading

  // Filter by contexte tab
  const filteredItems = useMemo(() => {
    if (!templateItems) return []
    return templateItems.filter((ti) => ti.item?.contexte === tab)
  }, [templateItems, tab])

  // Group by categorie
  const grouped = useMemo(() => {
    const groups: Record<string, (TemplatePieceItem & { item: CatalogueItem })[]> = {}
    filteredItems.forEach((ti) => {
      if (!ti.item) return
      const cat = ti.item.categorie
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(ti as TemplatePieceItem & { item: CatalogueItem })
    })
    // Sort categories alphabetically
    return Object.entries(groups).sort(([a], [b]) =>
      (catalogueCategorieLabels[a as CatalogueCategorie] ?? a)
        .localeCompare(catalogueCategorieLabels[b as CatalogueCategorie] ?? b)
    )
  }, [filteredItems])

  const tabs: { key: ContexteTab; label: string }[] = [
    { key: 'edl', label: 'EDL' },
    { key: 'inventaire', label: 'Inventaire' },
  ]

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
      {/* Add item dialog */}
      {id && (
        <AddItemDialog
          open={showAddItem}
          onOpenChange={setShowAddItem}
          typePieceId={id}
          contexte={tab}
          existingItemIds={(templateItems ?? []).map((ti) => ti.catalogue_item_id)}
        />
      )}

      {/* Header with back button */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 mt-0.5 shrink-0"
          onClick={() => navigate('/app/parametres/templates')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
          ) : piece ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{piece.icon || '🏠'}</span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{piece.nom}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configurez les items associes a ce type de piece
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Type de piece introuvable</p>
          )}
        </div>
      </div>

      {/* Tabs + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1 w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAddItem(true)}>
          <Plus className="h-4 w-4" /> Ajouter un item
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
            <Package className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Aucun item {tab === 'edl' ? 'EDL' : 'inventaire'} associe
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Ajoutez des items du catalogue a ce type de piece
          </p>
        </div>
      )}

      {/* Grouped items */}
      {!isLoading && grouped.map(([cat, items]) => (
        <div key={cat} className="bg-card rounded-2xl border-0 shadow-elevation-raised overflow-hidden">
          {/* Category header */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/60 bg-muted/30">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${categorieColors[cat as CatalogueCategorie] || 'bg-muted text-muted-foreground'}`}>
              {catalogueCategorieLabels[cat as CatalogueCategorie] || cat}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {items.length} item{items.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Item rows */}
          {items.map((ti) => (
            <TemplateItemRow
              key={ti.id}
              templateItem={ti}
              typePieceId={id!}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Template Item Row ──

function TemplateItemRow({
  templateItem,
  typePieceId,
}: {
  templateItem: TemplatePieceItem & { item: CatalogueItem }
  typePieceId: string
}) {
  const updateMutation = useUpdatePieceItem()
  const unlinkMutation = useUnlinkPieceItem()

  function handleQuantityChange(delta: number) {
    const newQty = Math.max(1, (templateItem.quantite_defaut || 1) + delta)
    updateMutation.mutate(
      { typePieceId, itemId: templateItem.id, quantite_defaut: newQty },
      { onError: () => toast.error('Erreur de mise à jour') }
    )
  }

  function handleUnlink() {
    unlinkMutation.mutate(
      { typePieceId, itemId: templateItem.id },
      {
        onSuccess: () => toast.success(`"${templateItem.item.nom}" retire`),
        onError: () => toast.error('Erreur'),
      }
    )
  }

  const qty = templateItem.quantite_defaut || 1

  return (
    <div className="group flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors duration-200 border-t border-border/40 first:border-t-0">
      {/* Item name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{templateItem.item.nom}</p>
        {templateItem.item.aide_contextuelle && (
          <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
            {templateItem.item.aide_contextuelle}
          </p>
        )}
      </div>

      {/* Labels (when qty > 1) */}
      {qty > 1 && templateItem.labels_defaut && templateItem.labels_defaut.length > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          {templateItem.labels_defaut.map((label, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/50 text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Quantity control */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => handleQuantityChange(-1)}
          disabled={qty <= 1 || updateMutation.isPending}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="inline-flex items-center justify-center h-7 w-8 rounded-lg bg-muted/50 text-xs font-semibold text-foreground/70 tabular-nums">
          {qty}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => handleQuantityChange(1)}
          disabled={updateMutation.isPending}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-destructive"
        onClick={handleUnlink}
        disabled={unlinkMutation.isPending}
      >
        {unlinkMutation.isPending ? (
          <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  )
}

// ── Add Item Dialog ──

function AddItemDialog({
  open,
  onOpenChange,
  typePieceId,
  contexte,
  existingItemIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  typePieceId: string
  contexte: CatalogueContexte
  existingItemIds: string[]
}) {
  const [search, setSearch] = useState('')
  const { data: allItems, isLoading } = useCatalogueItems({ contexte })
  const linkMutation = useLinkPieceItem()

  // Filter out already linked items + search
  const available = useMemo(() => {
    if (!allItems) return []
    const existingSet = new Set(existingItemIds)
    return allItems
      .filter((item) => !existingSet.has(item.id) && !item.parent_item_id && !item.est_archive)
      .filter((item) => !search || item.nom.toLowerCase().includes(search.toLowerCase()))
  }, [allItems, existingItemIds, search])

  // Group by categorie
  const grouped = useMemo(() => {
    const groups: Record<string, CatalogueItem[]> = {}
    available.forEach((item) => {
      if (!groups[item.categorie]) groups[item.categorie] = []
      groups[item.categorie].push(item)
    })
    return Object.entries(groups).sort(([a], [b]) =>
      (catalogueCategorieLabels[a as CatalogueCategorie] ?? a)
        .localeCompare(catalogueCategorieLabels[b as CatalogueCategorie] ?? b)
    )
  }, [available])

  function handleSelect(item: CatalogueItem) {
    linkMutation.mutate(
      { typePieceId, catalogue_item_id: item.id, quantite_defaut: item.qte_par_defaut || 1 },
      {
        onSuccess: () => toast.success(`"${item.nom}" ajoute`),
        onError: () => toast.error('Erreur'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSearch('') }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajouter un item ({contexte === 'edl' ? 'EDL' : 'Inventaire'})</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher un item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/60"
            autoFocus
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6 max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          )}

          {!isLoading && available.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search ? 'Aucun item trouve' : 'Tous les items sont deja associes'}
              </p>
            </div>
          )}

          {!isLoading && grouped.map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
                {catalogueCategorieLabels[cat as CatalogueCategorie] || cat}
              </p>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  disabled={linkMutation.isPending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors duration-200 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.nom}</p>
                    {item.aide_contextuelle && (
                      <p className="text-xs text-muted-foreground/60 truncate">{item.aide_contextuelle}</p>
                    )}
                  </div>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
