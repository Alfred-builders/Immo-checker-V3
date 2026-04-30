import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { useCreateTiers } from '../api'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (id: string) => void
  defaultTypePersonne?: 'physique' | 'morale'
}

// Retours FC avril 2026 :
// - Date de naissance retirée (PP)
// - Procuration retirée (gérée au niveau EDL/signature, pas tiers)
// - Adresse conservée uniquement pour PM (le siège social) — pour PP elle viendra du lot ou de l'EDL de sortie
// - Représentant PM : prénom + nom (concaténés en representant_nom)
export function CreateTiersModal({ open, onOpenChange, onCreated, defaultTypePersonne = 'physique' }: Props) {
  const [typePersonne, setTypePersonne] = useState<'physique' | 'morale'>(defaultTypePersonne)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [raisonSociale, setRaisonSociale] = useState('')
  const [siren, setSiren] = useState('')
  const [representantPrenom, setRepresentantPrenom] = useState('')
  const [representantNom, setRepresentantNom] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [adresse, setAdresse] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [notes, setNotes] = useState('')
  const createMutation = useCreateTiers()

  function reset() {
    setTypePersonne(defaultTypePersonne)
    setNom(''); setPrenom(''); setRaisonSociale(''); setSiren('')
    setRepresentantPrenom(''); setRepresentantNom('')
    setEmail(''); setTel(''); setAdresse(''); setCodePostal(''); setVille(''); setNotes('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validation
    const trimmedNom = nom.trim()
    const trimmedPrenom = prenom.trim()
    const trimmedRS = raisonSociale.trim()
    if (typePersonne === 'physique' && (!trimmedNom || !trimmedPrenom)) { toast.error('Nom et prénom sont requis'); return }
    if (typePersonne === 'morale' && !trimmedRS) { toast.error('Raison sociale est requise'); return }
    if (siren && !/^\d{9}$/.test(siren.trim())) { toast.error('SIREN doit contenir exactement 9 chiffres'); return }

    // Nom complet du représentant (PM uniquement)
    const representantFullName = typePersonne === 'morale'
      ? [representantPrenom.trim(), representantNom.trim()].filter(Boolean).join(' ').trim() || undefined
      : undefined

    // Adresse uniquement pour PM (retours FC : PP n'a pas d'adresse renseignée à la création)
    const includeAdresse = typePersonne === 'morale'

    try {
      const result = await createMutation.mutateAsync({
        type_personne: typePersonne,
        nom: typePersonne === 'morale' ? (trimmedRS || trimmedNom) : trimmedNom,
        prenom: typePersonne === 'physique' ? trimmedPrenom || undefined : undefined,
        raison_sociale: typePersonne === 'morale' ? trimmedRS || undefined : undefined,
        siren: typePersonne === 'morale' && siren ? siren.trim() : undefined,
        representant_nom: representantFullName,
        email: email || undefined,
        tel: tel || undefined,
        adresse: includeAdresse ? (adresse || undefined) : undefined,
        code_postal: includeAdresse ? (codePostal || undefined) : undefined,
        ville: includeAdresse ? (ville || undefined) : undefined,
        notes: notes || undefined,
      })
      if (result.warning) toast.warning(result.warning)
      const displayName = typePersonne === 'morale' ? raisonSociale : `${prenom} ${nom}`
      toast.success(`Tiers "${displayName}" créé`)
      reset()
      onOpenChange(false)
      onCreated?.(result.id)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau tiers</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl border border-border/60">
            <span className="text-xs text-muted-foreground">Type :</span>
            <div className="flex items-center gap-0.5 bg-card rounded-md border border-border/60 p-0.5">
              <button type="button" onClick={() => setTypePersonne('physique')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${typePersonne === 'physique' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Personne physique
              </button>
              <button type="button" onClick={() => setTypePersonne('morale')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${typePersonne === 'morale' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Personne morale
              </button>
            </div>
          </div>

          {/* Identity fields */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground tracking-normal">Identité</p>
            <div className="grid grid-cols-2 gap-3">
              {typePersonne === 'physique' ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nom *</Label>
                    <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Dupont" required className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prénom *</Label>
                    <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Jean" required className="h-9" />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs">Raison sociale *</Label>
                    <Input value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} placeholder="SCI Les Hêtres" required className="h-9" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs">SIREN</Label>
                    <Input value={siren} onChange={(e) => setSiren(e.target.value)} placeholder="123456789" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prénom du représentant</Label>
                    <Input value={representantPrenom} onChange={(e) => setRepresentantPrenom(e.target.value)} placeholder="Clément" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nom du représentant</Label>
                    <Input value={representantNom} onChange={(e) => setRepresentantNom(e.target.value)} placeholder="Rousseau" className="h-9" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground tracking-normal">Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Téléphone</Label>
                <Input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="06 12 34 56 78" className="h-9" />
              </div>
            </div>
          </div>

          {/* Address — PM uniquement (siège social). PP : pas d'adresse à la création (retours FC) */}
          {typePersonne === 'morale' && (
            <div className="border-t border-border/60 pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground tracking-normal">Adresse du siège</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Adresse</Label>
                <AddressAutocomplete
                  onChange={(addr) => {
                    if (addr) {
                      setAdresse(addr.rue)
                      setCodePostal(addr.code_postal)
                      setVille(addr.ville)
                    }
                  }}
                  placeholder="Rechercher une adresse..."
                />
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
          )}

          {/* Notes */}
          <div className="border-t border-border/60 pt-4 space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes, commentaires..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
