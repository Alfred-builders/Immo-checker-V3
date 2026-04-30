import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { SpinnerGap } from '@phosphor-icons/react'

interface FloatingSaveBarProps {
  visible: boolean
  onSave: () => void
  onCancel: () => void
  saving: boolean
  hasChanges?: boolean
}

export function FloatingSaveBar({ visible, onSave, onCancel, saving, hasChanges = true }: FloatingSaveBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 elevation-floating rounded-2xl px-6 py-3 flex items-center gap-4"
        >
          <span className="text-sm text-muted-foreground">
            {hasChanges ? 'Modifications non enregistrées' : 'Aucune modification'}
          </span>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            Annuler
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving || !hasChanges} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving && <SpinnerGap className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Enregistrer
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
