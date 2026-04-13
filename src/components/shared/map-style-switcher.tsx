import { useState } from 'react'
import { Map, Satellite, Sun, Moon } from 'lucide-react'

const MAP_STYLES = [
  { id: 'light', label: 'Clair', style: 'mapbox://styles/mapbox/light-v11', icon: Sun },
  { id: 'dark', label: 'Sombre', style: 'mapbox://styles/mapbox/dark-v11', icon: Moon },
  { id: 'streets', label: 'Rues', style: 'mapbox://styles/mapbox/streets-v12', icon: Map },
  { id: 'satellite', label: 'Satellite', style: 'mapbox://styles/mapbox/satellite-streets-v12', icon: Satellite },
] as const

export type MapStyleId = (typeof MAP_STYLES)[number]['id']

interface Props {
  currentStyle: MapStyleId
  onChange: (styleId: MapStyleId, styleUrl: string) => void
}

export function MapStyleSwitcher({ currentStyle, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute top-3 left-3 z-10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground shadow-elevation-raised hover:bg-muted/50 transition-colors"
        title="Changer le style de carte"
      >
        <Map className="h-3.5 w-3.5" />
        <span>{MAP_STYLES.find(s => s.id === currentStyle)?.label}</span>
      </button>
      {open && (
        <div className="mt-1.5 bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-elevation-overlay overflow-hidden">
          {MAP_STYLES.map((s) => {
            const Icon = s.icon
            const isActive = currentStyle === s.id
            return (
              <button
                key={s.id}
                onClick={() => {
                  onChange(s.id, s.style)
                  setOpen(false)
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { MAP_STYLES }
