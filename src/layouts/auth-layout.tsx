import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-6 py-12">
      {/* Subtle background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-1/3 w-[350px] h-[350px] rounded-full bg-primary/[0.03] blur-[100px]" />

      <div className="relative z-10 w-full max-w-[400px] animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <span className="text-xl font-bold text-foreground tracking-tight">ImmoChecker</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border-0 shadow-elevation-floating p-8 sm:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
