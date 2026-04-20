import { useState } from 'react'
import { UsersThree, Envelope, PaperPlaneTilt, SpinnerGap, Shield, BuildingOffice, UserPlus, Clock, CheckCircle, WarningCircle, Copy, X, MapPin, Phone, At, Hash, Palette, CaretRight, Globe, GridFour, BookOpen, Sliders, Code, Key, Trash, Plus, Eye, EyeSlash, Bell, ArrowClockwise, Warning, LinkSimple, ArrowSquareOut } from '@phosphor-icons/react'
import { FloatingSaveBar } from 'src/components/shared/floating-save-bar'
import { ConfirmDialog } from 'src/components/shared/confirm-dialog'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../hooks/use-auth'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Skeleton } from 'src/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { useWorkspaceDetails, useUpdateWorkspace, useWorkspaceUsers, useInvitations, useSendInvitation, useChangeRole, useSetUserStatus, useResendInvitation, useCancelInvitation, useApiKeys, useCreateApiKey, useRevokeApiKey, useUpdateApiKey, useWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook, useTestWebhook, useWebhookDeliveries } from '../api'
import type { WorkspaceUser, Invitation, ApiKey, CreateApiKeyResult, WebhookConfig, WebhookDelivery, WebhookEvent } from '../api'

const ROLES = ['admin', 'gestionnaire', 'technicien'] as const
type Role = (typeof ROLES)[number]

