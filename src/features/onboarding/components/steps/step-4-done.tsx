import { CheckCircle, BuildingOffice, SquaresFour } from '@phosphor-icons/react'
import { Button } from '../../../../components/ui/button'

export function Step4Done({ onGoPatrimoine, onGoDashboard }: {
  onGoPatrimoine: () => void
  onGoDashboard: () => void
}) {
  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
        <CheckCircle size={28} weight="fill" className="text-emerald-600" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Configuration terminée 🎉
        </h2>
        <p className="text-muted-foreground">
          Votre espace est prêt. Il ne reste plus qu'à ajouter votre parc immobilier et à démarrer.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoPatrimoine}
          className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-accent/40 transition-colors text-left"
        >
          <BuildingOffice size={22} className="text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Ajouter mes bâtiments</p>
            <p className="text-[11px] text-muted-foreground mt-1">Import CSV ou création manuelle</p>
          </div>
        </button>

        <button
          onClick={onGoDashboard}
          className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-accent/40 transition-colors text-left"
        >
          <SquaresFour size={22} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">Explorer le tableau de bord</p>
            <p className="text-[11px] text-muted-foreground mt-1">Découvrir l'interface</p>
          </div>
        </button>
      </div>

      <p className="text-xs text-muted-foreground pt-4">
        Vous pourrez relancer cet assistant à tout moment depuis Paramètres → Général.
      </p>

      <Button onClick={onGoDashboard} size="lg" className="w-full">
        Aller au tableau de bord
      </Button>
    </div>
  )
}
