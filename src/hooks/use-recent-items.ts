import { useEffect, useState, useCallback } from 'react'

export type RecentItemType = 'mission' | 'lot' | 'batiment' | 'tiers'

export interface RecentItem {
  id: string
  type: RecentItemType
  /** Texte principal affiché dans la liste (ex. "M-2026-0001", "Bureau 4A"). */
  label: string
  /** Sous-titre optionnel (ex. nom du lot, adresse). */
  subtitle?: string
  /** URL de navigation au clic. */
  to: string
  /** Timestamp de la dernière visite (ms epoch) — sert au tri. */
  viewedAt: number
}

const STORAGE_KEY = 'recent_items_v1'
const MAX_ITEMS = 10

function readStorage(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Validation minimale + filtrage des entrées corrompues.
    return parsed.filter(
      (x): x is RecentItem =>
        x && typeof x.id === 'string' && typeof x.type === 'string' &&
        typeof x.label === 'string' && typeof x.to === 'string' &&
        typeof x.viewedAt === 'number',
    )
  } catch {
    return []
  }
}

function writeStorage(items: RecentItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage plein ou désactivé : silently ignore.
  }
}

/**
 * Historique local des derniers éléments consultés (mission, lot, bâtiment,
 * tiers) — affiché dans la modale Cmd+K à la place des suggestions statiques.
 *
 * Stockage : `localStorage` (par device, par browser). Capé à 10 items.
 * Pas de sync serveur — c'est une commodité, pas une donnée critique.
 */
export function useRecentItems() {
  const [items, setItems] = useState<RecentItem[]>(() => readStorage())

  // Écoute les changements cross-tabs (un autre onglet visite une page).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setItems(readStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setItems((current) => {
      // Dedupe sur (type, id) — déplace en tête au lieu de dupliquer.
      const filtered = current.filter((x) => !(x.type === item.type && x.id === item.id))
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
      writeStorage(next)
      return next
    })
  }, [])

  const clearItems = useCallback(() => {
    writeStorage([])
    setItems([])
  }, [])

  return { items, addItem, clearItems }
}
