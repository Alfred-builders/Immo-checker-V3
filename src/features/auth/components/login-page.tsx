import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeSlash, ArrowRight, EnvelopeSimple, Lock } from '@phosphor-icons/react'
import { useAuth } from '../../../hooks/use-auth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.requireWorkspaceSelect) {
        navigate('/workspace-select', {
          state: { workspaces: result.workspaces, user: result.user },
        })
      } else {
        navigate('/app/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Accédez à votre espace de travail
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
            Adresse email
          </Label>
          <div className="relative">
            <EnvelopeSimple className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@entreprise.fr"
              required
              autoFocus
              className="h-11 pl-10 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
              Mot de passe
            </Label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              className="h-11 pl-10 pr-10 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-semibold text-sm gap-2 mt-1"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Connexion...
            </span>
          ) : (
            <>
              Se connecter
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border/40">
        <p className="text-center text-xs text-muted-foreground">
          Pas encore de compte ?{' '}
          <span className="text-foreground/70 font-medium">
            Contactez votre administrateur
          </span>
        </p>
      </div>
    </div>
  )
}
