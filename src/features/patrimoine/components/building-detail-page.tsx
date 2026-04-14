import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Archive, ArrowCounterClockwise, Plus, PencilSimple, Warning, Trash } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment, useUpdateAddress, useAddAddress, useDeleteAddress } from '../api'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { CreateLotModal } from './create-lot-modal'
import { ConfirmDialog } from '../../../components/shared/confirm-dialog'
import { toast } from 'sonner'

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

  // Auto-set breadcrumbs when data loads (survives page refresh)
  useEffect(() => {
    if (batiment?.designation && !(location.state as any)?.breadcrumbs) {
      navigate(location.pathname, { replace: true, state: { breadcrumbs: [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: batiment.designation }] } })
    }
  }, [batiment?.designation])
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()
  const updateAddr = useUpdateAddress()
  const addAddr = useAddAddress()
  const deleteAddr = useDeleteAddress()
  const lotCols = useResizableColumns({ designation: 220, type: 120, etage: 80, nb_pieces: 90, surface: 90, meuble: 80 })

  const [formData, setFormData] = useState({
    designation: '',
    type: '',
    nb_etages: '',
    annee_construction: '',
    commentaire: '',
  })
  const [addrForms, setAddrForms] = useState<AddressForm[]>([])
  const [deletedAddrIds, setDeletedAddrIds] = useState<string[]>([])
  const [addrDeleteIdx, setAddrDeleteIdx] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)

  // Sync form data when batiment loads or editing starts
  useEffect(() => {
    if (batiment) {
      setFormData({
        designation: batiment.designation || '',
        type: batiment.type || '',
        nb_etages: batiment.nb_etages?.toString() || '',
        annee_construction: batiment.annee_construction?.toString() || '',
        commentaire: batiment.commentaire || '',
      })
      setAddrForms((batiment.adresses ?? []).map((a: any) => ({
        id: a.id,
        type: a.type,
        rue: a.rue || '',
        complement: a.complement || '',
        code_postal: a.code_postal || '',
        ville: a.ville || '',
        latitude: a.latitude,
        longitude: a.longitude,
      })))
      setDeletedAddrIds([])
    }
  }, [batiment, editing])

  async function handleSave() {
    setSaving(true)
    try {
      // Save building info
      await updateMutation.mutateAsync({
        id: batiment!.id,
        designation: formData.designation,
        type: formData.type,
        nb_etages: formData.nb_etages ? parseInt(formData.nb_etages) : null,
        annee_construction: formData.annee_construction ? parseInt(formData.annee_construction) : null,
        commentaire: formData.commentaire || null,
      })
      // Delete removed addresses first
      for (const adresseId of deletedAddrIds) {
        await deleteAddr.mutateAsync({ batimentId: batiment!.id, adresseId })
      }
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
      setDeletedAddrIds([])
      setTimeout(() => setEditing(false), 300)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (batiment) {
      setFormData({
        designation: batiment.designation || '',
        type: batiment.type || '',
        nb_etages: batiment.nb_etages?.toString() || '',
        annee_construction: batiment.annee_construction?.toString() || '',
        commentaire: batiment.commentaire || '',
      })
      setAddrForms((batiment.adresses ?? []).map((a: any) => ({
        id: a.id, type: a.type, rue: a.rue || '', complement: a.complement || '',
        code_postal: a.code_postal || '', ville: a.ville || '', latitude: a.latitude, longitude: a.longitude,
      })))
      setDeletedAddrIds([])
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
    try {
      await updateMutation.mutateAsync({ id, est_archive: !batiment!.est_archive })
      toast.success(batiment!.est_archive ? 'Bâtiment restauré' : 'Bâtiment archivé')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
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
                <h1 className="text-xl font-semibold text-foreground">{batiment.designation}</h1>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {batiment.est_archive && <Badge variant="destructive" className="text-[10px]">Archivé</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!batiment.est_archive && !editing && (
            <Button variant="outline" size="sm" className="gap-1.5 border-border/60 hover:border-foreground/20 hover:bg-accent" onClick={() => setEditing(true)}>
              <PencilSimple className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
          <Button variant="outline" size="sm"
            className={batiment.est_archive ? 'gap-1.5 border-border/60 hover:border-foreground/20 hover:bg-accent' : 'gap-1.5 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/50'}
            onClick={() => setShowArchiveConfirm(true)}
          >
            {batiment.est_archive ? <ArrowCounterClockwise className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {batiment.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {batiment.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          <Warning className="h-3.5 w-3.5 shrink-0" />
          Ce bâtiment est archivé.
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
            <InfoRow label="Désignation" editing={editing} value={batiment.designation}>
              <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} className="h-8 w-40 text-sm" />
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
                          <SelectTrigger className="h-7 w-[110px] text-[10px]"><SelectValue /></SelectTrigger>
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
                      <Badge variant="outline" className={`text-[10px] capitalize shrink-0 mt-0.5 ${a.type === 'principale' ? 'bg-primary/10 text-primary border-primary/20' : ''}`}>{a.type}</Badge>
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
      <div data-card className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised">
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lots ({lots?.length ?? 0})</h2>
          {!batiment.est_archive && (
            <Button size="sm" onClick={() => setShowCreateLot(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter un lot
            </Button>
          )}
        </div>

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
              <div key={lot.id} className="flex items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`, { state: { breadcrumbs: [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: batiment.designation, href: `/app/patrimoine/batiments/${batiment.id}` }, { label: lot.designation }] } })}>
                <div className="shrink-0 text-sm font-medium text-foreground truncate" style={{ width: lotCols.colWidths.designation }}>{lot.designation}</div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.type }}>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] capitalize">{lot.type_bien.replace('_', ' ')}</Badge>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground" style={{ width: lotCols.colWidths.etage }}>{lot.etage || '--'}</div>
                <div className="shrink-0 text-sm text-muted-foreground" style={{ width: lotCols.colWidths.nb_pieces }}>{lot.nb_pieces || '--'}</div>
                <div className="shrink-0 text-sm text-muted-foreground text-right" style={{ width: lotCols.colWidths.surface }}>{lot.surface ? `${lot.surface} m²` : '--'}</div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.meuble }}>
                  <Badge variant="outline" className={lot.meuble ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]' : 'bg-muted/50 text-muted-foreground border-border/60 text-[10px]'}>
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

      <CreateLotModal open={showCreateLot} onOpenChange={setShowCreateLot} preselectedBatimentId={id} onCreated={(lotId) => navigate(`/app/patrimoine/lots/${lotId}`)} />
      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
      <ConfirmDialog
        open={addrDeleteIdx !== null}
        onOpenChange={(open) => { if (!open) setAddrDeleteIdx(null) }}
        title="Supprimer cette adresse ?"
        description="L'adresse sera retirée lors de la prochaine sauvegarde."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={() => {
          if (addrDeleteIdx === null) return
          const addr = addrForms[addrDeleteIdx]
          if (!addr.isNew) setDeletedAddrIds(prev => [...prev, addr.id])
          setAddrForms(prev => prev.filter((_, i) => i !== addrDeleteIdx))
          setAddrDeleteIdx(null)
        }}
      />
      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={batiment.est_archive ? 'Restaurer ce bâtiment ?' : 'Archiver ce bâtiment ?'}
        description={batiment.est_archive
          ? 'Le bâtiment et ses lots redeviendront visibles dans les listes et les recherches.'
          : 'Le bâtiment et ses lots seront masqués des listes, recherches et pickers. Les missions existantes restent consultables.'}
        confirmLabel={batiment.est_archive ? 'Restaurer' : 'Archiver'}
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
