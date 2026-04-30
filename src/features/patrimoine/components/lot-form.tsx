import { useState } from 'react'
import { Door, Compass, Lightning, ChatText } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
import { CollapsibleSection } from 'src/components/shared/collapsible-section'
import { useCreateLot } from '../api'
import { toast } from 'sonner'

interface Props {
  /** Bâtiment dans lequel le lot est rattaché — toujours requis ici. */
  batimentId: string
  preselectedTypeBien?: string
  onCreated?: (id: string) => void
  onCancel?: () => void
}

const TYPE_BIEN_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  local_commercial: 'Local commercial',
  parking: 'Parking',
  cave: 'Cave',
  autre: 'Autre',
}

/**
 * Formulaire de création de lot réutilisable — sans Dialog wrapper, sans
 * sélecteur de bâtiment (le bâtiment est imposé par le contexte).
 * Sections collapsibles uniformes (Identification · Localisation · Énergie ·
 * Commentaire). Utilisé inline par MissionLotPicker.
 */
export function LotForm({ batimentId, preselectedTypeBien, onCreated, onCancel }: Props) {
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

  const createMutation = useCreateLot()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!batimentId) { toast.error('Bâtiment manquant'); return }
    try {
      const result = await createMutation.mutateAsync({
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
      onCreated?.(result.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    }
  }

  const localisationHint = [
    etage && `étage ${etage}`,
    surface && `${surface} m²`,
    nbPieces,
    meuble && 'meublé',
  ].filter(Boolean).join(' · ') || undefined

  const energieHint = [
    dpeClasse && `DPE ${dpeClasse}`,
    gesClasse && `GES ${gesClasse}`,
    chauffageType && `chauffage ${chauffageType}`,
  ].filter(Boolean).join(' · ') || undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* ── 1. Identification ── */}
      <CollapsibleSection
        icon={<Door className="h-4 w-4" />}
        title="Identification"
        required
        hint={[designation, TYPE_BIEN_LABELS[typeBien] ?? typeBien].filter(Boolean).join(' · ') || undefined}
        defaultOpen
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Désignation</Label>
            <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Apt 201, Lot B…" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Type de bien *</Label>
            <Select value={typeBien} onValueChange={(v) => { setTypeBien(v); if (v !== 'autre') setTypeBienPrecision('') }}>
              <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_BIEN_LABELS).map(([v, l]) =>
                  <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          {typeBien === 'autre' && (
            <div className="col-span-2 space-y-1.5">
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
            <Input value={referenceInterne} onChange={(e) => setReferenceInterne(e.target.value)} placeholder="Bail, réf cadastrale…" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Pièces</Label>
            <Select value={nbPieces} onValueChange={setNbPieces}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {['studio','T1','T2','T3','T4','T5','T6'].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 2. Localisation ── */}
      <CollapsibleSection
        icon={<Compass className="h-4 w-4" />}
        title="Localisation"
        hint={localisationHint}
        defaultOpen
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Étage</Label>
            <Input value={etage} onChange={(e) => setEtage(e.target.value)} placeholder="2, RDC, SS-1…" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Emplacement palier</Label>
            <Input value={emplacementPalier} onChange={(e) => setEmplacementPalier(e.target.value)} placeholder="Porte gauche…" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Surface (m²)</Label>
            <Input type="number" step="0.01" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="65" className="h-9" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Switch checked={meuble} onCheckedChange={setMeuble} />
          <Label className="text-xs">Meublé</Label>
        </div>
      </CollapsibleSection>

      {/* ── 3. Énergie ── */}
      <CollapsibleSection
        icon={<Lightning className="h-4 w-4" />}
        title="Énergie"
        hint={energieHint ?? 'optionnel'}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">DPE</Label>
            <Select value={dpeClasse} onValueChange={setDpeClasse}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">GES</Label>
            <Select value={gesClasse} onValueChange={setGesClasse}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Eau chaude — type</Label>
            <Select value={eauChaudeType} onValueChange={setEauChaudeType}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {[{v:'electrique',l:'Électrique'},{v:'gaz',l:'Gaz'},{v:'fioul',l:'Fioul'},{v:'pompe_a_chaleur',l:'Pompe à chaleur'},{v:'autre',l:'Autre'}].map(o =>
                  <SelectItem key={o.v} value={o.v} className="text-xs">{o.l}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Eau chaude — mode</Label>
            <Select value={eauChaudeMode} onValueChange={setEauChaudeMode}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="individuel" className="text-xs">Individuel</SelectItem>
                <SelectItem value="collectif" className="text-xs">Collectif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Chauffage — type</Label>
            <Select value={chauffageType} onValueChange={setChauffageType}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {[{v:'electrique',l:'Électrique'},{v:'gaz',l:'Gaz'},{v:'fioul',l:'Fioul'},{v:'pompe_a_chaleur',l:'Pompe à chaleur'},{v:'autre',l:'Autre'}].map(o =>
                  <SelectItem key={o.v} value={o.v} className="text-xs">{o.l}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Chauffage — mode</Label>
            <Select value={chauffageMode} onValueChange={setChauffageMode}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="individuel" className="text-xs">Individuel</SelectItem>
                <SelectItem value="collectif" className="text-xs">Collectif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 4. Commentaire ── */}
      <CollapsibleSection
        icon={<ChatText className="h-4 w-4" />}
        title="Commentaire"
        hint={commentaire ? `${commentaire.slice(0, 60)}${commentaire.length > 60 ? '…' : ''}` : 'optionnel'}
      >
        <Textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Notes complémentaires…"
          rows={3}
        />
      </CollapsibleSection>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Création…' : 'Créer le lot'}
        </Button>
      </div>
    </form>
  )
}
