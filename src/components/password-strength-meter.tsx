import { Check, X } from '@phosphor-icons/react'

type Rule = { id: string; label: string; test: (v: string) => boolean }

const RULES: Rule[] = [
  { id: 'length', label: '8 caractères', test: (v) => v.length >= 8 },
  { id: 'upper', label: '1 majuscule', test: (v) => /[A-Z]/.test(v) },
  { id: 'digit', label: '1 chiffre', test: (v) => /[0-9]/.test(v) },
  { id: 'symbol', label: '1 symbole', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

const LEVELS = [
  { label: 'Très faible', bar: 'bg-destructive', text: 'text-destructive' },
  { label: 'Faible', bar: 'bg-destructive/80', text: 'text-destructive' },
  { label: 'Moyen', bar: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Bon', bar: 'bg-lime-500', text: 'text-lime-700' },
  { label: 'Fort', bar: 'bg-green-600', text: 'text-green-700' },
] as const

export function scorePassword(value: string): number {
  return RULES.reduce((acc, r) => acc + (r.test(value) ? 1 : 0), 0)
}

export function PasswordStrengthMeter({ value, showRules = true }: { value: string; showRules?: boolean }) {
  if (!value) return null
  const score = scorePassword(value)
  const level = LEVELS[score]

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i < score ? level.bar : 'bg-muted/60'}`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-semibold tabular-nums ${level.text}`}>{level.label}</span>
      </div>

      {showRules && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {RULES.map((r) => {
            const ok = r.test(value)
            return (
              <li key={r.id} className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-green-700' : 'text-muted-foreground/60'}`}>
                {ok ? <Check size={12} weight="bold" /> : <X size={12} />}
                <span>{r.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
