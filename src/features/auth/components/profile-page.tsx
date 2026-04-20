import { useState } from 'react'
import { Eye, EyeSlash, User, Lock, Check } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { useAuth } from 'src/hooks/use-auth'
import { useUpdateProfile, useChangePassword } from 'src/features/admin/api'
import { toast } from 'sonner'

export function ProfilePage() {
  const { user, refreshWorkspace } = useAuth()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  // Profile form
  const [nom, setNom] = useState(user?.nom || '')
  const [prenom, setPrenom] = useState(user?.prenom || '')
  const [tel, setTel] = useState((user as any)?.tel || '')
  const [profileDirty, setProfileDirty] = useState(false)

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwError, setPwError] = useState('')

  function handleProfileChange(field: string, value: string) {
    if (field === 'nom') setNom(value)
    if (field === 'prenom') setPrenom(value)
    if (field === 'tel') setTel(value)
    setProfileDirty(true)
  }

  async function handleSaveProfile() {
    try {
      await updateProfile.mutateAsync({ nom, prenom, tel: tel || null })
      await refreshWorkspace()
      toast.success('Profil mis à jour')
      setProfileDirty(false)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (newPw !== confirmPw) { setPwError('Les mots de passe ne correspondent pas'); return }
    if (newPw.length < 8) { setPwError('8 caractères minimum'); return }
    if (!/[A-Z]/.test(newPw)) { setPwError('Au moins 1 majuscule'); return }
    if (!/[0-9]/.test(newPw)) { setPwError('Au moins 1 chiffre'); return }

    try {
      await changePassword.mutateAsync({ current_password: currentPw, new_password: newPw })
      toast.success('Mot de passe modifié. Les autres appareils ont été déconnectés.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) { setPwError(err.message || 'Erreur') }
  }

  return (
    <div className="px-8 py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mon profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      {/* Profile info */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-[13px] font-bold text-foreground">Informations personnelles</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Prénom</Label>
              <Input value={prenom} onChange={(e) => handleProfileChange('prenom', e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Nom</Label>
              <Input value={nom} onChange={(e) => handleProfileChange('nom', e.target.value)} className="h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
            <Input value={user?.email || ''} disabled className="h-10 bg-muted/30" />
            <p className="text-[10px] text-muted-foreground/50">L'email ne peut pas être modifié</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Téléphone</Label>
            <Input value={tel} onChange={(e) => handleProfileChange('tel', e.target.value)} placeholder="06 12 34 56 78" className="h-10" />
          </div>
        </div>

        {profileDirty && (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setNom(user?.nom || ''); setPrenom(user?.prenom || ''); setTel((user as any)?.tel || ''); setProfileDirty(false) }}>Annuler</Button>
            <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-[13px] font-bold text-foreground">Changer le mot de passe</span>
        </div>

        {pwError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
            {pwError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Mot de passe actuel</Label>
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className="h-10 pr-10" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground" tabIndex={-1}>
                {showCurrent ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Nouveau mot de passe</Label>
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)} required className="h-10 pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground" tabIndex={-1}>
                {showNew ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/50">8 caractères min., 1 majuscule, 1 chiffre</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Confirmer le nouveau mot de passe</Label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="h-10" />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
