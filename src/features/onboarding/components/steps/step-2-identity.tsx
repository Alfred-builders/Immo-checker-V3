import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { api } from '../../../../lib/api-client'
import { useAuth } from '../../../../hooks/use-auth'

export function Step2Identity({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { workspace, refreshWorkspace } = useAuth()
  const [siret, setSiret] = useState('')
  const [adresse, setAdresse] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!workspace) return
    setSiret((workspace as any).siret ?? '')
    setAdresse((workspace as any).adresse ?? '')
    setCodePostal((workspace as any).code_postal ?? '')
    setVille((workspace as any).ville ?? '')
    setEmail((workspace as any).email ?? '')
    setTelephone((workspace as any).telephone ?? '')
  }, [workspace])

  async function handleSave() {
    if (siret && !/^\d{14}$/.test(siret.trim())) {
      toast.error('SIRET doit contenir 14 chiffres')
      return
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Email invalide')
      return
    }
    setSaving(true)
    try {
      await api('/workspaces/current', {
        method: 'PATCH',
        body: JSON.stringify({
          siret: siret || null,
          adresse: adresse || null,
          code_postal: codePostal || null,
          ville: ville || null,
          email: email || null,
          telephone: telephone || null,
        }),
      })
      await refreshWorkspace()
      onNext()
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Identité légale</h2>
        <p className="text-sm text-muted-foreground">
          Ces informations apparaîtront sur vos documents EDL signés. Vous pourrez les modifier plus tard.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>SIRET</Label>
          <Input value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="12345678901234" />
        </div>

        <div className="space-y-1.5">
          <Label>Adresse</Label>
          <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="12 rue de la Paix" />
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-3">
          <div className="space-y-1.5">
            <Label>Code postal</Label>
            <Input value={codePostal} onChange={(e) => setCodePostal(e.target.value)} placeholder="75001" />
          </div>
          <div className="space-y-1.5">
            <Label>Ville</Label>
            <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Paris" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Email de contact</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@..." />
          </div>
          <div className="space-y-1.5">
            <Label>Téléphone</Label>
            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="01 23 45 67 89" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button variant="ghost" onClick={onSkip} disabled={saving}>
          Passer cette étape
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Continuer'}
        </Button>
      </div>
    </div>
  )
}
