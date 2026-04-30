import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowCounterClockwise, Plus, PencilSimple, Warning, Trash, ClipboardText, SpinnerGap, Check, MagnifyingGlass } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from 'src/components/ui/tooltip'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment, useUpdateAddress, useAddAddress, useDeleteAddress } from '../api'
import { useRecentItems } from 'src/hooks/use-recent-items'
import { useMissions, useWorkspaceTechnicians } from '../../missions/api'
import { getPendingActions, getStatutMission } from '../../missions/types'
import type { Mission, StatutMission } from '../../missions/types'
import { MISSION_COLUMNS, DEFAULT_COL_WIDTHS, SORTABLE, MissionTh, MissionTd, getPeriodDates, type PeriodFilter, type SortDir } from '../../missions/components/missions-page'
import { ColumnConfig } from 'src/components/shared/column-config'
import { DynamicFilter, applyDynamicFilters, type FilterField, type ActiveFilter } from 'src/components/shared/dynamic-filter'
import { usePagePreference } from 'src/lib/use-page-preference'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { CreateLotModal } from './create-lot-modal'
import { ConfirmDialog } from '../../../components/shared/confirm-dialog'
import { formatBatimentLabel, formatLotLabel } from '../labels'
import { toast } from 'sonner'
import { undoableToast } from 'src/lib/undoable-toast'

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble', maison: 'Maison', local_commercial: 'Local commercial', mixte: 'Mixte', autre: 'Autre',
}

interface AddressForm {
  id: string
  isNew?: boolean
  type: string
  rue: string
  complement: string
  code_postal: string
  ville: string
  latitude?: number
  longitude?: number
}