const roleConfig: Record<Role, { label: string; color: string; bg: string; border: string; description: string; icon: string }> = {
  admin: { label: 'Admin', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', description: 'Accès complet', icon: '🔴' },
  gestionnaire: { label: 'Gestionnaire', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', description: 'Back-office', icon: '🔵' },
  technicien: { label: 'Technicien', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'App mobile', icon: '🟢' },
}

const typeLabels: Record<string, string> = {
  societe_edl: 'Société EDL', bailleur: 'Bailleur', agence: 'Agence immobilière',
}

type Section = 'general' | 'users' | 'invitations' | 'api'

const NAV_ITEMS: { key: Section; label: string; icon: typeof BuildingOffice; description: string }[] = [
  { key: 'general', label: 'Général', icon: BuildingOffice, description: 'Informations du workspace' },
  { key: 'users', label: 'Membres', icon: UsersThree, description: 'Utilisateurs & invitations' },
  { key: 'api', label: 'API & Intégrations', icon: Code, description: 'Clés API et webhooks' },
]

const NAV_LINKS: { label: string; icon: typeof BuildingOffice; href: string; description: string }[] = [
  { label: 'Templates', icon: GridFour, href: '/app/parametres/templates', description: 'Types de pièces' },
  { label: 'Catalogue', icon: BookOpen, href: '/app/parametres/catalogue', description: 'Items EDL/Inventaire' },
  { label: 'Critères', icon: Sliders, href: '/app/parametres/critères', description: 'Niveaux d\'exigence' },
]

export function SettingsPage() {
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Section | null) ?? 'general'
  const [section, setSection] = useState<Section>(
    initialTab === 'invitations' ? 'users' : ['general', 'users', 'api'].includes(initialTab) ? initialTab : 'general'
  )
  const navigate = useNavigate()

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurez votre workspace et gérez votre équipe</p>
      </div>

      <div className="flex gap-8">
        {/* Left sidebar nav */}
        <nav className="w-56 shrink-0">
          <div className="space-y-1 sticky top-20">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  section === key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}

            {/* EPIC 4 sub-pages — coming soon */}
            <div className="pt-4 mt-4 border-t border-border/60">
              <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">Configuration EDL</p>
              {NAV_LINKS.map(({ label, icon: Icon, href }) => (
                <div
                  key={href}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
                  title="À venir"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <span className="text-[10px] font-medium text-muted-foreground/50 bg-muted/60 px-1.5 py-0.5 rounded">À venir</span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {section === 'general' && <GeneralSection />}
          {section === 'users' && <MembresSection />}
          {section === 'api' && <ApiSection />}
        </div>
      </div>
    </div>
  )
}

// ── General Section ──
function GeneralSection() {
  const { data: ws, isLoading } = useWorkspaceDetails()
  const updateMutation = useUpdateWorkspace()
  const { refreshWorkspace } = useAuth()
  const [editing, setEditing] = useState(false)
  const [nom, setNom] = useState('')
  const [siret, setSiret] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [couleurPrimaire, setCouleurPrimaire] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [couleurFond, setCouleurFond] = useState('')
  const [fondStyle, setFondStyle] = useState('gradient')

  function startEdit() {
    if (!ws) return
    setNom(ws.nom)
    setSiret(ws.siret || '')
    setEmail(ws.email || '')
    setTelephone(ws.telephone || '')
    setAdresse(ws.adresse || '')
    setCodePostal(ws.code_postal || '')
    setVille(ws.ville || '')
    setCouleurPrimaire(ws.couleur_primaire || '')
    setLogoUrl(ws.logo_url)
    setCouleurFond(ws.couleur_fond || '')
    setFondStyle(ws.fond_style || 'gradient')
    setEditing(true)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512 * 1024) {
      toast.error('Le logo ne doit pas dépasser 512 Ko')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setLogoUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (siret && !/^\d{14}$/.test(siret.trim())) { toast.error('SIRET doit contenir exactement 14 chiffres'); return }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { toast.error('Format email invalide'); return }
    try {
      await updateMutation.mutateAsync({
        nom, siret: siret || null, email: email || null, telephone: telephone || null,
        adresse: adresse || null, code_postal: codePostal || null, ville: ville || null,
        couleur_primaire: couleurPrimaire || null,
        couleur_fond: couleurFond || null,
        logo_url: logoUrl || null,
        fond_style: fondStyle || 'gradient',
      } as any)
      await refreshWorkspace()
      toast.success('Workspace mis à jour')
      setEditing(false)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (isLoading) return <div className="space-y-6">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
  if (!ws) return <p className="text-muted-foreground">Workspace introuvable</p>

  return (
    <div className="space-y-8">
      {/* Section header + actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Informations générales</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Identité et coordonnées de votre workspace</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEdit}>Modifier</Button>
        )}
      </div>

      {/* Identity block */}
      <SettingsBlock title="Identité" icon={BuildingOffice}>
        {editing ? (
          <div className="space-y-4">
            <FieldRow label="Nom du workspace" required>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} className="max-w-md" />
            </FieldRow>
            <FieldRow label="Type">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{typeLabels[ws.type_workspace] || ws.type_workspace}</Badge>
                <span className="text-xs text-muted-foreground">Non modifiable</span>
              </div>
            </FieldRow>
            <FieldRow label="SIRET">
              <Input value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="12345678901234" className="max-w-xs" />
            </FieldRow>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border/50">
            <DisplayRow label="Nom" value={ws.nom} />
            <DisplayRow label="Type" value={<Badge variant="outline" className="capitalize">{typeLabels[ws.type_workspace] || ws.type_workspace}</Badge>} />
            <DisplayRow label="SIRET" value={ws.siret} />
            <DisplayRow label="Statut" value={
              <Badge className={ws.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>{ws.statut}</Badge>
            } />
          </div>
        )}
      </SettingsBlock>

      {/* Contact block */}
      <SettingsBlock title="Contact" icon={At}>
        {editing ? (
          <div className="space-y-4">
            <FieldRow label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@exemple.com" className="max-w-md" />
            </FieldRow>
            <FieldRow label="Téléphone">
              <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="01 23 45 67 89" className="max-w-xs" />
            </FieldRow>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border/50">
            <DisplayRow label="Email" value={ws.email} />
            <DisplayRow label="Téléphone" value={ws.telephone} />
          </div>
        )}
      </SettingsBlock>

      {/* Address block */}
      <SettingsBlock title="Adresse" icon={MapPin}>
        {editing ? (
          <div className="space-y-4">
            <FieldRow label="Adresse">
              <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="12 Rue de la Paix" className="max-w-lg" />
            </FieldRow>
            <div className="grid grid-cols-[120px_1fr] gap-3 max-w-md">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Code postal</Label>
                <Input value={codePostal} onChange={(e) => setCodePostal(e.target.value)} placeholder="75001" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ville</Label>
                <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Paris" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border/50">
            <DisplayRow label="Adresse" value={ws.adresse} />
            <DisplayRow label="Ville" value={ws.code_postal || ws.ville ? `${ws.code_postal || ''} ${ws.ville || ''}`.trim() : null} />
          </div>
        )}
      </SettingsBlock>

      {/* Branding block */}
      <SettingsBlock title="Apparence" icon={Palette}>
        {editing ? (
          <div className="space-y-4">
            <FieldRow label="Couleur primaire">
              <div className="flex items-center gap-3">
                <input type="color" value={couleurPrimaire || '#2563eb'} onChange={(e) => setCouleurPrimaire(e.target.value)} className="h-9 w-12 rounded-lg border border-border/60 cursor-pointer" />
                <Input value={couleurPrimaire} onChange={(e) => setCouleurPrimaire(e.target.value)} placeholder="#2563eb" className="max-w-[140px] font-mono text-sm" />
              </div>
            </FieldRow>
            <FieldRow label="Couleur de fond">
              <div className="flex items-center gap-3">
                <input type="color" value={couleurFond || '#f8f8f6'} onChange={(e) => setCouleurFond(e.target.value)} className="h-9 w-12 rounded-lg border border-border/60 cursor-pointer" />
                <Input value={couleurFond} onChange={(e) => setCouleurFond(e.target.value)} placeholder="Par défaut" className="max-w-[140px] font-mono text-sm" />
                {couleurFond && <button type="button" onClick={() => setCouleurFond('')} className="text-xs text-muted-foreground hover:text-destructive">Reset</button>}
              </div>
            </FieldRow>
            <FieldRow label="Logo">
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-cover border border-border/60" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-muted/30 border border-dashed border-border/60 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/15 rounded-lg cursor-pointer transition-colors">
                    Choisir un fichier
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoChange} className="hidden" />
                  </label>
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl(null)} className="text-xs text-destructive hover:text-destructive/80 text-left">
                      Supprimer le logo
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground/50">PNG, JPG, SVG ou WebP — max 512 Ko</p>
                </div>
              </div>
            </FieldRow>
            <FieldRow label="Fond d'ecran">
              <div className="flex gap-2">
                {(['plat', 'gradient', 'mesh'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFondStyle(style)}
                    className={`relative w-20 h-14 rounded-xl border-2 transition-all overflow-hidden ${fondStyle === style ? 'border-primary shadow-sm' : 'border-border/40 hover:border-border/80'}`}
                  >
                    <div className={`absolute inset-0 ${
                      style === 'plat' ? 'bg-background' :
                      style === 'gradient' ? 'bg-background bg-gradient-to-br from-primary/5 to-transparent' :
                      'bg-background bg-[radial-gradient(ellipse_at_top_left,var(--color-primary)/0.08,transparent),radial-gradient(ellipse_at_bottom_right,var(--color-primary)/0.05,transparent)]'
                    }`} />
                    <span className="relative text-[9px] font-semibold text-foreground/70 capitalize">{style}</span>
                  </button>
                ))}
              </div>
            </FieldRow>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border/50">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Couleur primaire</span>
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md border border-border/60 shadow-xs" style={{ background: ws.couleur_primaire || '#2563eb' }} />
                <span className="text-sm font-mono text-foreground/70">{ws.couleur_primaire || 'Par défaut'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Couleur de fond</span>
              <div className="flex items-center gap-2.5">
                {ws.couleur_fond ? (
                  <>
                    <div className="h-6 w-6 rounded-md border border-border/60 shadow-xs" style={{ background: ws.couleur_fond }} />
                    <span className="text-sm font-mono text-foreground/70">{ws.couleur_fond}</span>
                  </>
                ) : (
                  <span className="text-sm text-foreground/70">Par défaut</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Logo</span>
              {ws.logo_url ? (
                <img src={ws.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-border/60" />
              ) : (
                <span className="text-sm text-foreground/70">Non configuré</span>
              )}
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Fond d'écran</span>
              <span className="text-sm text-foreground/70 capitalize">{ws.fond_style || 'gradient'}</span>
            </div>
          </div>
        )}
      </SettingsBlock>

      {/* Footer meta */}
      <p className="text-xs text-muted-foreground/60 pt-2">
        Créé le {new Date(ws.created_at).toLocaleDateString('fr-FR')} — Dernière modification le {new Date(ws.updated_at).toLocaleDateString('fr-FR')}
      </p>

      <FloatingSaveBar
        visible={editing}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        saving={updateMutation.isPending}
      />
    </div>
  )
}

// ── Settings building blocks ──

function SettingsBlock({ title, icon: Icon, children }: { title: string; icon: typeof BuildingOffice; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/60">
        <div className="h-7 w-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-6">
      <Label className="text-sm text-muted-foreground w-36 pt-2 shrink-0">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function DisplayRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || <span className="text-muted-foreground/40">—</span>}</span>
    </div>
  )
}

// ── Users Section ──
function MembresSection() {
  const [subTab, setSubTab] = useState<'users' | 'invitations'>('users')
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Membres</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Gérez votre équipe et invitez de nouveaux collaborateurs</p>
      </div>
      <div className="flex items-center bg-muted/60 rounded-full p-0.5 w-fit">
        <button onClick={() => setSubTab('users')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${subTab === 'users' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          Utilisateurs
        </button>
        <button onClick={() => setSubTab('invitations')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${subTab === 'invitations' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          Invitations
        </button>
      </div>
      {subTab === 'users' && <UsersSection />}
      {subTab === 'invitations' && <InvitationsSection />}
    </div>
  )
}

function UsersSection() {
  const { data: users, isLoading } = useWorkspaceUsers()
  const { user: currentUser } = useAuth()
  const changeRole = useChangeRole()
  const setUserStatus = useSetUserStatus()
  const [confirmAction, setConfirmAction] = useState<{ user: WorkspaceUser; action: 'deactivate' | 'reactivate' } | null>(null)

  function handleRoleChange(user: WorkspaceUser, newRole: string) {
    changeRole.mutate(
      { userId: user.id, role: newRole as Role },
      {
        onSuccess: () => toast.success(`Rôle de ${user.prenom} ${user.nom} mis à jour`),
        onError: (err: any) => toast.error(err.message || 'Erreur'),
      }
    )
  }

  function handleStatusConfirm() {
    if (!confirmAction) return
    setUserStatus.mutate(
      { userId: confirmAction.user.id, est_actif: confirmAction.action === 'reactivate' },
      {
        onSuccess: () => { toast.success(confirmAction.action === 'deactivate' ? 'Membre désactivé' : 'Membre réactivé'); setConfirmAction(null) },
        onError: (err: any) => { toast.error(err.message || 'Erreur'); setConfirmAction(null) },
      }
    )
  }

  const activeCount = users?.filter(u => u.est_actif).length ?? 0

  return (
    <div className="space-y-4">
      {isLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}

      {!isLoading && users && (
        <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/60">
            <span className="text-xs font-medium text-muted-foreground">
              {activeCount} actif{activeCount !== 1 ? 's' : ''} / {users.length} au total
            </span>
          </div>

          {users.length > 0 ? (
            <div className="divide-y divide-border/40">
              {users.map((user) => {
                const rc = roleConfig[user.role]
                const isSelf = user.id === currentUser?.id
                return (
                  <div key={user.id} className={`flex items-center gap-4 px-6 py-4 transition-colors duration-150 ${user.est_actif ? 'hover:bg-primary/[0.04]' : 'opacity-40'}`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${user.est_actif ? 'bg-gradient-to-br from-primary/20 to-primary/5' : 'bg-muted/40'}`}>
                      <span className={`text-xs font-bold ${user.est_actif ? 'text-primary/70' : 'text-muted-foreground/50'}`}>{user.prenom[0]}{user.nom[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{user.prenom} {user.nom}{isSelf ? ' (vous)' : ''}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {/* Role — clickable select disguised as badge */}
                    <Select value={user.role} onValueChange={(v) => handleRoleChange(user, v)} disabled={!user.est_actif}>
                      <SelectTrigger className={`h-7 w-auto gap-1 px-2.5 rounded-full border text-[10px] font-semibold ${rc.bg} ${rc.color} ${rc.border}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> {roleConfig[r].label} <span className="text-muted-foreground/50">— {roleConfig[r].description}</span></span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Statut badge */}
                    <Badge className={user.est_actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]' : 'bg-zinc-100 text-zinc-500 border-zinc-200 text-[10px]'}>{user.est_actif ? 'Actif' : 'Inactif'}</Badge>
                    {/* Action */}
                    {user.est_actif ? (
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50" disabled={isSelf} onClick={() => setConfirmAction({ user, action: 'deactivate' })}>
                        Désactiver
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => setConfirmAction({ user, action: 'reactivate' })}>
                        Réactiver
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={UsersThree} message="Aucun membre dans ce workspace" />
          )}
        </div>
      )}

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
          title={confirmAction.action === 'deactivate' ? `Désactiver ${confirmAction.user.prenom} ${confirmAction.user.nom} ?` : `Réactiver ${confirmAction.user.prenom} ${confirmAction.user.nom} ?`}
          description={confirmAction.action === 'deactivate' ? 'Cet utilisateur perdra l\'accès à ce workspace. Les données passées sont conservées.' : 'Cet utilisateur retrouvera l\'accès à ce workspace.'}
          confirmLabel={confirmAction.action === 'deactivate' ? 'Désactiver' : 'Réactiver'}
          variant={confirmAction.action === 'deactivate' ? 'destructive' : 'default'}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  )
}

// ── Invitations Section ──
function InvitationsSection() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('gestionnaire')
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'expired'>('all')
  const { data: invitations, isLoading } = useInvitations()
  const sendInvitation = useSendInvitation()
  const resendInvitation = useResendInvitation()
  const cancelInvitation = useCancelInvitation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) { toast.error('Email requis'); return }
    sendInvitation.mutate(
      { email: trimmed, role },
      {
        onSuccess: () => { toast.success(`Invitation envoyée à ${trimmed}`); setEmail(''); setRole('gestionnaire') },
        onError: (err: any) => toast.error(err.message || "Erreur d'envoi"),
      }
    )
  }

  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/register/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copié')
  }

  const filtered = (invitations || []).filter(inv => {
    const isExpired = !inv.accepted_at && new Date(inv.expires_at) < new Date()
    const isAccepted = !!inv.accepted_at
    if (filter === 'pending') return !isAccepted && !isExpired
    if (filter === 'accepted') return isAccepted
    if (filter === 'expired') return isExpired
    return true
  })

  const counts = {
    all: invitations?.length ?? 0,
    pending: (invitations || []).filter(i => !i.accepted_at && new Date(i.expires_at) >= new Date()).length,
    accepted: (invitations || []).filter(i => !!i.accepted_at).length,
    expired: (invitations || []).filter(i => !i.accepted_at && new Date(i.expires_at) < new Date()).length,
  }

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'accepted', label: 'Acceptées' },
    { key: 'expired', label: 'Expirées' },
  ]

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/60">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Nouvelle invitation</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Adresse email</Label>
              <Input type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="w-44 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{roleConfig[r].label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={sendInvitation.isPending}>
              {sendInvitation.isPending ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <PaperPlaneTilt className="h-4 w-4 mr-1.5" />}
              Envoyer
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-3">L'invitation expire automatiquement après 7 jours.</p>
        </form>
      </div>

      {/* Invitations list */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/60">
          <span className="text-xs font-medium text-muted-foreground">Historique</span>
          <div className="flex items-center bg-card border border-border/60 rounded-xl p-1 text-xs">
            {filters.map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  filter === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {label}
                {counts[key] > 0 && <span className="text-muted-foreground/50 ml-1">{counts[key]}</span>}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="p-6 space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded" />)}</div>}

        {!isLoading && filtered.length === 0 && (
          <EmptyState icon={Envelope} message="Aucune invitation" />
        )}

        {filtered.length > 0 && (
          <div className="divide-y divide-border/40">
            {filtered.map((inv) => {
              const rc = roleConfig[inv.role as Role] || roleConfig.gestionnaire
              const isExpired = !inv.accepted_at && new Date(inv.expires_at) < new Date()
              const isAccepted = !!inv.accepted_at
              const isPending = !isAccepted && !isExpired

              return (
                <div key={inv.id} className="flex items-center gap-3 px-6 py-4 hover:bg-primary/[0.04] transition-colors duration-150">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAccepted ? 'bg-emerald-50 ring-1 ring-emerald-200' : isExpired ? 'bg-red-50 ring-1 ring-red-200' : 'bg-primary/5 ring-1 ring-primary/20'
                  }`}>
                    {isAccepted ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : isExpired ? <WarningCircle className="h-4 w-4 text-red-400" /> : <Clock className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                      {inv.invited_by_nom && ` — par ${inv.invited_by_prenom} ${inv.invited_by_nom}`}
                      {isPending && ` — expire le ${new Date(inv.expires_at).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <Badge className={`${rc.bg} ${rc.color} ${rc.border} text-[10px]`}>{rc.label}</Badge>
                  <Badge variant={isAccepted ? 'default' : isExpired ? 'destructive' : 'outline'} className="text-[10px]">
                    {isAccepted ? 'Acceptée' : isExpired ? 'Expirée' : 'En attente'}
                  </Badge>
                  <div className="flex items-center gap-1 shrink-0">
                    {isPending && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => copyInviteLink(inv.token)}><Copy className="h-3 w-3 mr-1" /> Lien</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => resendInvitation.mutate(inv.id, { onSuccess: () => toast.success('Relance envoyée') })}><PaperPlaneTilt className="h-3 w-3 mr-1" /> Relancer</Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => cancelInvitation.mutate(inv.id, { onSuccess: () => toast.success('Annulée') })}><X className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                    {isExpired && !isPending && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => resendInvitation.mutate(inv.id, { onSuccess: () => toast.success('Relance envoyée') })}><PaperPlaneTilt className="h-3 w-3 mr-1" /> Relancer</Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => cancelInvitation.mutate(inv.id, { onSuccess: () => toast.success('Annulée') })}><X className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared ──
function EmptyState({ icon: Icon, message }: { icon: typeof Envelope; message: string }) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}

// ── API Section ──

const WEBHOOK_EVENTS: { value: WebhookEvent; label: string; description: string }[] = [
  { value: 'mission.creee', label: 'Mission créée', description: 'Nouvelle mission planifiée' },
  { value: 'mission.assignee', label: 'Mission assignée', description: 'Technicien accepte la mission' },
  { value: 'mission.terminee', label: 'Mission terminée', description: 'Tous les EDL sont signés' },
  { value: 'mission.annulee', label: 'Mission annulée', description: 'Mission annulée par un admin' },
  { value: 'edl.signe', label: 'EDL signé', description: 'Document légal signé' },
  { value: 'edl.infructueux', label: 'EDL infructueux', description: 'EDL marqué infructueux' },
  { value: 'cle.deposee', label: 'Clé déposée', description: 'Clé déposée au lieu convenu' },
]

const SCOPE_CONFIG = {
  read: { label: 'Lecture', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  write: { label: 'Lecture + Écriture', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
} as const

function ApiSection() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-foreground">API & Intégrations</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Gérez vos clés API et configurez les webhooks</p>
      </div>
      <ApiDocsBlock />
      <ApiKeysBlock />
      <WebhooksBlock />
    </div>
  )
}

function ApiDocsBlock() {
  return (
    <SettingsBlock title="Documentation interactive" icon={Code}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-sm text-foreground">
            Explorez tous les endpoints disponibles, testez des requêtes en direct et consultez les schémas de données.
          </p>
          <p className="text-xs text-muted-foreground">
            Authentification par clé API (<code className="font-mono bg-muted/60 px-1 py-0.5 rounded">Bearer imk_live_...</code>).
            Rate limit : 100 req/min.
          </p>
        </div>
        <a
          href="/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <ArrowSquareOut className="h-4 w-4" />
          Ouvrir Swagger UI
        </a>
      </div>
    </SettingsBlock>
  )
}

function ApiKeysBlock() {
  const { data: keys = [], isLoading } = useApiKeys()
  const createKey = useCreateApiKey()
  const revokeKey = useRevokeApiKey()

  const [showCreate, setShowCreate] = useState(false)
  const [newKeyResult, setNewKeyResult] = useState<CreateApiKeyResult | null>(null)
  const [name, setName] = useState('')
  const [scope, setScope] = useState<'read' | 'write'>('write')
  const [showKey, setShowKey] = useState(false)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createKey.mutate({ name: name.trim(), scope }, {
      onSuccess: (result) => {
        setShowCreate(false)
        setName('')
        setScope('write')
        setNewKeyResult(result)
        setShowKey(false)
      },
      onError: (err: any) => toast.error(err.message || 'Erreur lors de la création'),
    })
  }

  function handleRevoke(key: ApiKey) {
    revokeKey.mutate(key.id, {
      onSuccess: () => toast.success(`Clé "${key.name}" révoquée`),
      onError: () => toast.error('Erreur lors de la révocation'),
    })
  }

  function copyKey(value: string) {
    navigator.clipboard.writeText(value)
    toast.success('Clé copiée dans le presse-papier')
  }

  return (
    <SettingsBlock title="Clés API" icon={Key}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Créez des clés pour accéder à l'API publique ImmoChecker depuis vos intégrations.
            <br />Format : <code className="text-[11px] font-mono bg-muted/60 px-1 py-0.5 rounded">imk_live_...</code>
          </p>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)} variant={showCreate ? 'outline' : 'default'}>
            {showCreate ? <X className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
            {showCreate ? 'Annuler' : 'Nouvelle clé'}
          </Button>
        </div>

        {/* New key revealed once */}
        {newKeyResult && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Warning className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Copiez votre clé maintenant</p>
                <p className="text-xs text-amber-700 mt-0.5">Elle ne sera plus visible après fermeture de cet encadré.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-card border border-amber-200 rounded-lg px-3 py-2.5 text-amber-900 select-all break-all">
                {showKey ? newKeyResult.key : newKeyResult.key.slice(0, 12) + '••••••••••••••••••••••••'}
              </code>
              <button type="button" onClick={() => setShowKey(v => !v)} className="p-2 text-amber-600 hover:text-amber-800 transition-colors">
                {showKey ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Button size="sm" variant="outline" onClick={() => copyKey(newKeyResult.key)} className="border-amber-300 text-amber-800 hover:bg-amber-100">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copier
              </Button>
            </div>
            <button type="button" onClick={() => setNewKeyResult(null)} className="text-xs text-amber-600 hover:text-amber-800 underline">
              J'ai copié ma clé — fermer
            </button>
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Nouvelle clé API</h4>
            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nom de la clé</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Intégration n8n, Import CSV..." required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Portée</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as 'read' | 'write')}>
                  <SelectTrigger className="w-52 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read" className="text-xs">Lecture seule</SelectItem>
                    <SelectItem value="write" className="text-xs">Lecture + Écriture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Annuler</Button>
              <Button type="submit" size="sm" disabled={createKey.isPending || !name.trim()}>
                {createKey.isPending ? <SpinnerGap className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Key className="h-3.5 w-3.5 mr-1.5" />}
                Créer la clé
              </Button>
            </div>
          </form>
        )}

        {/* Keys list */}
        {isLoading && <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>}

        {!isLoading && keys.length === 0 && !showCreate && (
          <div className="py-10 text-center text-sm text-muted-foreground">Aucune clé API créée</div>
        )}

        {keys.length > 0 && (
          <div className="divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden">
            {keys.map((k) => {
              const sc = SCOPE_CONFIG[k.scope]
              return (
                <div key={k.id} className={`flex items-center gap-3 px-4 py-3.5 ${!k.est_active ? 'opacity-50' : 'hover:bg-muted/20'} transition-colors`}>
                  <div className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                    <Key className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{k.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {k.key_prefix}••••••••••••••••
                      {k.last_used_at && <span className="font-sans ml-2">— utilisée le {new Date(k.last_used_at).toLocaleDateString('fr-FR')}</span>}
                    </p>
                  </div>
                  <Badge className={`${sc.bg} ${sc.color} ${sc.border} text-[10px] shrink-0`}>{sc.label}</Badge>
                  {!k.est_active && <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">Révoquée</Badge>}
                  {k.est_active && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleRevoke(k)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SettingsBlock>
  )
}

function WebhooksBlock() {
  const { data: webhooks = [], isLoading } = useWebhooks()
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()
  const updateWebhook = useUpdateWebhook()

  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [showSecret, setShowSecret] = useState(false)

  const { data: deliveries = [] } = useWebhookDeliveries(expandedId)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    createWebhook.mutate({ url: url.trim(), secret: secret.trim(), events }, {
      onSuccess: () => {
        setShowCreate(false)
        setUrl(''); setSecret(''); setEvents([])
        toast.success('Webhook créé')
      },
      onError: (err: any) => toast.error(err.message || 'Erreur'),
    })
  }

  function toggleEvent(ev: WebhookEvent) {
    setEvents(prev => prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev])
  }

  function handleTest(id: string) {
    testWebhook.mutate(id, {
      onSuccess: () => toast.success('Événement test envoyé'),
      onError: () => toast.error('Erreur lors du test'),
    })
  }

  function handleDelete(wh: WebhookConfig) {
    deleteWebhook.mutate(wh.id, {
      onSuccess: () => toast.success('Webhook supprimé'),
      onError: () => toast.error('Erreur'),
    })
  }

  function handleToggleActive(wh: WebhookConfig) {
    updateWebhook.mutate({ id: wh.id, est_active: !wh.est_active }, {
      onSuccess: () => toast.success(wh.est_active ? 'Webhook désactivé' : 'Webhook activé'),
    })
  }

  const deliveryStatut: Record<string, { label: string; color: string }> = {
    success: { label: 'Succès', color: 'text-emerald-600' },
    failed: { label: 'Échec', color: 'text-red-500' },
    retrying: { label: 'Relance...', color: 'text-amber-500' },
    pending: { label: 'En attente', color: 'text-muted-foreground' },
  }

  return (
    <SettingsBlock title="Webhooks" icon={Bell}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Recevez des notifications HTTP lors d'événements dans ImmoChecker.
            <br />Signature HMAC-SHA256 dans l'en-tête <code className="text-[11px] font-mono bg-muted/60 px-1 py-0.5 rounded">X-ImmoChecker-Signature</code>.
          </p>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)} variant={showCreate ? 'outline' : 'default'}>
            {showCreate ? <X className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
            {showCreate ? 'Annuler' : 'Nouveau webhook'}
          </Button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Nouveau webhook</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">URL de destination</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://exemple.com/webhook" type="url" required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Secret de signature (optionnel)</Label>
                <div className="relative">
                  <Input value={secret} onChange={(e) => setSecret(e.target.value)}
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Secret pour vérifier la signature HMAC"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowSecret(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSecret ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Événements à écouter</Label>
                <div className="grid grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map((ev) => (
                    <label key={ev.value} className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      events.includes(ev.value) ? 'border-primary/40 bg-primary/5' : 'border-border/60 hover:border-border bg-card'
                    }`}>
                      <input type="checkbox" checked={events.includes(ev.value)} onChange={() => toggleEvent(ev.value)}
                        className="mt-0.5 accent-primary" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{ev.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ev.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Annuler</Button>
              <Button type="submit" size="sm" disabled={createWebhook.isPending || !url.trim()}>
                {createWebhook.isPending ? <SpinnerGap className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <LinkSimple className="h-3.5 w-3.5 mr-1.5" />}
                Créer le webhook
              </Button>
            </div>
          </form>
        )}

        {/* Webhooks list */}
        {isLoading && <div className="space-y-2">{[1].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}

        {!isLoading && webhooks.length === 0 && !showCreate && (
          <div className="py-10 text-center text-sm text-muted-foreground">Aucun webhook configuré</div>
        )}

        {webhooks.length > 0 && (
          <div className="divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden">
            {webhooks.map((wh) => (
              <div key={wh.id}>
                <div className={`flex items-center gap-3 px-4 py-3.5 ${!wh.est_active ? 'opacity-60' : 'hover:bg-muted/20'} transition-colors`}>
                  <div className={`h-2 w-2 rounded-full shrink-0 ${wh.est_active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{wh.url}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {wh.events.length === 0 ? 'Aucun événement' : wh.events.length === WEBHOOK_EVENTS.length ? 'Tous les événements' : `${wh.events.length} événement${wh.events.length > 1 ? 's' : ''}`}
                      {wh.total_deliveries != null && <span className="ml-2">— {wh.success_deliveries ?? 0}/{wh.total_deliveries} succès</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setExpandedId(expandedId === wh.id ? null : wh.id)}>
                      <ArrowClockwise className="h-3.5 w-3.5 mr-1" />
                      Logs
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary"
                      onClick={() => handleTest(wh.id)} disabled={testWebhook.isPending}>
                      Test
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleToggleActive(wh)}>
                      {wh.est_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(wh)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Delivery log */}
                {expandedId === wh.id && (
                  <div className="border-t border-border/50 bg-surface-sunken px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Dernières livraisons</p>
                    {deliveries.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">Aucune livraison</p>
                    ) : (
                      <div className="space-y-1.5">
                        {deliveries.slice(0, 10).map((d) => {
                          const ds = deliveryStatut[d.statut] || deliveryStatut.pending
                          return (
                            <div key={d.id} className="flex items-center gap-2 text-xs">
                              <span className={`font-medium w-16 shrink-0 ${ds.color}`}>{ds.label}</span>
                              <code className="font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded text-[10px]">{d.event_type}</code>
                              {d.response_code && <span className="text-muted-foreground">{d.response_code}</span>}
                              <span className="text-muted-foreground/50 ml-auto text-[10px]">
                                {d.last_attempt_at ? new Date(d.last_attempt_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SettingsBlock>
  )
}
