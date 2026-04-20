import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, X } from '@phosphor-icons/react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { api } from '../../../../lib/api-client'

interface Row {
  id: string
  email: string
  role: 'admin' | 'gestionnaire' | 'technicien'
}

function uid() { return Math.random().toString(36).slice(2) }

export function Step3Team({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [rows, setRows] = useState<Row[]>([
    { id: uid(), email: '', role: 'gestionnaire' },
  ])
  const [saving, setSaving] = useState(false)

  function addRow() {
    setRows((r) => [...r, { id: uid(), email: '', role: 'gestionnaire' }])
  }

  function removeRow(id: string) {
    setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r))
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  async function handleSubmit() {
    const valid = rows.filter((r) => r.email.trim())
    if (valid.length === 0) {
      onSkip()
      return
    }
    for (const r of valid) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())) {
        toast.error(`Email invalide : ${r.email}`)
        return
      }
    }
    setSaving(true)
    let sent = 0
    for (const r of valid) {
      try {
        await api('/invitations', {
          method: 'POST',
          body: JSON.stringify({ email: r.email.trim(), role: r.role }),
        })
        sent++
      } catch (e: any) {
        toast.error(`${r.email} : ${e.message || 'erreur'}`)
      }
    }
    setSaving(false)
    if (sent > 0) {
      toast.success(`${sent} invitation${sent > 1 ? 's' : ''} envoyée${sent > 1 ? 's' : ''}`)
      onNext()
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Inviter votre équipe</h2>
        <p className="text-sm text-muted-foreground">
          Invitez vos collègues maintenant — chacun recevra un email pour créer son compte.
          <br />
          <span className="text-xs text-muted-foreground/70">Rôles : admin (tout), gestionnaire (back-office), technicien (app tablette).</span>
        </p>
      </div>

      <div className="space-y-2.5">
        <Label className="text-xs font-medium text-muted-foreground">Collaborateurs à inviter</Label>
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <Input
              type="email"
              value={r.email}
              onChange={(e) => updateRow(r.id, { email: e.target.value })}
              placeholder="email@exemple.fr"
              className="flex-1"
            />
            <Select value={r.role} onValueChange={(v) => updateRow(r.id, { role: v as Row['role'] })}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                <SelectItem value="technicien">Technicien</SelectItem>
              </SelectContent>
            </Select>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                className="h-9 w-9 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium mt-2"
        >
          <Plus size={12} weight="bold" /> Ajouter une ligne
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button variant="ghost" onClick={onSkip} disabled={saving}>
          Passer cette étape
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Envoi...' : 'Envoyer les invitations'}
        </Button>
      </div>
    </div>
  )
}
