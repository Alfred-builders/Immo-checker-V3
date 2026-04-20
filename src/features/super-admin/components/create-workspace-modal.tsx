import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { toast } from 'sonner'
import { useCreateWorkspace } from '../api'
import type { WorkspaceType } from '../types'

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated?: (workspaceId: string) => void
}) {
  const [nom, setNom] = useState('')
  const [type, setType] = useState<WorkspaceType>('societe_edl')
  const [statut, setStatut] = useState<'actif' | 'trial'>('actif')
  const [adminEmail, setAdminEmail] = useState('')
  const [siret, setSiret] = useState('')

  const mutation = useCreateWorkspace()

  function reset() {
    setNom('')
    setType('societe_edl')
    setStatut('actif')
    setAdminEmail('')
    setSiret('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim() || !adminEmail.trim()) {
      toast.error('Nom du workspace et email admin requis')
      return
    }
    try {
      const result = await mutation.mutateAsync({
        nom: nom.trim(),
        type_workspace: type,
        statut,
        admin_email: adminEmail.trim(),
        siret: siret.trim() || undefined,
      })
      toast.success(`Workspace "${result.workspace.nom}" créé — invitation envoyée à ${result.invitation.email}`)
      reset()
      onOpenChange(false)
      onCreated?.(result.workspace.id)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Nom du workspace *</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Agence Dupont" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkspaceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="societe_edl">Société EDL</SelectItem>
                  <SelectItem value="bailleur">Bailleur</SelectItem>
                  <SelectItem value="agence">Agence immobilière</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Statut initial</Label>
              <Select value={statut} onValueChange={(v) => setStatut(v as 'actif' | 'trial')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email de l'admin initial *</Label>
            <Input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@agence-dupont.fr"
            />
            <p className="text-[11px] text-muted-foreground">
              Une invitation sera envoyée à cette adresse. Le premier admin pourra configurer le workspace à la connexion.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>SIRET (optionnel)</Label>
            <Input value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="12345678901234" />
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Création...' : 'Créer & envoyer l\'invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
