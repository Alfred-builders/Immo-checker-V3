import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, SealCheck, FileX, CalendarDots, CalendarX, UserCheck, UserMinus, EnvelopeSimple, Hourglass, ShieldCheck, UserCircleMinus, CheckCircle, Trash, CheckCircle as CheckAll } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { formatRelative } from 'src/lib/formatters'
import type { Notification } from '../api'
import { useNotificationsList, useMarkAllAsRead, useMarkAsRead, useDismissNotification } from '../api'

const ICON_MAP: Record<string, typeof Bell> = {
  edl_signed: SealCheck,
  edl_infructueux: FileX,
  mission_created: CalendarDots,
  mission_cancelled: CalendarX,
  mission_completed: CheckCircle,
  technicien_accepted: UserCheck,
  technicien_refused: UserMinus,
  invitation_accepted: EnvelopeSimple,
  invitation_expired: Hourglass,
  password_changed: ShieldCheck,
  user_deactivated: UserCircleMinus,
}
const COLOR_MAP: Record<string, string> = {
  edl_signed: 'text-emerald-600 bg-emerald-50',
  edl_infructueux: 'text-amber-600 bg-amber-50',
  mission_created: 'text-blue-600 bg-blue-50',
  mission_cancelled: 'text-rose-600 bg-rose-50',
  mission_completed: 'text-emerald-600 bg-emerald-50',
  technicien_accepted: 'text-emerald-600 bg-emerald-50',
  technicien_refused: 'text-rose-600 bg-rose-50',
  invitation_accepted: 'text-violet-600 bg-violet-50',
  invitation_expired: 'text-zinc-600 bg-zinc-50',
  password_changed: 'text-sky-600 bg-sky-50',
  user_deactivated: 'text-zinc-600 bg-zinc-50',
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotificationsList(filter === 'unread')
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Historique des événements de votre workspace</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllAsRead.mutate()}
          disabled={markAllAsRead.isPending}
        >
          <CheckAll size={14} className="mr-1.5" /> Tout marquer lu
        </Button>
      </div>

      <div className="flex items-center bg-muted/60 rounded-full p-0.5 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === 'unread' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Non lues
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-4">
                <Skeleton className="h-14 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium">Aucune notification</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === 'unread' ? 'Vous êtes à jour !' : 'Vos notifications apparaîtront ici.'}
            </p>
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <div className="divide-y divide-border/40">
            {notifications.map((n) => <Row key={n.id} n={n} />)}
          </div>
        )}

        {hasNextPage && (
          <div className="px-6 py-4 border-t border-border/40 text-center">
            <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? 'Chargement...' : 'Charger plus'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ n }: { n: Notification }) {
  const navigate = useNavigate()
  const markAsRead = useMarkAsRead()
  const dismiss = useDismissNotification()
  const Icon = ICON_MAP[n.type] ?? Bell
  const colorCls = COLOR_MAP[n.type] ?? 'text-muted-foreground bg-muted'

  function handleClick() {
    if (!n.est_lu) markAsRead.mutate(n.id)
    if (n.lien) navigate(n.lien)
  }

  return (
    <div className={`group flex items-start gap-3 px-6 py-4 hover:bg-accent/30 transition-colors ${n.est_lu ? '' : 'bg-primary/[0.03]'}`}>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
        <Icon size={20} weight="duotone" />
      </div>
      <button onClick={handleClick} className="flex-1 min-w-0 text-left">
        <div className="flex items-start gap-2">
          <p className={`text-sm leading-tight ${n.est_lu ? 'text-foreground' : 'font-semibold text-foreground'}`}>
            {n.titre}
          </p>
          {!n.est_lu && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
        </div>
        {n.message && <p className="text-xs text-muted-foreground mt-1">{n.message}</p>}
        <p className="text-[11px] text-muted-foreground/70 mt-1.5">{formatRelative(n.created_at)}</p>
      </button>
      <button
        onClick={() => dismiss.mutate(n.id)}
        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
        title="Supprimer"
      >
        <Trash size={14} />
      </button>
    </div>
  )
}
