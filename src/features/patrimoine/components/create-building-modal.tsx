import { useState } from 'react'
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
}

export function CreateBuildingModal({ open, onOpenChange, onCreated, onMaisonCreated }: Props) {
  const [designation, setDesignation] = useState('')
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
    setDesignation(''); setType('immeuble'); setRue(''); setCodePostal(''); setVille('')
    setComplement(''); setNbEtages(''); setAnneeConstruction(''); setCommentaire('')
    setLatitude(undefined); setLongitude(undefined)
    setShowSecondary(false); setSecRue(''); setSecCodePostal(''); setSecVille('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!designation.trim()) { toast.error('Désignation requise'); return }
    if (nbEtages && (isNaN(parseInt(nbEtages)) || parseInt(nbEtages) < 0)) { toast.error('Nombre d\'étages invalide'); return }
    if (anneeConstruction && (isNaN(parseInt(anneeConstruction)) || parseInt(anneeConstruction) < 1800 || parseInt(anneeConstruction) > new Date().getFullYear() + 5)) { toast.error('Année de construction invalide'); return }
    try {
      const result = await createMutation.mutateAsync({
        designation,
        type,
        nb_etages: nbEtages ? parseInt(nbEtages) : undefined,
        annee_construction: anneeConstruction ? parseInt(anneeConstruction) : undefined,
        commentaire: commentaire || undefined,
        adresses: [
          { type: 'principale', rue, complement: complement || undefined, code_postal: codePostal, ville, latitude, longitude },
          ...(showSecondary && secRue ? [{ type: 'secondaire', rue: secRue, code_postal: secCodePostal, ville: secVille, latitude: secLat, longitude: secLng }] : []),
        ],
      })
      toast.success(`Bâtiment "${designation}" créé`)
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identification */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Désignation *</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Résidence Les Lilas" required className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
          </div>

          {/* Adresse principale */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground tracking-normal">Adresse principale</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Adresse *</Label>
              <AddressAutocomplete
                onChange={(addr) => {
                  if (addr) {
                    setRue(addr.rue); setCodePostal(addr.code_postal); setVille(addr.ville)
                    setLatitude(addr.latitude); setLongitude(addr.longitude)
                  }
                }}
                placeholder="Rechercher une adresse..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Complément</Label>
              <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Bât. A, Entrée 2, N° bâtiment..." className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Code postal</Label>
                <Input value={codePostal} readOnly tabIndex={-1} className="h-9 bg-muted/50 text-muted-foreground cursor-default" placeholder="Rempli automatiquement" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ville</Label>
                <Input value={ville} readOnly tabIndex={-1} className="h-9 bg-muted/50 text-muted-foreground cursor-default" placeholder="Rempli automatiquement" />
              </div>
            </div>
          </div>

          {/* Adresse secondaire */}
          {!showSecondary ? (
            <button type="button" onClick={() => setShowSecondary(true)} className="text-xs text-primary hover:text-primary/80 font-medium">
              + Ajouter une adresse secondaire
            </button>
          ) : (
            <div className="border-t border-border/60 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground tracking-normal">Adresse secondaire</p>
                <button type="button" onClick={() => { setShowSecondary(false); setSecRue('') }} className="text-xs text-muted-foreground hover:text-destructive">Retirer</button>
              </div>
              <AddressAutocomplete
                onChange={(addr) => {
                  if (addr) { setSecRue(addr.rue); setSecCodePostal(addr.code_postal); setSecVille(addr.ville); setSecLat(addr.latitude); setSecLng(addr.longitude) }
                }}
                placeholder="Rechercher adresse secondaire..."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input value={secCodePostal} readOnly tabIndex={-1} className="h-9 bg-muted/50 text-muted-foreground cursor-default" placeholder="Auto" />
                <Input value={secVille} readOnly tabIndex={-1} className="h-9 bg-muted/50 text-muted-foreground cursor-default" placeholder="Auto" />
              </div>
            </div>
          )}

          {/* Infos complémentaires */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground tracking-normal">Informations complémentaires</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Année de construction</Label>
              <Input type="number" value={anneeConstruction} onChange={(e) => setAnneeConstruction(e.target.value)} placeholder="1990" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Commentaire</Label>
              <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Notes..." rows={2} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
