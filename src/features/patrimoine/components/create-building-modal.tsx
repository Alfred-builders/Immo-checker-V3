import { useState } from 'react'
import { Plus, Trash } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { useCreateBatiment } from '../api'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (id: string) => void
  onMaisonCreated?: (batimentId: string) => void
  /** Texte tapé dans la recherche d'origine — pré-remplit l'autocomplete
   * d'adresse pour éviter à l'utilisateur de retaper. */
  initialQuery?: string
}

export function CreateBuildingModal({ open, onOpenChange, onCreated, onMaisonCreated, initialQuery }: Props) {
  const [designation, setDesignation] = useState('')
  const [numBatiment, setNumBatiment] = useState('')
  const [type, setType] = useState<string>('immeuble')
  const [rue, setRue] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [complement, setComplement] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [nbEtages, setNbEtages] = useState('')
  const [anneeConstruction, setAnneeConstruction] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [showSecondary, setShowSecondary] = useState(false)
  const [secRue, setSecRue] = useState('')
  const [secCodePostal, setSecCodePostal] = useState('')
  const [secVille, setSecVille] = useState('')
  const [secLat, setSecLat] = useState<number | undefined>()
  const [secLng, setSecLng] = useState<number | undefined>()

  const createMutation = useCreateBatiment()

  function reset() {
    setDesignation(''); setNumBatiment(''); setType('immeuble'); setRue(''); setCodePostal(''); setVille('')
    setComplement(''); setNbEtages(''); setAnneeConstruction(''); setCommentaire('')
    setLatitude(undefined); setLongitude(undefined)
    setShowSecondary(false); setSecRue(''); setSecCodePostal(''); setSecVille('')
    setSecLat(undefined); setSecLng(undefined)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rue.trim() || !codePostal.trim() || !ville.trim()) { toast.error('Adresse requise'); return }
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
          ...(showSecondary && secRue ? [{ type: 'secondaire', rue: secRue, code_postal: secCodePostal, ville: secVille, latitude: secLat, longitude: secLng }] : []),
        ],
      })
      toast.success('Bâtiment créé')
      reset()
      onOpenChange(false)
      if (type === 'maison' && onMaisonCreated) {
        onMaisonCreated(result.id)
      } else {
        onCreated?.(result.id)
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau bâtiment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3.5">

          {/* 1. Adresse — en premier, c'est le pivot */}
          <div className="space-y-1.5">
            <Label className="text-xs">Adresse *</Label>
            <AddressAutocomplete
              value={initialQuery}
              placeholder="12 rue des Lilas, 75019 Paris…"
              onChange={(addr) => {
                if (addr) {
                  setRue(addr.rue); setCodePostal(addr.code_postal); setVille(addr.ville)
                  setLatitude(addr.latitude); setLongitude(addr.longitude)
                }
              }}
            />
          </div>

          {/* 2. Identification compacte sur 3 colonnes */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Numéro</Label>
              <Input value={numBatiment} onChange={(e) => setNumBatiment(e.target.value)} placeholder="A, B, 1…" maxLength={50} className="h-9" />
            </div>
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label className="text-xs">Nb étages</Label>
              <Input type="number" value={nbEtages} onChange={(e) => setNbEtages(e.target.value)} placeholder="5" className="h-9" />
            </div>
          </div>

          {/* 3. Désignation + Année sur 2 colonnes */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Désignation</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Les Lilas, Résidence du Parc…" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Année</Label>
              <Input type="number" value={anneeConstruction} onChange={(e) => setAnneeConstruction(e.target.value)} placeholder="1990" className="h-9" />
            </div>
          </div>

          {/* 4. Complément + adresse secondaire (toggle) */}
          <div className="space-y-1.5">
            <Label className="text-xs">Complément d'adresse</Label>
            <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Entrée 2, escalier C…" className="h-9" />
          </div>

          {!showSecondary ? (
            <button
              type="button"
              onClick={() => setShowSecondary(true)}
              className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:text-primary/80 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" weight="bold" /> Ajouter une adresse secondaire
            </button>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Adresse secondaire</Label>
                <button
                  type="button"
                  onClick={() => { setShowSecondary(false); setSecRue('') }}
                  className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                >
                  <Trash className="h-3 w-3" /> Retirer
                </button>
              </div>
              <AddressAutocomplete
                placeholder="Rechercher une adresse secondaire…"
                onChange={(addr) => {
                  if (addr) { setSecRue(addr.rue); setSecCodePostal(addr.code_postal); setSecVille(addr.ville); setSecLat(addr.latitude); setSecLng(addr.longitude) }
                }}
              />
            </div>
          )}

          {/* 5. Commentaire */}
          <div className="space-y-1.5">
            <Label className="text-xs">Commentaire</Label>
            <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Notes…" rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Création…' : 'Créer le bâtiment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