export function BuildingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [editing, setEditing] = useState(false)
  const { data: batiment, isLoading } = useBatimentDetail(id)
  const { addItem: addRecent } = useRecentItems()

  // Auto-set breadcrumbs when data loads (survives page refresh)
  useEffect(() => {
    if (batiment && !(location.state as any)?.breadcrumbs) {
      navigate(location.pathname, { replace: true, state: { breadcrumbs: [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: formatBatimentLabel(batiment) }] } })
    }
  }, [batiment?.id, batiment?.designation, batiment?.num_batiment])

  // Track visit pour l'historique Cmd+K.
  useEffect(() => {
    if (!batiment) return
    const ville = (batiment as any).adresse_principale?.ville ?? (batiment as any).adresses?.[0]?.ville
    addRecent({
      id: batiment.id,
      type: 'batiment',
      label: formatBatimentLabel(batiment),
      subtitle: ville || undefined,
      to: `/app/patrimoine/batiments/${batiment.id}`,
    })
  }, [batiment?.id, addRecent])
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()
  const updateAddr = useUpdateAddress()
  const addAddr = useAddAddress()
  const deleteAddr = useDeleteAddress()
  const lotCols = useResizableColumns({ designation: 220, type: 120, etage: 80, nb_pieces: 90, surface: 90, meuble: 80 })

  const [formData, setFormData] = useState({
    designation: '',
    num_batiment: '',
    type: '',
    nb_etages: '',
    annee_construction: '',
    commentaire: '',
  })
  const [addrForms, setAddrForms] = useState<AddressForm[]>([])
  const [addrDeleteIdx, setAddrDeleteIdx] = useState<number | null>(null)
  const [addrDeleting, setAddrDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)

  function batimentToForm(b: typeof batiment) {
    return {
      designation: b?.designation || '',
      num_batiment: b?.num_batiment || '',
      type: b?.type || '',
      nb_etages: b?.nb_etages?.toString() || '',
      annee_construction: b?.annee_construction?.toString() || '',
      commentaire: b?.commentaire || '',
    }
  }

  function batimentToAddrForms(b: typeof batiment): AddressForm[] {
    return (b?.adresses ?? []).map((a: any) => ({
      id: a.id,
      type: a.type,
      rue: a.rue || '',
      complement: a.complement || '',
      code_postal: a.code_postal || '',
      ville: a.ville || '',
      latitude: a.latitude,
      longitude: a.longitude,
    }))
  }

  // Sync form data when batiment loads or editing starts
  useEffect(() => {
    if (batiment) {
      setFormData(batimentToForm(batiment))
      setAddrForms(batimentToAddrForms(batiment))
    }
  }, [batiment, editing])

  const hasChanges = !!batiment && (
    JSON.stringify(formData) !== JSON.stringify(batimentToForm(batiment)) ||
    JSON.stringify(addrForms) !== JSON.stringify(batimentToAddrForms(batiment))
  )

  async function handleSave() {
    if (!hasChanges) { setEditing(false); return }
    setSaving(true)
    try {
      // Save building info
      await updateMutation.mutateAsync({
        id: batiment!.id,
        designation: formData.designation.trim() || null,
        num_batiment: formData.num_batiment.trim() || null,
        type: formData.type,
        nb_etages: formData.nb_etages ? parseInt(formData.nb_etages) : null,
        annee_construction: formData.annee_construction ? parseInt(formData.annee_construction) : null,
        commentaire: formData.commentaire || null,
      })
      // Save each remaining address
      for (const addr of addrForms) {
        if (addr.isNew) {
          await addAddr.mutateAsync({
            batimentId: batiment!.id,
            type: addr.type,
            rue: addr.rue,
            complement: addr.complement || undefined,
            code_postal: addr.code_postal,
            ville: addr.ville,
            latitude: addr.latitude,
            longitude: addr.longitude,
          })
        } else {
          await updateAddr.mutateAsync({
            batimentId: batiment!.id,
            adresseId: addr.id,
            type: addr.type,
            rue: addr.rue,
            complement: addr.complement || undefined,
            code_postal: addr.code_postal,
            ville: addr.ville,
            latitude: addr.latitude,
            longitude: addr.longitude,
          })
        }
      }
      toast.success('Bâtiment mis à jour')
      setTimeout(() => setEditing(false), 300)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (batiment) {
      setFormData(batimentToForm(batiment))
      setAddrForms(batimentToAddrForms(batiment))
    }
    setEditing(false)
  }

  function updateAddrField(idx: number, field: keyof AddressForm, value: any) {
    setAddrForms(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a))
  }

  if (isLoading) {
    return (
      <div className="px-8 py-6 space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-2 gap-5"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-72 rounded-2xl" /></div>
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    )
  }

  if (!batiment) return <div className="px-8 py-6"><p className="text-muted-foreground">Bâtiment introuvable</p></div>

  async function handleArchive() {
    if (!id) return
    // Restauration = action positive non destructive → toast simple immédiat.
    if (batiment!.est_archive) {
      try {
        await updateMutation.mutateAsync({ id, est_archive: false })
        toast.success('Bâtiment restauré')
      } catch (err: any) { toast.error(err.message || 'Erreur') }
      return
    }
    // Suppression = pattern Gmail avec undo.
    undoableToast({
      message: 'Bâtiment supprimé',
      run: () => updateMutation.mutateAsync({ id, est_archive: true }),
    })
  }

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              {editing ? (
                <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} className="text-xl font-semibold h-auto py-1 px-2 border-primary/30 bg-primary/[0.03] max-w-md" />
              ) : (
                <h1 className="text-xl font-semibold text-foreground">{formatBatimentLabel(batiment)}</h1>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {batiment.est_archive && <Badge variant="destructive" className="text-[11px]">Supprimé</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!batiment.est_archive && !editing && (
            <Button variant="outline" size="sm" className="gap-1.5 border-border/60 hover:border-foreground/20 hover:bg-accent" onClick={() => setEditing(true)}>
              <PencilSimple className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
          {!batiment.est_archive && editing && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel} disabled={saving}>Annuler</Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving || !hasChanges}>
                {saving ? <SpinnerGap className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Sauvegarder
              </Button>
            </>
          )}
          <Button variant="outline" size="sm"
            className={batiment.est_archive ? 'gap-1.5 border-border/60 hover:border-foreground/20 hover:bg-accent' : 'gap-1.5 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/50'}
            onClick={() => setShowArchiveConfirm(true)}
          >
            {batiment.est_archive ? <ArrowCounterClockwise className="h-3.5 w-3.5" /> : <Trash className="h-3.5 w-3.5" />}
            {batiment.est_archive ? 'Restaurer' : 'Supprimer'}
          </Button>
        </div>
      </div>

      {batiment.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          <Warning className="h-3.5 w-3.5 shrink-0" />
          Ce bâtiment est supprimé.
        </div>
      )}

      {/* Two-column: Informations + Adresses */}
      <div className="grid grid-cols-2 gap-5">
        {/* Informations card */}
        <div data-card className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised">
          <div className="px-5 py-4 border-b border-border/60">
            <h2 className="text-sm font-semibold text-foreground">Informations</h2>
          </div>
          <div className="divide-y divide-border/50">
            <InfoRow label="Type" editing={editing} value={typeLabels[batiment.type] || batiment.type}>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="h-8 w-40 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </InfoRow>
            <InfoRow label="Numéro / lettre" editing={editing} value={batiment.num_batiment || '--'}>
              <Input value={(formData as any).num_batiment ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, num_batiment: e.target.value }))} placeholder="A, B, 1…" className="h-8 w-40 text-sm" />
            </InfoRow>
            <InfoRow label="Désignation" editing={editing} value={batiment.designation || '--'}>
              <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} placeholder="Les Lilas…" className="h-8 w-40 text-sm" />
            </InfoRow>
            <InfoRow label="Nb étages" editing={editing} value={batiment.nb_etages ?? '--'}>
              <Input type="number" value={formData.nb_etages} onChange={(e) => setFormData(prev => ({ ...prev, nb_etages: e.target.value }))} className="h-8 w-40 text-sm" />
            </InfoRow>
            <InfoRow label="Année construction" editing={editing} value={batiment.annee_construction ?? '--'}>
              <Input type="number" value={formData.annee_construction} onChange={(e) => setFormData(prev => ({ ...prev, annee_construction: e.target.value }))} className="h-8 w-40 text-sm" />
            </InfoRow>
            <InfoRow label="Commentaire" editing={editing} value={batiment.commentaire || '--'}>
              <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} className="text-sm min-h-[40px] w-60" />
            </InfoRow>
          </div>
        </div>

        {/* Adresses card */}
        <div data-card className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised">
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Adresses</h2>
            {!batiment.est_archive && (
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setShowAddAddress(true)}>
                <Plus className="h-3 w-3" /> Ajouter
              </Button>
            )}
          </div>

          {addrForms.length > 0 ? (
            <div className="divide-y divide-border/30">
              {addrForms.map((a, idx) => (
                <div key={a.id} className="px-5 py-4">
                  {editing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Select value={a.type} onValueChange={(v) => updateAddrField(idx, 'type', v)}>
                          <SelectTrigger className="h-7 w-[110px] text-[11px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="principale">Principale</SelectItem>
                            <SelectItem value="secondaire">Secondaire</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-1">
                          <AddressAutocomplete
                            value={a.rue}
                            onChange={(addr) => {
                              if (addr) {
                                const next = [...addrForms]
                                next[idx] = { ...next[idx], rue: addr.rue, code_postal: addr.code_postal, ville: addr.ville, latitude: addr.latitude, longitude: addr.longitude }
                                setAddrForms(next)
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddrDeleteIdx(idx)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          title="Supprimer"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 pl-[122px]">
                        <Input value={a.complement} onChange={(e) => updateAddrField(idx, 'complement', e.target.value)} placeholder="Complement..." className="h-7 text-xs flex-1" />
                        <Input value={`${a.code_postal} ${a.ville}`} readOnly tabIndex={-1} className="h-7 text-xs bg-muted/50 text-muted-foreground cursor-default w-[160px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className={`text-[11px] capitalize shrink-0 mt-0.5 ${a.type === 'principale' ? 'bg-primary/10 text-primary border-primary/20' : ''}`}>{a.type}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate mb-0.5">
                          {a.rue}{a.complement ? `, ${a.complement}` : ''}
                        </div>
                        <span className="text-xs text-muted-foreground">{a.code_postal} {a.ville}</span>
                      </div>
                      {a.latitude && a.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors shrink-0"
                          title="Ouvrir dans Google Maps"
                        >
                          <svg width="18" height="18" viewBox="0 0 92.3 132.3" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                            <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3L10.8 16.5z"/>
                            <path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3z"/>
                            <path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3z"/>
                            <path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2z"/>
                          </svg>
                        </a>
                      ) : null}
                      {!batiment.est_archive && (
                        <button
                          type="button"
                          onClick={() => setAddrDeleteIdx(idx)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          title="Supprimer cette adresse"
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground text-sm">Aucune adresse</div>
          )}
        </div>
      </div>

      {/* Lots table */}
      <div data-card className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lots ({lots?.length ?? 0})</h2>
          {!batiment.est_archive && (
            <Button size="sm" onClick={() => setShowCreateLot(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter un lot
            </Button>
          )}
        </div>

       <div className="overflow-x-auto">
        <div className="min-w-max">
        <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50 select-none">
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.designation, minWidth: 40 }}>
            Désignation<ResizeHandle colId="designation" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.type, minWidth: 40 }}>
            Type<ResizeHandle colId="type" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.etage, minWidth: 40 }}>
            Étage<ResizeHandle colId="etage" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.nb_pieces, minWidth: 40 }}>
            Pièces<ResizeHandle colId="nb_pieces" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0 text-right" style={{ width: lotCols.colWidths.surface, minWidth: 40 }}>
            Surface<ResizeHandle colId="surface" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="shrink-0" style={{ width: lotCols.colWidths.meuble, minWidth: 40 }}>Meublé</div>
        </div>

        {lots && lots.length > 0 ? (
          <div className="divide-y divide-border/30">
            {lots.map((lot) => (
              <div key={lot.id} className="flex items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`, { state: { breadcrumbs: [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: formatBatimentLabel(batiment), href: `/app/patrimoine/batiments/${batiment.id}` }, { label: formatLotLabel(lot) }] } })}>
                <div className="shrink-0 text-sm font-medium text-foreground truncate" style={{ width: lotCols.colWidths.designation }}>{formatLotLabel(lot)}</div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.type }}>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] capitalize">{lot.type_bien.replace('_', ' ')}</Badge>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground" style={{ width: lotCols.colWidths.etage }}>{lot.etage || '--'}</div>
                <div className="shrink-0 text-sm text-muted-foreground" style={{ width: lotCols.colWidths.nb_pieces }}>{lot.nb_pieces || '--'}</div>
                <div className="shrink-0 text-sm text-muted-foreground text-right" style={{ width: lotCols.colWidths.surface }}>{lot.surface ? `${lot.surface} m²` : '--'}</div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.meuble }}>
                  <Badge variant="outline" className={lot.meuble ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]' : 'bg-muted/50 text-muted-foreground border-border/60 text-[11px]'}>
                    {lot.meuble ? 'Oui' : 'Non'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground text-sm">Aucun lot</div>
        )}
        </div>
       </div>
      </div>

      {/* Missions table */}
      <BatimentMissionsTable batimentId={batiment.id} />

      <CreateLotModal open={showCreateLot} onOpenChange={setShowCreateLot} preselectedBatimentId={id} onCreated={(lotId) => navigate(`/app/patrimoine/lots/${lotId}`)} />
      <FloatingSaveBar visible={editing} hasChanges={hasChanges} onSave={handleSave} onCancel={handleCancel} saving={saving} />
      <ConfirmDialog
        open={addrDeleteIdx !== null}
        onOpenChange={(open) => { if (!open && !addrDeleting) setAddrDeleteIdx(null) }}
        title="Supprimer cette adresse ?"
        description="Cette action est irréversible."
        confirmLabel={addrDeleting ? 'Suppression...' : 'Supprimer'}
        variant="destructive"
        onConfirm={async () => {
          if (addrDeleteIdx === null) return
          const addr = addrForms[addrDeleteIdx]
          const idx = addrDeleteIdx
          // Retrait optimiste immédiat de l'UI.
          setAddrForms(prev => prev.filter((_, i) => i !== idx))
          setAddrDeleteIdx(null)
          if (addr.isNew) {
            // Brouillon non persisté — pas d'API à différer.
            toast.success('Adresse retirée', { position: 'bottom-left' })
            return
          }
          undoableToast({
            message: 'Adresse supprimée',
            run: () => deleteAddr.mutateAsync({ batimentId: batiment!.id, adresseId: addr.id }),
            onUndo: () => setAddrForms(prev => {
              // Re-insère à l'index d'origine (clamp si la liste a changé).
              const next = [...prev]
              next.splice(Math.min(idx, next.length), 0, addr)
              return next
            }),
          })
        }}
      />
      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={batiment.est_archive ? 'Restaurer ce bâtiment ?' : 'Supprimer ce bâtiment ?'}
        description={batiment.est_archive
          ? 'Le bâtiment et ses lots redeviendront visibles dans les listes et les recherches.'
          : 'Le bâtiment et ses lots seront masqués des listes, recherches et pickers. Les missions existantes restent consultables.'}
        confirmLabel={batiment.est_archive ? 'Restaurer' : 'Supprimer'}
        variant={batiment.est_archive ? 'default' : 'destructive'}
        onConfirm={handleArchive}
      />
      <AddAddressDialog
        open={showAddAddress}
        onOpenChange={setShowAddAddress}
        batimentId={batiment.id}
        hasExistingAddresses={addrForms.length > 0}
        onAdded={() => setShowAddAddress(false)}
      />
    </div>
  )
}

