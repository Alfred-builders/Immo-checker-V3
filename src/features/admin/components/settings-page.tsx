import { useState } from 'react'
import { UsersThree, Envelope, PaperPlaneTilt, SpinnerGap, Shield, BuildingOffice, UserPlus, Clock, CheckCircle, WarningCircle, Copy, X, FloppyDisk, MapPin, Phone, At, Hash, Palette, CaretRight, Globe, GridFour, BookOpen, Sliders } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../hooks/use-auth'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Skeleton } from 'src/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { useWorkspaceDetails, useUpdateWorkspace, useWorkspaceUsers, useInvitations, useSendInvitation, useChangeRole, useResendInvitation, useCancelInvitation } from '../api'
import type { WorkspaceUser, Invitation } from '../api'

const ROLES = ['admin', 'gestionnaire', 'technicien'] as const
type Role = (typeof ROLES)[number]

const roleConfig: Record<Role, { label: string; color: string; bg: string; border: string; description: string; icon: string }> = {
  admin: { label: 'Admin', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', description: 'Acces complet', icon: '🔴' },
  gestionnaire: { label: 'Gestionnaire', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', description: 'Back-office', icon: '🔵' },
  technicien: { label: 'Technicien', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'App mobile', icon: '🟢' },
}

const typeLabels: Record<string, string> = {
  societe_edl: 'Société EDL', bailleur: 'Bailleur', agence: 'Agence immobilière',
}

type Section = 'general' | 'users' | 'invitations'

const NAV_ITEMS: { key: Section; label: string; icon: typeof BuildingOffice; description: string }[] = [
  { key: 'general', label: 'General', icon: BuildingOffice, description: 'Informations du workspace' },
  { key: 'users', label: 'Membres', icon: UsersThree, description: 'Gérer les utilisateurs' },
  { key: 'invitations', label: 'Invitations', icon: Envelope, description: 'Inviter des collaborateurs' },
]

const NAV_LINKS: { label: string; icon: typeof BuildingOffice; href: string; description: string }[] = [
  { label: 'Templates', icon: GridFour, href: '/app/parametres/templates', description: 'Types de pieces' },
  { label: 'Catalogue', icon: BookOpen, href: '/app/parametres/catalogue', description: 'Items EDL/Inventaire' },
  { label: 'Critères', icon: Sliders, href: '/app/parametres/critères', description: 'Niveaux d\'exigence' },
]

export function SettingsPage() {
  const [section, setSection] = useState<Section>('general')
  const navigate = useNavigate()

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurez votre workspace et gerez votre equipe</p>
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

            {/* EPIC 4 sub-pages */}
            <div className="pt-4 mt-4 border-t border-border/60">
              <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">Configuration EDL</p>
              {NAV_LINKS.map(({ label, icon: Icon, href }) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {section === 'general' && <GeneralSection />}
          {section === 'users' && <UsersSection />}
          {section === 'invitations' && <InvitationsSection />}
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
    setEditing(true)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512 * 1024) {
      toast.error('Le logo ne doit pas depasser 512 Ko')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setLogoUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        nom, siret: siret || null, email: email || null, telephone: telephone || null,
        adresse: adresse || null, code_postal: codePostal || null, ville: ville || null,
        couleur_primaire: couleurPrimaire || null,
        logo_url: logoUrl || null,
      } as any)
      await refreshWorkspace()
      toast.success('Workspace mis a jour')
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
        {!editing ? (
          <Button variant="outline" size="sm" onClick={startEdit}>Modifier</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <SpinnerGap className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FloppyDisk className="h-3.5 w-3.5 mr-1.5" />}
              Enregistrer
            </Button>
          </div>
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
            <FieldRow label="Telephone">
              <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="01 23 45 67 89" className="max-w-xs" />
            </FieldRow>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border/50">
            <DisplayRow label="Email" value={ws.email} />
            <DisplayRow label="Telephone" value={ws.telephone} />
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
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border/50">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Couleur primaire</span>
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md border border-border/60 shadow-xs" style={{ background: ws.couleur_primaire || '#2563eb' }} />
                <span className="text-sm font-mono text-foreground/70">{ws.couleur_primaire || 'Par defaut'}</span>
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
          </div>
        )}
      </SettingsBlock>

      {/* Footer meta */}
      <p className="text-xs text-muted-foreground/60 pt-2">
        Créé le {new Date(ws.created_at).toLocaleDateString('fr-FR')} — Dernière modification le {new Date(ws.updated_at).toLocaleDateString('fr-FR')}
      </p>
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
function UsersSection() {
  const { data: users, isLoading } = useWorkspaceUsers()
  const changeRole = useChangeRole()

  function handleRoleChange(user: WorkspaceUser, newRole: string) {
    changeRole.mutate(
      { userId: user.id, role: newRole as Role },
      {
        onSuccess: () => toast.success(`Role de ${user.prenom} ${user.nom} mis a jour`),
        onError: () => toast.error('Erreur'),
      }
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Membres</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Gérez les utilisateurs et leurs permissions</p>
      </div>

      {isLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}

      {!isLoading && users && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/60">
            <span className="text-xs font-medium text-muted-foreground">
              {users.length} membre{users.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* User rows */}
          {users.length > 0 ? (
            <div className="divide-y divide-border/40">
              {users.map((user) => {
                const rc = roleConfig[user.role]
                return (
                  <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors duration-200">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary/70">{user.prenom[0]}{user.nom[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{user.prenom} {user.nom}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge className={`${rc.bg} ${rc.color} ${rc.border} text-[10px]`}>{rc.label}</Badge>
                    <Select value={user.role} onValueChange={(v) => handleRoleChange(user, v)}>
                      <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" /> {roleConfig[r].label}
                              <span className="text-muted-foreground text-[10px]">— {roleConfig[r].description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={UsersThree} message="Aucun membre dans ce workspace" />
          )}
        </div>
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
        onSuccess: () => { toast.success(`Invitation envoyee a ${trimmed}`); setEmail(''); setRole('gestionnaire') },
        onError: (err: any) => toast.error(err.message || "Erreur d'envoi"),
      }
    )
  }

  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/register/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copie')
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
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Invitations</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Invitez de nouveaux membres dans votre workspace</p>
      </div>

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
              <Label className="text-xs text-muted-foreground">Role</Label>
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
          <p className="text-xs text-muted-foreground/60 mt-3">L'invitation expire automatiquement apres 7 jours.</p>
        </form>
      </div>

      {/* Invitations list */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised overflow-hidden">
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
                <div key={inv.id} className="flex items-center gap-3 px-6 py-4 hover:bg-accent/50 transition-colors duration-200">
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
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => resendInvitation.mutate(inv.id, { onSuccess: () => toast.success('Relance envoyee') })}><PaperPlaneTilt className="h-3 w-3 mr-1" /> Relancer</Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => cancelInvitation.mutate(inv.id, { onSuccess: () => toast.success('Annulée') })}><X className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                    {isExpired && !isPending && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => resendInvitation.mutate(inv.id, { onSuccess: () => toast.success('Relance envoyee') })}><PaperPlaneTilt className="h-3 w-3 mr-1" /> Relancer</Button>
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
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/60 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}
