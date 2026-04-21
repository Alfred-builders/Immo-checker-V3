import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { PasswordStrengthMeter, scorePassword } from 'src/components/password-strength-meter'
import { api } from '../../../lib/api-client'

export function ResetPasswordPage() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (scorePassword(password) < 3) { setError('Mot de passe trop faible (8 caractères, 1 majuscule, 1 chiffre)'); return }

    setLoading(true)
    try {
      await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Lien invalide ou expiré')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Mot de passe réinitialisé</h2>
        <p className="text-sm text-muted-foreground mb-6">Vous pouvez maintenant vous connecter.</p>
        <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium">Se connecter</Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Nouveau mot de passe</h2>
      <p className="text-sm text-muted-foreground mb-6">Min 8 caractères, 1 majuscule, 1 chiffre.</p>
      {error && <div role="alert" className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Nouveau mot de passe</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10 rounded-xl" />
          <PasswordStrengthMeter value={password} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Confirmer</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="h-10 rounded-xl" />
        </div>
        <Button type="submit" className="w-full h-10 rounded-xl font-semibold" disabled={loading}>
          {loading ? 'Réinitialisation...' : 'Réinitialiser'}
        </Button>
      </form>
    </div>
  )
}