/* ---- Add Address Dialog ---- */
function AddAddressDialog({ open, onOpenChange, batimentId, hasExistingAddresses, onAdded }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  batimentId: string
  hasExistingAddresses: boolean
  onAdded: () => void
}) {
  const addAddr = useAddAddress()
  const [type, setType] = useState<string>('')
  const [rue, setRue] = useState('')
  const [complement, setComplement] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [saving, setSaving] = useState(false)

  // Reset form and set default type when dialog opens
  useEffect(() => {
    if (open) {
      setType(hasExistingAddresses ? 'secondaire' : 'principale')
      setRue('')
      setComplement('')
      setCodePostal('')
      setVille('')
      setLatitude(undefined)
      setLongitude(undefined)
    }
  }, [open, hasExistingAddresses])

  async function handleSubmit() {
    if (!rue || !codePostal || !ville) {
      toast.error('Veuillez sélectionner une adresse')
      return
    }
    setSaving(true)
    try {
      await addAddr.mutateAsync({
        batimentId,
        type,
        rue,
        complement: complement || undefined,
        code_postal: codePostal,
        ville,
        latitude,
        longitude,
      })
      toast.success('Adresse ajoutée')
      onAdded()
    } catch {
      toast.error('Erreur lors de l\'ajout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une adresse</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="principale">Principale</SelectItem>
                <SelectItem value="secondaire">Secondaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Adresse</Label>
            <AddressAutocomplete
              value={rue}
              placeholder="Rechercher une adresse..."
              onChange={(addr) => {
                if (addr) {
                  setRue(addr.rue)
                  setCodePostal(addr.code_postal)
                  setVille(addr.ville)
                  setLatitude(addr.latitude)
                  setLongitude(addr.longitude)
                }
              }}
            />
          </div>
          {rue && codePostal && (
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-sm space-y-0.5">
              <div className="font-medium text-foreground">{rue}</div>
              <div className="text-xs text-muted-foreground">{codePostal} {ville}</div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Complement (optionnel)</Label>
            <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Bat. A, Escalier 2..." className="h-9" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>Annuler</Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving || !rue}>
              {saving ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, value, editing, children }: { label: string; value: React.ReactNode; editing: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      {editing ? <div>{children}</div> : <span className="text-sm font-medium text-foreground">{value}</span>}
    </div>
  )
}

/* ─── Missions Table — aligned with /app/missions table ─── */
const BATIMENT_MISSIONS_PREF_KEY = 'batiment_missions_list'
const BATIMENT_MISSIONS_PREFS_DEFAULTS = {
  visible_columns: MISSION_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id),
  column_order: MISSION_COLUMNS.map((c) => c.id),
  filters: { period: 'all' as PeriodFilter, statut: 'all' },
  sort: { col: 'date', dir: 'desc' as SortDir },
}

function BatimentMissionsTable({ batimentId }: { batimentId: string }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dynamicFilters, setDynamicFilters] = useState<ActiveFilter[]>([])

  const { config: prefs, loaded: prefsLoaded, update: updatePrefs } = usePagePreference<typeof BATIMENT_MISSIONS_PREFS_DEFAULTS>(
    BATIMENT_MISSIONS_PREF_KEY,
    BATIMENT_MISSIONS_PREFS_DEFAULTS,
  )

  const [filters, setFiltersState] = useState(BATIMENT_MISSIONS_PREFS_DEFAULTS.filters)
  const [sort, setSortState] = useState(BATIMENT_MISSIONS_PREFS_DEFAULTS.sort)
  const [visibleCols, setVisibleColsState] = useState<string[]>(BATIMENT_MISSIONS_PREFS_DEFAULTS.visible_columns)
  const [columnOrder, setColumnOrderState] = useState<string[]>(BATIMENT_MISSIONS_PREFS_DEFAULTS.column_order)

  const syncedRef = useRef(false)
  useEffect(() => {
    if (!prefsLoaded || syncedRef.current) return
    syncedRef.current = true
    setFiltersState({ ...BATIMENT_MISSIONS_PREFS_DEFAULTS.filters, ...(prefs.filters || {}) })
    setSortState({ ...BATIMENT_MISSIONS_PREFS_DEFAULTS.sort, ...(prefs.sort || {}) })
    if (Array.isArray(prefs.visible_columns)) setVisibleColsState(prefs.visible_columns)
    if (Array.isArray(prefs.column_order)) setColumnOrderState(prefs.column_order)
  }, [prefsLoaded, prefs])

  function updateFilters(partial: Partial<typeof BATIMENT_MISSIONS_PREFS_DEFAULTS.filters>) {
    setFiltersState((prev) => {
      const next = { ...prev, ...partial }
      updatePrefs({ filters: next })
      return next
    })
  }
  function updateSort(next: { col: string; dir: SortDir }) { setSortState(next); updatePrefs({ sort: next }) }
  function setVisibleCols(next: string[]) { setVisibleColsState(next); updatePrefs({ visible_columns: next }) }
  function setColumnOrder(next: string[]) { setColumnOrderState(next); updatePrefs({ column_order: next }) }

  const periodDates = useMemo(() => getPeriodDates(filters.period), [filters.period])

  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  const filterFields: FilterField[] = useMemo(() => [
    { id: 'reference', label: 'Référence', type: 'text' },
    { id: 'lot_designation', label: 'Lot', type: 'text' },
    {
      id: 'technicien', label: 'Technicien', type: 'select',
      options: technicians.map((t) => ({ value: t.id, label: `${t.prenom} ${t.nom}` })),
      getValue: (m: Mission) => m.technicien?.user_id,
    },
    {
      id: 'statut', label: 'Statut', type: 'select',
      options: [
        { value: 'a_planifier', label: 'À planifier' },
        { value: 'planifie', label: 'Planifié' },
        { value: 'finalisee', label: 'Finalisée' },
        { value: 'infructueuse', label: 'Infructueuse' },
        { value: 'annulee', label: 'Annulée' },
      ],
      getValue: (m: Mission) => getStatutMission(m),
    },
    { id: 'avec_inventaire', label: 'Inventaire', type: 'boolean', getValue: (m: Mission) => m.avec_inventaire },
    { id: 'date_planifiee', label: 'Date mission', type: 'date' },
    { id: 'created_at', label: 'Créée le', type: 'date' },
    { id: 'commentaire', label: 'Commentaire', type: 'text' },
  ], [technicians])

  const { data: missionsData, isLoading } = useMissions({
    batiment_id: batimentId,
    search: search || undefined,
    statut_affichage: filters.statut !== 'all' ? (filters.statut as StatutMission) : undefined,
    ...periodDates,
    limit: 100,
  })

  const missionsRaw = missionsData?.data ?? []
  const missions = useMemo(
    () => applyDynamicFilters(missionsRaw, dynamicFilters, filterFields),
    [missionsRaw, dynamicFilters, filterFields],
  )

  const { colWidths, onResizeStart, onResize } = useResizableColumns(DEFAULT_COL_WIDTHS)

  function handleSort(col: string) {
    if (!SORTABLE[col]) return
    if (sort.col === col) updateSort({ col, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    else updateSort({ col, dir: col === 'date' || col === 'created_at' ? 'desc' : 'asc' })
  }

  const sortedMissions = useMemo(() => {
    const accessor = SORTABLE[sort.col]
    if (!accessor) return missions
    return [...missions].sort((a, b) => {
      const av = accessor(a) || ''
      const bv = accessor(b) || ''
      const cmp = av.localeCompare(bv, 'fr', { numeric: true })
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [missions, sort])

  const effectiveOrder: string[] = useMemo(() => {
    const knownIds = MISSION_COLUMNS.map((c) => c.id)
    const seen = new Set<string>()
    const out: string[] = []
    for (const id of columnOrder) {
      if (knownIds.includes(id) && !seen.has(id)) { out.push(id); seen.add(id) }
    }
    for (const id of knownIds) if (!seen.has(id)) out.push(id)
    return out
  }, [columnOrder])

  const visibleOrdered = effectiveOrder.filter((id) => visibleCols.includes(id))

  const hasActiveFilters =
    !!search ||
    filters.statut !== 'all' ||
    filters.period !== 'all' ||
    dynamicFilters.length > 0

  return (
    <div data-card className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised">
      <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
        <ClipboardText className="h-4 w-4 text-muted-foreground/60" />
        <h2 className="text-sm font-semibold text-foreground">Missions</h2>
        {missions.length > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">{missions.length}</span>}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap px-5 py-3 border-b border-border/40">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher une mission..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Select value={filters.period} onValueChange={(v) => updateFilters({ period: v as PeriodFilter })}>
          <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="Période" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.statut} onValueChange={(v) => updateFilters({ statut: v })}>
          <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="a_planifier">À planifier</SelectItem>
            <SelectItem value="planifie">Planifié</SelectItem>
            <SelectItem value="finalisee">Finalisée</SelectItem>
            <SelectItem value="infructueuse">Infructueuse</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>
        <DynamicFilter fields={filterFields} filters={dynamicFilters} onChange={setDynamicFilters} />
        <div className="flex-1" />
        <ColumnConfig
          page={BATIMENT_MISSIONS_PREF_KEY}
          columns={MISSION_COLUMNS}
          visibleColumns={visibleCols}
          onColumnsChange={setVisibleCols}
          order={effectiveOrder}
          onOrderChange={setColumnOrder}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr className="border-b border-border/30 group/thead bg-muted/20">
              <th className="w-[3%] px-2 py-3" />
              {visibleOrdered.map((id, idx) => {
                const def = MISSION_COLUMNS.find((c) => c.id === id)
                if (!def) return null
                const sortKey = SORTABLE[id] ? id : ''
                const last = idx === visibleOrdered.length - 1
                return (
                  <MissionTh
                    key={id}
                    col={sortKey}
                    label={def.label}
                    w={colWidths[id] ?? 120}
                    sortable={!!sortKey}
                    sortCol={sort.col}
                    sortDir={sort.dir}
                    onSort={handleSort}
                    colId={id}
                    onResizeStart={onResizeStart}
                    onResize={onResize}
                    last={last}
                  />
                )
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3,4].map(i => (
              <tr key={i} className="border-b border-border/20">
                <td className="px-2 py-3" /><td colSpan={Math.max(1, visibleOrdered.length)} className="px-3 py-3"><Skeleton className="h-4 w-full rounded-lg" /></td>
              </tr>
            ))}
            {!isLoading && missions.length === 0 && (
              <tr><td colSpan={visibleOrdered.length + 1} className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 mb-3">
                  <ClipboardText className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {hasActiveFilters ? 'Aucune mission trouvée' : 'Aucune mission pour ce bâtiment'}
                </p>
                {hasActiveFilters && <p className="text-[11px] text-muted-foreground/60 mt-1">Essayez avec d'autres critères</p>}
              </td></tr>
            )}
            {!isLoading && sortedMissions.map((mission) => {
              const pending = getPendingActions(mission)
              return (
                <tr
                  key={mission.id}
                  className="border-b border-border/15 last:border-0 hover:bg-primary/[0.03] cursor-pointer transition-all duration-150 group"
                  onClick={() => navigate(`/app/missions/${mission.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: mission.reference }] } })}
                >
                  <td className="px-2 py-3 text-center">
                    {pending.length > 0 && (
                      <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto" />
                      </TooltipTrigger><TooltipContent side="right" className="text-xs">
                        {pending.map((a, i) => <div key={i}>{a}</div>)}
                      </TooltipContent></Tooltip></TooltipProvider>
                    )}
                  </td>
                  {visibleOrdered.map((id) => <MissionTd key={id} colId={id} mission={mission} />)}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

