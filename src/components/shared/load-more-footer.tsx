import { useEffect, useRef } from 'react'
import { SpinnerGap } from '@phosphor-icons/react'

interface LoadMoreFooterProps {
  currentCount: number
  total?: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  /** Singulier / pluriel pour le compteur. Ex: ['mission', 'missions']. */
  noun?: [string, string]
}

export function LoadMoreFooter({
  currentCount,
  total,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  noun = ['élément', 'éléments'],
}: LoadMoreFooterProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      { rootMargin: '120px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  const [singular, plural] = noun
  const word = currentCount === 1 ? singular : plural
  const verb = currentCount === 1 ? 'affiché' : 'affichés'
  const counter =
    typeof total === 'number'
      ? `${currentCount} ${word} sur ${total} ${verb}`
      : `${currentCount} ${word} ${verb}`

  return (
    <>
      {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px" />}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 text-[11px] text-muted-foreground border-t border-border/40">
        <span>{counter}</span>
        {isFetchingNextPage ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground/70">
            <SpinnerGap className="h-3 w-3 animate-spin" />
            Chargement…
          </span>
        ) : !hasNextPage && currentCount > 0 ? (
          <span className="text-muted-foreground/60">Tous les résultats sont affichés</span>
        ) : null}
      </div>
    </>
  )
}
