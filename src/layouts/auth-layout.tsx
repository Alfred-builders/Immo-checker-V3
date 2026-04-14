import { Outlet } from 'react-router-dom'
import { Buildings } from '@phosphor-icons/react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Left panel — brand side */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative items-center justify-center" style={{ background: 'linear-gradient(135deg, #2d526c 0%, #1a3344 50%, #0f1f2a 100%)' }}>
        {/* Decorative shapes */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-white/[0.03] blur-xl" />
          <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-white/[0.02] blur-2xl" />
          <div className="absolute top-[60%] left-[40%] w-40 h-40 rounded-full bg-white/[0.04] blur-lg" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative z-10 px-12 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Buildings className="h-6 w-6 text-white" weight="fill" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ImmoChecker</span>
          </div>

          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight mb-4">
            Gérez vos états des lieux en toute simplicité
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed">
            Planifiez vos missions, suivez vos techniciens et pilotez votre activité depuis un seul outil.
          </p>

          {/* Feature bullets */}
          <div className="mt-10 space-y-4">
            {[
              'Planification des missions & calendrier',
              'Suivi en temps réel des EDL',
              'Gestion du parc immobilier',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <span className="text-white/40 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom brand */}
        <div className="absolute bottom-8 left-12 text-white/20 text-xs">
          © 2026 ImmoChecker
        </div>
      </div>

      {/* Right panel — form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle background glow */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/4 w-[350px] h-[350px] rounded-full bg-primary/[0.03] blur-[100px]" />

        <div className="relative z-10 w-full max-w-[420px]">
          {/* Mobile logo (hidden on desktop) */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Buildings className="h-5 w-5 text-primary" weight="fill" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">ImmoChecker</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-floating p-8 sm:p-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
