import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { api } from '../../../lib/api-client'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      setSent(true)
    } catch {
      // Still show success (don't reveal if email exists) but log for debugging
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Email envoyé</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation.
        </p>
        <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Mot de passe oublié</h2>
      <p className="text-sm text-muted-foreground mb-6">Entrez votre email pour recevoir un lien de réinitialisation.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus className="h-10 rounded-xl" />
        </div>
        <Button type="submit" className="w-full h-10 rounded-xl font-semibold" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </Button>
      </form>
      <p className="text-center text-xs text-muted-foreground/60 mt-4">
        <Link to="/login" className="text-primary hover:text-primary/80">Retour à la connexion</Link>
      </p>
    </div>
  )
}
