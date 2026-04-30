import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
import { BatimentByAddressPicker } from 'src/components/shared/batiment-by-address-picker'
import { useCreateLot } from '../api'
import { toast } from 'sonner'
import { CaretDown, CaretRight } from '@phosphor-icons/react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedBatimentId?: string
  preselectedTypeBien?: string
  onCreated?: (id: string) => void
}

export function CreateLotModal({ open, onOpenChange, preselectedBatimentId, preselectedTypeBien, onCreated }: Props) {
  // Lot fields
  const [batimentId, setBatimentId] = useState<string | null>(preselectedBatimentId ?? null)
  const [designation, setDesignation] = useState('')
  const [typeBien, setTypeBien] = useState(preselectedTypeBien || 'appartement')
  const [typeBienPrecision, setTypeBienPrecision] = useState('')
  const [referenceInterne, setReferenceInterne] = useState('')
  const [etage, setEtage] = useState('')
  const [emplacementPalier, setEmplacementPalier] = useState('')
  const [surface, setSurface] = useState('')
  const [meuble, setMeuble] = useState(false)
  const [nbPieces, setNbPieces] = useState('')
  const [dpeClasse, setDpeClasse] = useState('')
  const [gesClasse, setGesClasse] = useState('')
  const [eauChaudeType, setEauChaudeType] = useState('')
  const [eauChaudeMode, setEauChaudeMode] = useState('')
  const [chauffageType, setChauffageType] = useState('')
  const [chauffageMode, setChauffageMode] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [energieOpen, setEnergieOpen] = useState(false)

  const createLotMutation = useCreateLot()

  useEffect(() => {
    if (preselectedBatimentId) setBatimentId(preselectedBatimentId)
  }, [preselectedBatimentId])

  useEffect(() => {
    if (preselectedTypeBien) setTypeBien(preselectedTypeBien)
  }, [preselectedTypeBien])

  function resetLot() {
    if (!preselectedBatimentId) setBatimentId(null)
    setDesignation(''); setReferenceInterne(''); setTypeBien(preselectedTypeBien || 'appartement')
    setTypeBienPrecision('')
    setEtage(''); setEmplacementPalier(''); setSurface(''); setMeuble(false); setNbPieces('')
    setDpeClasse(''); setGesClasse(''); setEauChaudeType(''); setEauChaudeMode('')
    setChauffageType(''); setChauffageMode(''); setCommentaire('')
  }

  async function handleCreateLot(e: React.FormEvent) {
    e.preventDefault()
    if (!batimentId) { toast.error('Sélectionnez ou créez un bâtiment'); return }
    try {
      const result = await createLotMutation.mutateAsync({
        batiment_id: batimentId,
        designation: designation.trim() || undefined,
        reference_interne: referenceInterne || undefined,
        type_bien: typeBien,
        type_bien_precision: typeBien === 'autre' ? (typeBienPrecision.trim() || undefined) : undefined,
        etage: etage || undefined,
        emplacement_palier: emplacementPalier || undefined,
        surface: surface ? parseFloat(surface) : undefined,
        meuble,
        nb_pieces: nbPieces || undefined,
        dpe_classe: dpeClasse || undefined,
        ges_classe: gesClasse || undefined,
        eau_chaude_type: eauChaudeType || undefined,
        eau_chaude_mode: eauChaudeMode || undefined,
        chauffage_type: chauffageType || undefined,
        chauffage_mode: chauffageMode || undefined,
        commentaire: commentaire || undefined,
      })
      toast.success('Lot créé')
      resetLot()
      onOpenChange(false)
      onCreated?.(result.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetLot(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau lot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateLot} className="space-y-4">
          {/* Bâtiment — search by name or address; create on demand */}
          {!preselectedBatimentId && (
            <BatimentByAddressPicker
              value={batimentId}
              onChange={setBatimentId}
            />
          )}

          {/* Identification */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-xs font-medium text-muted-foreground tracking-normal">Identification du lot</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Désignation</Label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Apt 201, Lot B…" className="h-9" />
                <p className="text-[11px] text-muted-foreground">Optionnel.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type de bien *</Label>
                <Select value={typeBien} onValueChange={(v) => { setTypeBien(v); if (v !== 'autre') setTypeBienPrecision('') }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['appartement','maison','studio','local_commercial','parking','cave','autre'].map(t =>
                      <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace('_',' ')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {typeBien === 'autre' && (
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Préciser le type *</Label>
                  <Input
                    value={typeBienPrecision}
                    onChange={(e) => setTypeBienPrecision(e.target.value)}
                    placeholder="Ex : Entrepôt, Loft, Box moto…"
                    maxLength={100}
                    required
                    className="h-9"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Réf. interne</Label>
                <Input value={referenceInterne} onChange={(e) => setReferenceInterne(e.target.value)} placeholder="Bail, réf cadastrale..." className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pièces</Label>
                <Select value={nbPieces} onValueChange={setNbPieces}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {['studio','T1','T2','T3','T4','T5','T6'].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Localisation dans le bâtiment */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground tracking-normal">Localisation</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Étage</Label>
                <Input value={etage} onChange={(e) => setEtage(e.target.value)} placeholder="2, RDC, SS-1..." className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Emplacement palier</Label>
                <Input value={emplacementPalier} onChange={(e) => setEmplacementPalier(e.target.value)} placeholder="Porte gauche..." className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Surface (m²)</Label>
                <Input type="number" step="0.01" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="65" className="h-9" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={meuble} onCheckedChange={setMeuble} />
              <Label className="text-xs">Meublé</Label>
            </div>
          </div>

          {/* Énergie — collapsible, contains DPE + GES + chauffage */}
          <div className="border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={() => setEnergieOpen(!energieOpen)}
              className="w-full flex items-center justify-between py-1"
            >
              <p className="text-xs font-medium text-muted-foreground tracking-normal">Énergie</p>
              {energieOpen ? <CaretDown className="h-3.5 w-3.5 text-muted-foreground" /> : <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            {energieOpen && (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">DPE</Label>
                  <Select value={dpeClasse} onValueChange={setDpeClasse}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GES</Label>
                  <Select value={gesClasse} onValueChange={setGesClasse}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Eau chaude type</Label>
                  <Select value={eauChaudeType} onValueChange={setEauChaudeType}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {[{v:'electrique',l:'Électrique'},{v:'gaz',l:'Gaz'},{v:'fioul',l:'Fioul'},{v:'pompe_a_chaleur',l:'Pompe à chaleur'},{v:'autre',l:'Autre'}].map(o =>
                        <SelectItem key={o.v} value={o.v} className="text-xs">{o.l}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Eau chaude mode</Label>
                  <Select value={eauChaudeMode} onValueChange={setEauChaudeMode}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individuel" className="text-xs">Individuel</SelectItem>
                      <SelectItem value="collectif" className="text-xs">Collectif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Chauffage type</Label>
                  <Select value={chauffageType} onValueChange={setChauffageType}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {[{v:'electrique',l:'Électrique'},{v:'gaz',l:'Gaz'},{v:'fioul',l:'Fioul'},{v:'pompe_a_chaleur',l:'Pompe à chaleur'},{v:'autre',l:'Autre'}].map(o =>
                        <SelectItem key={o.v} value={o.v} className="text-xs">{o.l}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Chauffage mode</Label>
                  <Select value={chauffageMode} onValueChange={setChauffageMode}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individuel" className="text-xs">Individuel</SelectItem>
                      <SelectItem value="collectif" className="text-xs">Collectif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div className="border-t border-border/60 pt-4 space-y-1.5">
            <Label className="text-xs">Commentaire</Label>
            <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Notes..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" size="sm" disabled={createLotMutation.isPending || !batimentId}>
              {createLotMutation.isPending ? 'Création...' : 'Créer le lot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
