import { useEffect, useRef, useState } from 'react'
import { Envelope, ArrowCounterClockwise, Check, Eye, FloppyDisk, Plus, SpinnerGap } from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import {
  useEmailTemplates,
  useEmailTemplate,
  useUpdateEmailTemplate,
  useResetEmailTemplate,
  previewEmailTemplate,
  type EmailTemplateListItem,
  type EmailTemplatePreview,
} from '../email-templates-api'
import { RichTextEditor, type RichTextEditorHandle } from './rich-text-editor'
import { ConfirmDialog } from 'src/components/shared/confirm-dialog'
import { toast } from 'sonner'
import { cn } from 'src/lib/cn'

export function EmailsSection() {
  const { data: list, isLoading } = useEmailTemplates()
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  // Sélectionne le 1er template par défaut au chargement.
  useEffect(() => {
    if (!selectedCode && list && list.length > 0) setSelectedCode(list[0].code)
  }, [list, selectedCode])

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      <div className="px-6 py-5 border-b border-border/40">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Envelope className="h-5 w-5 text-muted-foreground" weight="duotone" />
          Modèles d'emails
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Personnalise les emails transactionnels envoyés aux locataires et techniciens. Les <code className="bg-muted/50 rounded px-1 py-0.5 font-mono text-[11px]">{'{{variables}}'}</code> sont substituées au moment de l'envoi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[500px]">
        {/* Liste des templates à gauche */}
        <aside className="border-b md:border-b-0 md:border-r border-border/40 bg-sunken/30">
          {isLoading && (
            <div className="p-4 text-xs text-muted-foreground">Chargement…</div>
          )}
          {list && list.length > 0 && (
            <ul className="divide-y divide-border/30">
              {list.map((t) => (
                <li key={t.code}>
                  <button
                    type="button"
                    onClick={() => setSelectedCode(t.code)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors',
                      selectedCode === t.code && 'bg-primary/[0.05] border-l-2 border-l-primary',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] font-semibold text-foreground truncate">{t.label}</div>
                      {t.is_custom && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">Personnalisé</span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.description}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Editeur à droite */}
        <div className="flex flex-col">
          {selectedCode ? (
            <TemplateEditor code={selectedCode} listItem={list?.find((t) => t.code === selectedCode)} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Sélectionne un modèle à éditer
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TemplateEditor({ code, listItem }: { code: string; listItem?: EmailTemplateListItem }) {
  const { data: detail, isLoading } = useEmailTemplate(code)
  const updateMut = useUpdateEmailTemplate()
  const resetMut = useResetEmailTemplate()
  const editorRef = useRef<RichTextEditorHandle>(null)

  const [sujet, setSujet] = useState('')
  const [body, setBody] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<EmailTemplatePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Sync detail → form quand on change de template
  useEffect(() => {
    if (detail) {
      setSujet(detail.sujet)
      setBody(detail.body_html)
      setShowPreview(false)
    }
  }, [detail])

  const isDirty = !!detail && (sujet !== detail.sujet || body !== detail.body_html)

  async function handleSave() {
    try {
      await updateMut.mutateAsync({ code, sujet, body_html: body })
      toast.success('Modèle enregistré')
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'enregistrement')
    }
  }

  async function handleReset() {
    try {
      await resetMut.mutateAsync(code)
      setShowResetConfirm(false)
      toast.success('Modèle réinitialisé au texte par défaut')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  async function handlePreview() {
    setPreviewLoading(true)
    try {
      const out = await previewEmailTemplate(code, { draft_sujet: sujet, draft_body_html: body })
      setPreviewData(out)
      setShowPreview(true)
    } catch (err: any) {
      toast.error(err.message || 'Erreur de prévisualisation')
    } finally {
      setPreviewLoading(false)
    }
  }

  function handleInsertVariable(name: string) {
    editorRef.current?.insertText(`{{${name}}}`)
  }

  if (isLoading || !detail) {
    return <div className="flex-1 p-6 text-sm text-muted-foreground">Chargement…</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40 flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground">{detail.label}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{detail.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {listItem?.is_custom && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              disabled={resetMut.isPending}
              className="text-muted-foreground hover:text-destructive"
            >
              <ArrowCounterClockwise className="h-3.5 w-3.5" /> Réinitialiser
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePreview} disabled={previewLoading}>
            {previewLoading ? <SpinnerGap className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
            Aperçu
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!isDirty || updateMut.isPending}>
            {updateMut.isPending ? <SpinnerGap className="h-3.5 w-3.5 animate-spin" /> : <FloppyDisk className="h-3.5 w-3.5" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Contenu : éditeur (ou aperçu si toggle) + variables sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-0 flex-1 min-h-0">
        {/* Zone éditeur / aperçu */}
        <div className="p-6 space-y-4 min-w-0 overflow-y-auto">
          {!showPreview ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Objet</Label>
                <Input
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder="Sujet de l'email"
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">Tu peux insérer des variables {`{{xxx}}`} dans le sujet.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Contenu du message</Label>
                <RichTextEditor ref={editorRef} value={body} onChange={setBody} className="min-h-[320px]" />
                <p className="text-[11px] text-muted-foreground">
                  Header (logo ImmoChecker) et footer (mentions légales) sont ajoutés automatiquement à l'envoi.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Aperçu — valeurs de démo</Label>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-[11px] text-primary hover:text-primary/80 font-semibold"
                >
                  ← Retour à l'édition
                </button>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-1">Objet</p>
                <p className="text-[14px] font-semibold text-foreground">{previewData?.sujet}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
                <div className="bg-sunken/40 px-4 py-2 border-b border-border/40">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Corps du message</span>
                </div>
                <div
                  className="px-4 py-4 prose prose-sm max-w-none [&_p]:my-2 [&_a]:text-primary"
                  dangerouslySetInnerHTML={{ __html: previewData?.body_html ?? '' }}
                />
              </div>
            </>
          )}
        </div>

        {/* Sidebar variables */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border/40 bg-sunken/20 p-5 overflow-y-auto">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Variables disponibles</p>
          <ul className="space-y-1.5">
            {detail.variables.map((v) => (
              <li key={v.name}>
                <button
                  type="button"
                  onClick={() => handleInsertVariable(v.name)}
                  disabled={showPreview}
                  className={cn(
                    'w-full text-left rounded-md px-2.5 py-1.5 transition-colors',
                    showPreview ? 'opacity-40 cursor-not-allowed' : 'hover:bg-card',
                  )}
                  title={`Insérer {{${v.name}}}`}
                >
                  <div className="flex items-center gap-1.5">
                    <Plus className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <code className="text-[11.5px] font-mono font-semibold text-primary">{`{{${v.name}}}`}</code>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground/70 mt-0.5 ml-4 leading-tight">{v.description}</p>
                  <p className="text-[10.5px] text-muted-foreground/50 ml-4 italic">Ex : {v.example}</p>
                </button>
              </li>
            ))}
          </ul>

          {detail.source === 'workspace' && (
            <div className="mt-5 pt-5 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <Check className="h-3 w-3" weight="bold" />
                <span className="font-semibold">Modèle personnalisé actif</span>
              </div>
              <p className="text-[10.5px] text-muted-foreground/70 mt-1 leading-tight">
                Ce template écrase la version par défaut. Clique sur « Réinitialiser » pour revenir au texte standard.
              </p>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Réinitialiser ce modèle ?"
        description="La version personnalisée sera supprimée et l'email reviendra au texte par défaut. Cette action est irréversible — pense à copier ton contenu si besoin."
        confirmLabel={resetMut.isPending ? 'Réinitialisation…' : 'Réinitialiser'}
        cancelLabel="Annuler"
        variant="destructive"
        onConfirm={handleReset}
      />
    </div>
  )
}
