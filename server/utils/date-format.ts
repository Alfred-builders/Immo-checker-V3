/**
 * Formate une date en `dd/MM/yyyy` français pour les messages utilisateur
 * (notifications, webhooks, logs visibles côté front).
 *
 * Lit les composants UTC pour éviter les décalages de fuseau lorsque la
 * valeur vient d'une colonne PostgreSQL DATE (sans heure → minuit UTC).
 */
export function formatDateFr(value: Date | string | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}
