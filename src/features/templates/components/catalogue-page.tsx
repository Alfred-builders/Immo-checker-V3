import { useState, useMemo } from 'react'
import {
  MagnifyingGlass, Plus, SpinnerGap, Package, Lock, X, Tag, CaretRight, Archive,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Input } from 'src/components/ui/input'
import { Button } from 'src/components/ui/button'
import { Label } from 'src/components/ui/label'
import { Skeleton } from 'src/components/ui/skeleton'
import { ScrollArea } from 'src/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'src/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from 'src/components/ui/sheet'
import { Separator } from 'src/components/ui/separator'
import {
  useCatalogueItems,
  useCatalogueItemDetail,
  useCreateCatalogueItem,
  useArchiveCatalogueItem,
  useAddItemValeur,
  useRemoveItemValeur,
} from '../api'
import type { CatalogueItem, CatalogueContexte, CatalogueCategorie, CritereType } from '../types'
import { catalogueCategorieLabels } from '../types'

const ALL_CATEGORIES: CatalogueCategorie[] = [
  'revetement_sol', 'revetement_mur', 'revetement_plafond',
  'menuiserie', 'plomberie', 'electricite', 'chauffage', 'ventilation',
  'electromenager', 'mobilier', 'equipement', 'serrurerie',
  'vitrage', 'exterieur', 'divers', 'structure', 'securite',
]

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

const critereTypeLabels: Record<CritereType, string> = {
  caracteristiques: 'Caracteristiques',
  degradations: 'Degradations',
  couleur: 'Couleur',
}

