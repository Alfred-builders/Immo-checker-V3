import { useState, useMemo } from 'react'
import { SlidersHorizontal, SpinnerGap } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Skeleton } from 'src/components/ui/skeleton'
import { useConfigCriteres, useUpdateConfigCritere } from '../api'
import type {
  CatalogueContexte, CatalogueCategorie, CritereEvaluation, NiveauExigence,
  ConfigCritereCategorie,
} from '../types'
import {
  catalogueCategorieLabels, critereLabels, niveauLabels, niveauColors,
} from '../types'

const ALL_CRITERES: CritereEvaluation[] = [
  'etat_general', 'proprete', 'photos', 'caracteristiques',
  'couleur', 'degradations', 'fonctionnement', 'quantite',
]

const NIVEAU_CYCLE: NiveauExigence[] = ['masque', 'optionnel', 'recommande', 'obligatoire']

const ALL_CATEGORIES: CatalogueCategorie[] = [
  'revetement_sol', 'revetement_mur', 'revetement_plafond',
  'menuiserie', 'plomberie', 'electricite', 'chauffage', 'ventilation',
  'electromenager', 'mobilier', 'equipement', 'serrurerie',
  'vitrage', 'exterieur', 'divers', 'structure', 'securite',
]

export function CriteresPage() {
  const [tab, setTab] = useState<CatalogueContexte>('edl')
  const { data: configs, isLoading } = useConfigCriteres(tab)
  const updateMutation = useUpdateConfigCritere()

  // Map config to a lookup for quick access
  const configMap = useMemo(() => {
    const map: Record<string, ConfigCritereCategorie> = {}
    if (configs) {
      configs.forEach((c) => { map[c.categorie] = c })
    }
    return map
  }, [configs])

  function handleCellClick(categorie: CatalogueCategorie, critere: CritereEvaluation) {
    const config = configMap[categorie]
    if (!config) return

    const currentNiveau = config[critere] as NiveauExigence
    const currentIdx = NIVEAU_CYCLE.indexOf(currentNiveau)
    const nextNiveau = NIVEAU_CYCLE[(currentIdx + 1) % NIVEAU_CYCLE.length]

    updateMutation.mutate(
      { categorie, contexte: tab, [critere]: nextNiveau },
      {
        onError: () => toast.error('Erreur lors de la mise à jour'),
      }
    )
  }

  const tabs: { key: CatalogueContexte; label: string }[] = [
    { key: 'edl', label: 'EDL' },
    { key: 'inventaire', label: 'Inventaire' },
  ]

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Critères d'exigence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configurez le niveau d'exigence de chaque critere par categorie d'items.
          Cliquez sur une cellule pour changer le niveau.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1 w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">Legende :</span>
        {NIVEAU_CYCLE.map((niveau) => (
          <span
            key={niveau}
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${niveauColors[niveau]}`}
          >
            {niveauLabels[niveau]}
          </span>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised p-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!configs || configs.length === 0) && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/60 mb-4">
            <SlidersHorizontal className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Aucune configuration de critères</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Les critères seront disponibles une fois le catalogue initialise
          </p>
        </div>
      )}

      {/* Matrix table */}
      {!isLoading && configs && configs.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground w-52 sticky left-0 bg-muted/30 z-10">
                    Categorie
                  </th>
                  {ALL_CRITERES.map((critere) => (
                    <th
                      key={critere}
                      className="text-center px-3 py-3.5 text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {critereLabels[critere]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_CATEGORIES.map((cat) => {
                  const config = configMap[cat]
                  return (
                    <tr
                      key={cat}
                      className="border-t border-border/40 hover:bg-accent/30 transition-colors duration-200"
                    >
                      {/* Category name */}
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground sticky left-0 bg-card z-10">
                        {catalogueCategorieLabels[cat]}
                      </td>

                      {/* Critere cells */}
                      {ALL_CRITERES.map((critere) => {
                        const niveau = config ? (config[critere] as NiveauExigence) : 'masque'
                        return (
                          <td key={critere} className="text-center px-3 py-3.5">
                            <NiveauCell
                              niveau={niveau}
                              onClick={() => handleCellClick(cat, critere)}
                              disabled={!config || updateMutation.isPending}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Updating indicator */}
      {updateMutation.isPending && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/60 shadow-elevation-overlay">
          <SpinnerGap className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Mise à jour...</span>
        </div>
      )}
    </div>
  )
}

// ── Niveau Cell ──

function NiveauCell({
  niveau,
  onClick,
  disabled,
}: {
  niveau: NiveauExigence
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[11px] font-medium
        transition-all duration-200 cursor-pointer select-none
        hover:ring-2 hover:ring-offset-1 hover:ring-primary/20
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:ring-0
        ${niveauColors[niveau]}
      `}
      title={`Cliquez pour changer — Actuel : ${niveauLabels[niveau]}`}
    >
      {niveauLabels[niveau]}
    </button>
  )
}
