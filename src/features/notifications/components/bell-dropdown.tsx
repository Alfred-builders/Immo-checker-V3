import { Bell, BellRinging, SealCheck, FileX, CalendarDots, CalendarX, UserCheck, UserMinus, EnvelopeSimple, Hourglass, ShieldCheck, UserCircleMinus, CheckCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverTrigger, PopoverContent } from 'src/components/ui/popover'
import { Button } from 'src/components/ui/button'
import { formatRelative } from 'src/lib/formatters'
import { useState } from 'react'
import type { Notification, NotificationType } from '../api'
import { useRecentNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../api'

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

function iconFor(type: string) {
  return ICON_MAP[type] ?? Bell
}

function colorFor(type: string) {
  return COLOR_MAP[type] ?? 'text-muted-foreground bg-muted'
}

// Strip leading emoji markers (e.g. 🧪 from dev/test seeds) from the displayed title.
function cleanTitle(s: string): string {
  return s.replace(/^\s*\p{Extended_Pictographic}[\uFE00-\uFE0F\u200D\p{Extended_Pictographic}]*\s*/u, '')
}

export function BellDropdown() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: countData } = useUnreadCount()
  const { data: listData, isLoading } = useRecentNotifications(10)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const unreadCount = countData?.count ?? 0
  const notifications = listData?.data ?? []

  function handleClick(n: Notification) {
    if (!n.est_lu) markAsRead.mutate(n.id)
    setOpen(false)
    if (n.lien) navigate(n.lien)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? <BellRinging size={18} weight="duotone" /> : <Bell size={18} weight="regular" />}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {unreadCount === 0 ? 'Tout est lu' : `${unreadCount} non lu${unreadCount > 1 ? 'es' : 'e'}`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              Tout marquer lu
            </Button>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">Chargement...</div>
          )}
          {!isLoading && notifications.length === 0 && (
            <div className="px-4 py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Aucune notification</p>
            </div>
          )}
          {!isLoading && notifications.length > 0 && (
            <div className="divide-y divide-border/40">
              {notifications.map((n) => (
                <NotificationItem key={n.id} n={n} onClick={() => handleClick(n)} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/40 px-2 py-2">
          <button
            onClick={() => { setOpen(false); navigate('/app/notifications') }}
            className="w-full text-center text-[12px] font-medium text-primary hover:bg-primary/5 rounded-md py-1.5 transition-colors"
          >
            Voir toutes les notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationItem({ n, onClick }: { n: Notification; onClick: () => void }) {
  const Icon = iconFor(n.type)
  const colorCls = colorFor(n.type)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors ${n.est_lu ? '' : 'bg-primary/[0.03]'}`}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
        <Icon size={18} weight="duotone" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] leading-tight ${n.est_lu ? 'text-foreground' : 'font-semibold text-foreground'}`}>
            {cleanTitle(n.titre)}
          </p>
          {!n.est_lu && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />}
        </div>
        {n.message && (
          <p className="text-[11.5px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground/70 mt-1">{formatRelative(n.created_at)}</p>
      </div>
    </button>
  )
}

export type { NotificationType }