export function CataloguePage() {
  const [tab, setTab] = useState<CatalogueContexte>('edl')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<CatalogueCategorie | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const { data: items, isLoading } = useCatalogueItems({
    contexte: tab,
    categorie: filterCat === 'all' ? undefined : filterCat,
    search: search || undefined,
  })

  // Only show top-level items (not sous-items)
  const topLevelItems = useMemo(() => {
    if (!items) return []
    return items.filter((item) => !item.parent_item_id)
  }, [items])

  const tabs: { key: CatalogueContexte; label: string }[] = [
    { key: 'edl', label: 'EDL' },
    { key: 'inventaire', label: 'Inventaire' },
  ]

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
      <CreateItemDialog open={showCreate} onOpenChange={setShowCreate} contexte={tab} />
      <ItemDetailDrawer itemId={selectedItemId} onClose={() => setSelectedItemId(null)} />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Catalogue d'items</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les items disponibles pour les EDL et inventaires
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nouvel item
        </Button>
      </div>

      {/* Tabs */}
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

      {/* Filters row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher un item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/60"
          />
        </div>
        <Select value={filterCat} onValueChange={(v) => setFilterCat(v as CatalogueCategorie | 'all')}>
          <SelectTrigger className="w-52 h-10 rounded-xl bg-card border-border/60 text-sm">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-sm">
                {catalogueCategorieLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border-0 shadow-elevation-raised overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border/60 text-xs font-medium text-muted-foreground select-none">
          <div className="flex-1 min-w-0">Nom</div>
          <div className="w-36 text-center">Catégorie</div>
          <div className="w-24 text-center">Source</div>
          <div className="w-24 text-center">Sous-items</div>
          <div className="w-24 text-center">Pieces</div>
          <div className="w-8" />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-4 flex-1 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-4 w-10 rounded-lg" />
                <Skeleton className="h-4 w-10 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && topLevelItems.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
              <Package className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucun item dans le catalogue'}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {search ? 'Essayez avec d\'autres critères' : 'Commencez par ajouter un item'}
            </p>
          </div>
        )}

        {/* Rows */}
        {!isLoading && topLevelItems.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-4 px-5 py-4 hover:bg-accent/50 cursor-pointer transition-colors duration-200 border-t border-border/40 first:border-t-0"
            onClick={() => setSelectedItemId(item.id)}
          >
            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary truncate transition-colors duration-200">
                {item.nom}
              </p>
              {item.est_archive && (
                <span className="text-[11px] text-muted-foreground/50">Archivé</span>
              )}
            </div>

            {/* Categorie */}
            <div className="w-36 text-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${categorieColors[item.categorie] || 'bg-muted text-muted-foreground'}`}>
                {catalogueCategorieLabels[item.categorie]}
              </span>
            </div>

            {/* Source */}
            <div className="w-24 text-center">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                item.source === 'plateforme'
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                  : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
              }`}>
                {item.source === 'plateforme' && <Lock className="h-2.5 w-2.5" />}
                {item.source === 'plateforme' ? 'Plateforme' : 'Workspace'}
              </span>
            </div>

            {/* Sous-items count */}
            <div className="w-24 text-center">
              {(item.nb_sous_items ?? 0) > 0 ? (
                <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-lg bg-muted/50 text-xs font-semibold text-foreground/70">
                  {item.nb_sous_items}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/30">--</span>
              )}
            </div>

            {/* Pieces count */}
            <div className="w-24 text-center">
              {(item.nb_pieces ?? 0) > 0 ? (
                <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-lg bg-muted/50 text-xs font-semibold text-foreground/70">
                  {item.nb_pieces}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/30">--</span>
              )}
            </div>

            {/* Chevron */}
            <div className="w-8 flex justify-center">
              <CaretRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors duration-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Create Item Dialog ──

function CreateItemDialog({
  open,
  onOpenChange,
  contexte,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contexte: CatalogueContexte
}) {
  const [nom, setNom] = useState('')
  const [categorie, setCategorie] = useState<CatalogueCategorie>('equipement')
  const [aide, setAide] = useState('')

  const createMutation = useCreateCatalogueItem()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) { toast.error('Le nom est requis'); return }

    try {
      await createMutation.mutateAsync({
        nom: nom.trim(),
        categorie,
        contexte,
        aide_contextuelle: aide.trim() || undefined,
      })
      toast.success(`"${nom.trim()}" créé`)
      setNom('')
      setAide('')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setNom(''); setAide('') } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel item ({contexte === 'edl' ? 'EDL' : 'Inventaire'})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nom *</Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Lavabo, Prise electrique..."
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Catégorie *</Label>
            <Select value={categorie} onValueChange={(v) => setCategorie(v as CatalogueCategorie)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-sm">
                    {catalogueCategorieLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Aide contextuelle</Label>
            <Input
              value={aide}
              onChange={(e) => setAide(e.target.value)}
              placeholder="Description ou instructions pour le technicien..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <SpinnerGap className="h-4 w-4 animate-spin mr-1.5" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Item Detail Drawer (Sheet) ──

function ItemDetailDrawer({
  itemId,
  onClose,
}: {
  itemId: string | null
  onClose: () => void
}) {
  const { data: detail, isLoading } = useCatalogueItemDetail(itemId ?? undefined)
  const archiveMutation = useArchiveCatalogueItem()

  function handleArchive() {
    if (!itemId || !detail) return
    archiveMutation.mutate(itemId, {
      onSuccess: () => { toast.success(`"${detail.nom}" archivé`); onClose() },
      onError: () => toast.error('Erreur'),
    })
  }

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
        {isLoading && (
          <div className="space-y-4 p-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && detail && (
          <>
            <SheetHeader>
              <SheetTitle>{detail.nom}</SheetTitle>
              <SheetDescription>
                {catalogueCategorieLabels[detail.categorie]} — {detail.contexte === 'edl' ? 'EDL' : 'Inventaire'}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-0.5">
              {/* Info section */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Catégorie</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${categorieColors[detail.categorie] || 'bg-muted text-muted-foreground'}`}>
                    {catalogueCategorieLabels[detail.categorie]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Source</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                    detail.source === 'plateforme'
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                      : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  }`}>
                    {detail.source === 'plateforme' && <Lock className="h-2.5 w-2.5" />}
                    {detail.source === 'plateforme' ? 'Plateforme' : 'Workspace'}
                  </span>
                </div>
                {detail.aide_contextuelle && (
                  <div>
                    <span className="text-xs text-muted-foreground">Aide contextuelle</span>
                    <p className="text-sm text-foreground mt-1">{detail.aide_contextuelle}</p>
                  </div>
                )}
              </div>

              {/* Sous-items */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Sous-items ({detail.sous_items.length})
                </h4>
                {detail.sous_items.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 italic">Aucun sous-item</p>
                ) : (
                  <div className="space-y-1">
                    {detail.sous_items.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                        <span className="text-sm text-foreground">{sub.nom}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Tags by critere */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-3">Valeurs referentiel</h4>
                {(['caracteristiques', 'degradations', 'couleur'] as CritereType[]).map((critere) => {
                  const vals = detail.valeurs.filter((v) => v.critere === critere)
                  return (
                    <TagSection
                      key={critere}
                      critere={critere}
                      label={critereTypeLabels[critere]}
                      values={vals}
                      itemId={detail.id}
                      readOnly={detail.source === 'plateforme'}
                    />
                  )
                })}
              </div>

              <Separator />

              {/* Actions */}
              {detail.source === 'workspace' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive/20 hover:bg-destructive/5"
                  onClick={handleArchive}
                  disabled={archiveMutation.isPending}
                >
                  {archiveMutation.isPending ? <SpinnerGap className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Archive className="h-3.5 w-3.5 mr-1.5" />}
                  Archiver cet item
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Tag Section (within drawer) ──

function TagSection({
  critere,
  label,
  values,
  itemId,
  readOnly,
}: {
  critere: CritereType
  label: string
  values: { id: string; valeur: string }[]
  itemId: string
  readOnly: boolean
}) {
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')
  const addMutation = useAddItemValeur()
  const removeMutation = useRemoveItemValeur()

  function handleAdd() {
    if (!newVal.trim()) return
    addMutation.mutate(
      { itemId, critere, valeur: newVal.trim() },
      {
        onSuccess: () => { setNewVal(''); setAdding(false); toast.success('Valeur ajoutée') },
        onError: () => toast.error('Erreur'),
      }
    )
  }

  function handleRemove(valeurId: string) {
    removeMutation.mutate(
      { itemId, valeurId },
      {
        onSuccess: () => toast.success('Valeur supprimée'),
        onError: () => toast.error('Erreur'),
      }
    )
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-foreground/70">{label}</span>
        {!readOnly && !adding && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setAdding(true)}>
            <Plus className="h-3 w-3 mr-0.5" /> Ajouter
          </Button>
        )}
      </div>

      {/* Add input */}
      {adding && (
        <div className="flex items-center gap-2 mb-2">
          <Input
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            placeholder={`Nouvelle ${label.toLowerCase()}...`}
            className="h-8 text-sm flex-1"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } if (e.key === 'Escape') setAdding(false) }}
          />
          <Button size="sm" className="h-8 px-2.5" onClick={handleAdd} disabled={addMutation.isPending}>
            {addMutation.isPending ? <SpinnerGap className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setAdding(false); setNewVal('') }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Tags */}
      {values.length === 0 && !adding ? (
        <p className="text-[11px] text-muted-foreground/40 italic">Aucune valeur</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v.id}
              className="group/tag inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted/50 text-foreground/70"
            >
              <Tag className="h-2.5 w-2.5 text-muted-foreground/50" />
              {v.valeur}
              {!readOnly && (
                <button
                  onClick={() => handleRemove(v.id)}
                  className="ml-0.5 opacity-0 group-hover/tag:opacity-100 transition-opacity duration-200"
                  disabled={removeMutation.isPending}
                >
                  <X className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
