import { useState } from 'react'
import {
  MapPin, MapPinPlus, CheckCircle, ArrowsClockwise, Buildings, Ruler, ChatText,
} from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { CollapsibleSection } from 'src/components/shared/collapsible-section'
import { useCreateBatiment } from '../api'
import { toast } from 'sonner'

interface Props {
  onCreated?: (id: string) => void
  onMaisonCreated?: (batimentId: string) => void
  onCancel?: () => void
  /** Pré-remplit l'adresse principale (utile quand l'utilisateur a déjà tapé
   * une recherche dans le picker mission). */
  initialAddress?: { rue: string; code_postal: string; ville: string; latitude?: number; longitude?: number }
}

/**
 * Formulaire de création de bâtiment réutilisable — sans Dialog wrapper.
 * Sections collapsibles uniformes (Adresse · Identification · Caractéristiques
 * · Adresse secondaire · Commentaire). Utilisé par CreateBuildingModal en
 * standalone et par MissionLotPicker inline.
 */
export function BuildingForm({ onCreated, onMaisonCreated, onCancel, initialAddress }: Props) {
  const [designation, setDesignation] = useState('')
  const [numBatiment, setNumBatiment] = useState('')
  const [type, setType] = useState<string>('immeuble')
  const [rue, setRue] = useState(initialAddress?.rue ?? '')
  const [codePostal, setCodePostal] = useState(initialAddress?.code_postal ?? '')
  const [ville, setVille] = useState(initialAddress?.ville ?? '')
  const [complement, setComplement] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>(initialAddress?.latitude)
  const [longitude, setLongitude] = useState<number | undefined>(initialAddress?.longitude)
  const [nbEtages, setNbEtages] = useState('')
  const [anneeConstruction, setAnneeConstruction] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [secRue, setSecRue] = useState('')
  const [secCodePostal, setSecCodePostal] = useState('')
  const [secVille, setSecVille] = useState('')
  const [secLat, setSecLat] = useState<number | undefined>()
  const [secLng, setSecLng] = useState<number | undefined>()

  const createMutation = useCreateBatiment()

  function clearAddress() {
    setRue(''); setCodePostal(''); setVille('')
    setLatitude(undefined); setLongitude(undefined)
  }

  function clearSecondary() {
    setSecRue(''); setSecCodePostal(''); setSecVille('')
    setSecLat(undefined); setSecLng(undefined)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rue.trim() || !codePostal.trim() || !ville.trim()) { toast.error('Adresse principale requise'); return }
    if (nbEtages && (isNaN(parseInt(nbEtages)) || parseInt(nbEtages) < 0)) { toast.error('Nombre d\'étages invalide'); return }
    if (anneeConstruction && (isNaN(parseInt(anneeConstruction)) || parseInt(anneeConstruction) < 1800 || parseInt(anneeConstruction) > new Date().getFullYear() + 5)) { toast.error('Année invalide'); return }
    try {
      const result = await createMutation.mutateAsync({
        designation: designation.trim() || undefined,
        num_batiment: numBatiment.trim() || undefined,
        type,
        nb_etages: nbEtages ? parseInt(nbEtages) : undefined,
        annee_construction: anneeConstruction ? parseInt(anneeConstruction) : undefined,
        commentaire: commentaire || undefined,
        adresses: [
          { type: 'principale', rue, complement: complement || undefined, code_postal: codePostal, ville, latitude, longitude },
          ...(secRue ? [{ type: 'secondaire', rue: secRue, code_postal: secCodePostal, ville: secVille, latitude: secLat, longitude: secLng }] : []),
        ],
      })
      toast.success('Bâtiment créé')
      if (type === 'maison' && onMaisonCreated) {
        onMaisonCreated(result.id)
      } else {
        onCreated?.(result.id)
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création')
    }
  }

  const addressPicked = !!(rue && codePostal && ville)
  const secondaryPicked = !!(secRue && secCodePostal && secVille)

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* ── 1. Adresse principale ── */}
      <CollapsibleSection
        icon={<MapPin className="h-4 w-4" />}
        title="Adresse principale"
        required
        hint={addressPicked ? `${rue} · ${codePostal} ${ville}` : undefined}
        defaultOpen={!addressPicked}
      >
        {!addressPicked ? (
          <AddressAutocomplete
            placeholder="Tape une adresse, elle est complétée automatiquement…"
            onChange={(addr) => {
              if (addr) {
                setRue(addr.rue); setCodePostal(addr.code_postal); setVille(addr.ville)
                setLatitude(addr.latitude); setLongitude(addr.longitude)
              }
            }}
          />
        ) : (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" weight="fill" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{rue}</p>
              <p className="text-[11px] text-muted-foreground truncate">{codePostal} {ville}</p>
            </div>
            <button
              type="button"
              onClick={clearAddress}
              className="shrink-0 inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ArrowsClockwise className="h-3 w-3" /> Changer
            </button>
          </div>
        )}
      </CollapsibleSection>

      {/* ── 2. Identification ── */}
      <CollapsibleSection
        icon={<Buildings className="h-4 w-4" />}
        title="Identification"
        required
        hint={[numBatiment && `Bât. ${numBatiment}`, designation].filter(Boolean).join(' · ') || undefined}
        defaultOpen
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Numéro</Label>
            <Input value={numBatiment} onChange={(e) => setNumBatiment(e.target.value)} placeholder="A, B, 1…" maxLength={50} className="h-9" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immeuble">Immeuble</SelectItem>
                <SelectItem value="maison">Maison</SelectItem>
                <SelectItem value="local_commercial">Local commercial</SelectItem>
                <SelectItem value="mixte">Mixte</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-3 space-y-1.5">
            <Label className="text-xs">Désignation</Label>
            <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Les Lilas, Résidence du Parc…" className="h-9" />
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 3. Caractéristiques ── */}
      <CollapsibleSection
        icon={<Ruler className="h-4 w-4" />}
        title="Caractéristiques"
        hint={[
          nbEtages && `${nbEtages} étage${parseInt(nbEtages) > 1 ? 's' : ''}`,
          anneeConstruction,
          complement,
        ].filter(Boolean).join(' · ') || undefined}
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Étages</Label>
            <Input type="number" value={nbEtages} onChange={(e) => setNbEtages(e.target.value)} placeholder="5" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Année</Label>
            <Input type="number" value={anneeConstruction} onChange={(e) => setAnneeConstruction(e.target.value)} placeholder="1990" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Complément d'adresse</Label>
            <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Entrée 2…" className="h-9" />
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 4. Adresse secondaire ── */}
      <CollapsibleSection
        icon={<MapPinPlus className="h-4 w-4" />}
        title="Adresse secondaire"
        hint={secondaryPicked ? `${secRue} · ${secCodePostal} ${secVille}` : 'optionnelle'}
      >
        {!secondaryPicked ? (
          <AddressAutocomplete
            placeholder="Rechercher une adresse secondaire…"
            onChange={(addr) => {
              if (addr) {
                setSecRue(addr.rue); setSecCodePostal(addr.code_postal); setSecVille(addr.ville)
                setSecLat(addr.latitude); setSecLng(addr.longitude)
              }
            }}
          />
        ) : (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" weight="fill" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{secRue}</p>
              <p className="text-[11px] text-muted-foreground truncate">{secCodePostal} {secVille}</p>
            </div>
            <button
              type="button"
              onClick={clearSecondary}
              className="shrink-0 inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ArrowsClockwise className="h-3 w-3" /> Changer
            </button>
          </div>
        )}
      </CollapsibleSection>

      {/* ── 5. Commentaire ── */}
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
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" size="sm" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Création…' : 'Créer le bâtiment'}
        </Button>
      </div>
    </form>
  )
}
