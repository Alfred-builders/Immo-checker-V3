import { Sparkle, ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { useAuth } from '../../../../hooks/use-auth'

const typeLabels: Record<string, string> = {
  societe_edl: 'Société EDL',
  bailleur: 'Bailleur',
  agence: 'Agence immobilière',
}

export function Step1Welcome({ onNext }: { onNext: () => void }) {
  const { workspace, user } = useAuth()

  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <Sparkle size={24} weight="fill" className="text-primary" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Bienvenue {user?.prenom} 👋
        </h2>
        <p className="text-muted-foreground">
          Vous êtes le premier administrateur de <strong className="text-foreground">{workspace?.nom}</strong>.
          En quelques étapes, nous allons configurer votre espace ImmoChecker.
        </p>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Nom du workspace</span>
          <span className="text-sm font-semibold text-foreground">{workspace?.nom}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">Type</span>
          <Badge variant="outline" className="capitalize">
            {workspace?.type_workspace ? typeLabels[workspace.type_workspace] ?? workspace.type_workspace : '—'}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Ces informations ont été définies par l'équipe ImmoChecker lors de la création de votre espace.
        Vous pourrez toujours ajuster les autres paramètres plus tard.
      </p>

      <Button onClick={onNext} size="lg" className="w-full">
        Commencer la configuration
        <ArrowRight size={16} weight="bold" />
      </Button>
    </div>
  )
}
