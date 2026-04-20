import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from '@phosphor-icons/react'
import { useAuth } from '../../../hooks/use-auth'
import { Button } from '../../../components/ui/button'
import { useOnboardingStatus, useUpdateOnboarding } from '../api'
import { ProgressBar } from './progress-bar'
import { Step1Welcome } from './steps/step-1-welcome'
import { Step2Identity } from './steps/step-2-identity'
import { Step3Team } from './steps/step-3-team'
import { Step4Done } from './steps/step-4-done'

const STEPS = [
  { id: 1, label: 'Bienvenue' },
  { id: 2, label: 'Identité' },
  { id: 3, label: 'Équipe' },
  { id: 4, label: 'Terminé' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, refreshWorkspace } = useAuth()
  const { data: status, isLoading } = useOnboardingStatus()
  const updateOnboarding = useUpdateOnboarding()
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (status && !status.completed_at) {
      setCurrentStep(Math.min(Math.max(status.current_step || 1, 1), STEPS.length))
    }
  }, [status])

  // Already completed → redirect to dashboard
  useEffect(() => {
    if (user?.onboarding_completed_at) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function advanceTo(next: number) {
    setCurrentStep(next)
    try {
      await updateOnboarding.mutateAsync({ action: 'advance', step: next })
    } catch {}
  }

  async function skip(step: number) {
    try {
      await updateOnboarding.mutateAsync({ action: 'skip', skipped_step: step })
    } catch {}
    await advanceTo(step + 1)
  }

  async function complete() {
    try {
      await updateOnboarding.mutateAsync({ action: 'complete' })
      await refreshWorkspace()
    } catch {}
  }

  function exploreFirst() {
    // User exits wizard without completing → go to dashboard (checklist will remain visible)
    navigate('/app/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  const skippedSteps = (status?.skipped_steps ?? []).map((s) => parseInt(s, 10)).filter((n) => !isNaN(n))

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="h-14 border-b border-border/50 bg-card px-6 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-sm font-semibold text-foreground">Configuration de votre espace</h1>
        <Button variant="ghost" size="sm" onClick={exploreFirst} className="text-xs">
          <X size={14} /> Explorer d'abord
        </Button>
      </header>

      {/* Progress */}
      <div className="px-6 py-6 border-b border-border/40 bg-card/40">
        <div className="max-w-3xl mx-auto">
          <ProgressBar steps={STEPS} currentStep={currentStep} skippedSteps={skippedSteps} />
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          {currentStep === 1 && <Step1Welcome onNext={() => advanceTo(2)} />}
          {currentStep === 2 && <Step2Identity onNext={() => advanceTo(3)} onSkip={() => skip(2)} />}
          {currentStep === 3 && <Step3Team onNext={() => advanceTo(4)} onSkip={() => skip(3)} />}
          {currentStep === 4 && (
            <Step4Done
              onGoPatrimoine={async () => { await complete(); navigate('/app/patrimoine') }}
              onGoDashboard={async () => { await complete(); navigate('/app/dashboard') }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
