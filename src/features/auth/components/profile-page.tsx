import { useRef, useState } from 'react'
import { Eye, EyeSlash, User, Lock, Camera, Trash, ShieldCheck, Check, Warning, Clock, Buildings } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { PasswordStrengthMeter, scorePassword } from 'src/components/password-strength-meter'
import { useAuth } from 'src/hooks/use-auth'
import { useUpdateProfile, useChangePassword } from 'src/features/admin/api'
import { toast } from 'sonner'
import { formatAsYouType, isValidPhone } from 'src/lib/phone'

const AVATAR_MAX_BYTES = 2 * 1024 * 1024 // 2 MB source file
const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'bg-primary/10 text-primary' },
  gestionnaire: { label: 'Gestionnaire', cls: 'bg-amber-500/15 text-amber-700' },
  technicien: { label: 'Technicien', cls: 'bg-emerald-500/15 text-emerald-700' },
}

export function ProfilePage() {
  const { user, workspace, refreshWorkspace } = useAuth()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const fileInput = useRef<HTMLInputElement>(null)

  const [nom, setNom] = useState(user?.nom || '')
  const [prenom, setPrenom] = useState(user?.prenom || '')
  const [tel, setTel] = useState(user?.tel || '')
  const [profileDirty, setProfileDirty] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwError, setPwError] = useState('')

  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : '?'
  const role = ROLE_LABEL[user?.role || ''] || { label: user?.role || '—', cls: 'bg-muted text-foreground' }
  const telValid = !tel || isValidPhone(tel)

  function handleTelChange(v: string) {
    setTel(formatAsYouType(v))
    setProfileDirty(true)
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Fichier non image'); return }
    if (file.size > AVATAR_MAX_BYTES) { toast.error('Image trop lourde (max 2 MB)'); return }
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      try {
        await updateProfile.mutateAsync({ avatar_url: dataUrl })
        await refreshWorkspace()
        toast.success('Photo de profil mise à jour')
      } catch (err: any) { toast.error(err.message || 'Erreur upload') }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleRemoveAvatar() {
    try {
      await updateProfile.mutateAsync({ avatar_url: null })
      await refreshWorkspace()
      toast.success('Photo retirée')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleSaveProfile() {
    if (tel && !telValid) { toast.error('Numéro de téléphone invalide'); return }
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
    if (scorePassword(newPw) < 3) { setPwError('Mot de passe trop faible (longueur, majuscule, chiffre requis)'); return }

    try {
      await changePassword.mutateAsync({ current_password: currentPw, new_password: newPw })
      toast.success('Mot de passe modifié. Les autres appareils ont été déconnectés.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) { setPwError(err.message || 'Erreur') }
  }

  const lastLogin = user?.last_login_at
    ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true, locale: fr })
    : null

  return (
    <div className="px-8 py-6 max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6">
        <div className="flex items-start gap-5">
          {/* Avatar with overlay */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border/40 shadow-elevation-raised bg-primary/8 flex items-center justify-center text-primary font-bold text-2xl tracking-tight">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              title="Changer la photo"
            >
              <Camera size={18} />
            </button>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarFile} className="hidden" />
          </div>

          {/* Identity + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground truncate">{user?.prenom} {user?.nom}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${role.cls}`}>
                <ShieldCheck size={12} weight="fill" /> {role.label}
              </span>
              {workspace && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-foreground/70">
                  <Buildings size={12} /> {workspace.nom}
                </span>
              )}
              {lastLogin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/40 text-muted-foreground" title={user?.last_login_ip ? `IP ${user.last_login_ip}` : undefined}>
                  <Clock size={12} /> Connecté {lastLogin}
                </span>
              )}
            </div>
          </div>

          {user?.avatar_url && (
            <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} className="text-muted-foreground hover:text-destructive shrink-0">
              <Trash size={14} className="mr-1.5" /> Retirer
            </Button>
          )}
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6 space-y-5">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-[13px] font-bold text-foreground">Informations personnelles</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Prénom</Label>
              <Input value={prenom} onChange={(e) => { setPrenom(e.target.value); setProfileDirty(true) }} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Nom</Label>
              <Input value={nom} onChange={(e) => { setNom(e.target.value); setProfileDirty(true) }} className="h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
            <Input value={user?.email || ''} disabled className="h-10 bg-muted/30" />
            <p className="text-[10px] text-muted-foreground/50">L'email ne peut pas être modifié</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Téléphone</Label>
            <div className="relative">
              <Input
                value={tel}
                onChange={(e) => handleTelChange(e.target.value)}
                placeholder="06 12 34 56 78"
                className={`h-10 pr-9 ${tel && !telValid ? 'border-destructive/60 focus-visible:ring-destructive/40' : ''}`}
              />
              {tel && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {telValid
                    ? <Check size={14} className="text-green-600" weight="bold" />
                    : <Warning size={14} className="text-destructive" weight="fill" />}
                </span>
              )}
            </div>
            {tel && !telValid && <p className="text-[10px] text-destructive">Numéro invalide — format attendu : 06 12 34 56 78 ou +33 6 12 34 56 78</p>}
          </div>
        </div>

        {profileDirty && (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setNom(user?.nom || ''); setPrenom(user?.prenom || ''); setTel(user?.tel || ''); setProfileDirty(false) }}>Annuler</Button>
            <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending || (!!tel && !telValid)}>
              {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-6 space-y-5">
        <div className="flex items-center gap-3">
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
            <PasswordStrengthMeter value={newPw} />
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
