import { toast } from 'sonner'

interface UndoableOptions {
  /** Message affiché dans le toast (ex. "Mission annulée"). */
  message: string
  /**
   * Action destructive à exécuter si l'utilisateur ne clique pas sur "Annuler"
   * pendant la fenêtre de undo. Peut être async — les erreurs sont reportées
   * via un toast.error. Le retour est ignoré.
   */
  run: () => void | Promise<unknown>
  /** Durée (secondes) avant l'exécution effective. Défaut : 5. */
  delaySec?: number
  /** Callback synchrone optionnel quand l'utilisateur clique sur "Annuler". */
  onUndo?: () => void
  /** Libellé du bouton d'annulation. Défaut : "Annuler". */
  undoLabel?: string
  /** Description optionnelle (sous le titre). */
  description?: string
}

/**
 * Toast bottom-left avec bouton "Annuler" pour les actions destructives —
 * pattern Gmail. L'action passée dans `run` n'est exécutée qu'à l'expiration
 * du toast (par défaut 5 s) ; cliquer sur "Annuler" la court-circuite.
 *
 * Usage :
 * ```tsx
 * undoableToast({
 *   message: 'Clé supprimée',
 *   run: () => deleteCle.mutateAsync({ id }),
 * })
 * ```
 *
 * Avec UI optimiste — masquer immédiatement, restaurer si annulé :
 * ```tsx
 * setHidden(true)
 * undoableToast({
 *   message: 'Élément supprimé',
 *   run: () => mutation.mutateAsync({ id }),
 *   onUndo: () => setHidden(false),
 * })
 * ```
 */
export function undoableToast({
  message,
  run,
  delaySec = 5,
  onUndo,
  undoLabel = 'Annuler',
  description,
}: UndoableOptions): string | number {
  let cancelled = false
  let committed = false

  function commit() {
    if (cancelled || committed) return
    committed = true
    try {
      const result = run()
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        ;(result as Promise<unknown>).catch((err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Erreur')
        })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  return toast(message, {
    position: 'bottom-left',
    duration: delaySec * 1000,
    description,
    action: {
      label: undoLabel,
      onClick: () => {
        cancelled = true
        onUndo?.()
      },
    },
    // Naturel : timer expire → on commit.
    onAutoClose: commit,
    // Filet de sécurité : un dismiss programmatique commit aussi (si pas annulé).
    onDismiss: commit,
  })
}
