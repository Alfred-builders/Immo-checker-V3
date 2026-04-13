import { useState, useMemo } from 'react'
import {
  MagnifyingGlass, Plus, CaretDown, CaretRight, PencilSimple, Archive,
  GridFour, Lock, SpinnerGap,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from 'src/components/ui/input'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'src/components/ui/dialog'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from 'src/components/ui/collapsible'
import { useTypePieces, useCreateTypePiece, useUpdateTypePiece, useArchiveTypePiece } from '../api'
import type { TypePiece, CategoriePiece } from '../types'
import { categoriePieceLabels } from '../types'

const CATEGORIES_ORDER: CategoriePiece[] = [
  'vie', 'eau_sanitaires', 'circulations', 'exterieur_annexes', 'equipements', 'autres',
]

const categorieColors: Record<CategoriePiece, string> = {
  vie: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  eau_sanitaires: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  circulations: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  exterieur_annexes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  equipements: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  autres: 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400',
}

export function TemplatesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingPiece, setEditingPiece] = useState<TypePiece | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const { data: pieces, isLoading } = useTypePieces()
  const archiveMutation = useArchiveTypePiece()

  // Group pieces by categorie
  const grouped = useMemo(() => {
    const list = pieces ?? []
    const filtered = search
      ? list.filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()))
      : list
    const groups: Record<CategoriePiece, TypePiece[]> = {
      vie: [], eau_sanitaires: [], circulations: [],
      exterieur_annexes: [], equipements: [], autres: [],
    }
    filtered.forEach((p) => {
      if (groups[p.categorie_piece]) {
        groups[p.categorie_piece].push(p)
      }
    })
    return groups
  }, [pieces, search])

  function toggleCollapse(cat: CategoriePiece) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  function handleArchive(piece: TypePiece) {
    archiveMutation.mutate(piece.id, {
      onSuccess: () => toast.success(`"${piece.nom}" archive`),
      onError: () => toast.error('Erreur lors de l\'archivage'),
    })
  }

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
      <CreateEditPieceDialog
        open={showCreate || !!editingPiece}
        onOpenChange={(open) => {
          if (!open) { setShowCreate(false); setEditingPiece(null) }
        }}
        piece={editingPiece}
      />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Types de pieces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les types de pieces disponibles pour les templates EDL et inventaire
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nouveau type
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Rechercher un type de piece..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-card border-border/60"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised p-4">
              <Skeleton className="h-5 w-40 rounded-lg mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (pieces ?? []).length === 0 && !search && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
            <GridFour className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Aucun type de piece</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Commencez par creer un type de piece</p>
        </div>
      )}

      {/* Grouped sections */}
      {!isLoading && CATEGORIES_ORDER.map((cat) => {
        const items = grouped[cat]
        if (items.length === 0) return null
        const isOpen = !collapsed[cat]

        return (
          <Collapsible key={cat} open={isOpen} onOpenChange={() => toggleCollapse(cat)}>
            <div className="bg-card rounded-2xl border-0 shadow-elevation-raised overflow-hidden">
              {/* Group header */}
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-accent/30 transition-colors duration-200">
                  {isOpen
                    ? <CaretDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <CaretRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${categorieColors[cat]}`}>
                    {categoriePieceLabels[cat]}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {items.length} type{items.length > 1 ? 's' : ''}
                  </span>
                </button>
              </CollapsibleTrigger>

              {/* Rows */}
              <CollapsibleContent>
                <div className="border-t border-border/40">
                  {/* Column header */}
                  <div className="flex items-center gap-4 px-5 py-2.5 text-xs font-medium text-muted-foreground bg-muted/30">
                    <div className="w-8 shrink-0" />
                    <div className="flex-1 min-w-0">Nom</div>
                    <div className="w-24 text-center">Source</div>
                    <div className="w-20 text-center">Items</div>
                    <div className="w-24" />
                  </div>

                  {items.map((piece) => (
                    <div
                      key={piece.id}
                      className="group flex items-center gap-4 px-5 py-4 hover:bg-accent/50 cursor-pointer transition-colors duration-200 border-t border-border/40 first:border-t-0"
                      onClick={() => navigate(`/app/parametres/templates/${piece.id}`)}
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 shrink-0 rounded-xl bg-muted/50 flex items-center justify-center text-base">
                        {piece.icon || '🏠'}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary truncate transition-colors duration-200">
                          {piece.nom}
                        </p>
                        {piece.est_archive && (
                          <span className="text-[10px] text-muted-foreground/50">Archive</span>
                        )}
                      </div>

                      {/* Source */}
                      <div className="w-24 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                          piece.source === 'plateforme'
                            ? 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                            : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                        }`}>
                          {piece.source === 'plateforme' && <Lock className="h-2.5 w-2.5" />}
                          {piece.source === 'plateforme' ? 'Plateforme' : 'Workspace'}
                        </span>
                      </div>

                      {/* Items count */}
                      <div className="w-20 text-center">
                        {(piece.nb_items ?? 0) > 0 ? (
                          <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-lg bg-muted/50 text-xs font-semibold text-foreground/70">
                            {piece.nb_items}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/30">--</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="w-24 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {piece.source === 'workspace' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); setEditingPiece(piece) }}
                            >
                              <PencilSimple className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); handleArchive(piece) }}
                              disabled={archiveMutation.isPending}
                            >
                              <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">Lecture seule</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}

      {/* Search no results */}
      {!isLoading && search && Object.values(grouped).every((g) => g.length === 0) && (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
            <MagnifyingGlass className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Aucun resultat pour "{search}"</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Essayez avec d'autres critères</p>
        </div>
      )}
    </div>
  )
}

// ── Create / Edit Dialog ──

function CreateEditPieceDialog({
  open,
  onOpenChange,
  piece,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  piece: TypePiece | null
}) {
  const isEdit = !!piece
  const [nom, setNom] = useState('')
  const [categorie, setCategorie] = useState<CategoriePiece>('vie')
  const [icon, setIcon] = useState('')

  const createMutation = useCreateTypePiece()
  const updateMutation = useUpdateTypePiece()
  const isPending = createMutation.isPending || updateMutation.isPending

  // Reset form when opening
  function handleOpenChange(open: boolean) {
    if (open && piece) {
      setNom(piece.nom)
      setCategorie(piece.categorie_piece)
      setIcon(piece.icon)
    } else if (open) {
      setNom('')
      setCategorie('vie')
      setIcon('')
    }
    onOpenChange(open)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) { toast.error('Le nom est requis'); return }

    try {
      if (isEdit && piece) {
        await updateMutation.mutateAsync({ id: piece.id, nom: nom.trim(), icon: icon || piece.icon })
        toast.success(`"${nom.trim()}" mis a jour`)
      } else {
        await createMutation.mutateAsync({ nom: nom.trim(), categorie_piece: categorie, icon: icon || '🏠' })
        toast.success(`"${nom.trim()}" cree`)
      }
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le type de piece' : 'Nouveau type de piece'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nom *</Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Cuisine, Salon..."
              autoFocus
            />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Catégorie *</Label>
              <Select value={categorie} onValueChange={(v) => setCategorie(v as CategoriePiece)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES_ORDER.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-sm">
                      {categoriePieceLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Icone (emoji)</Label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🏠"
              className="max-w-20 text-center text-lg"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <SpinnerGap className="h-4 w-4 animate-spin mr-1.5" />}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
