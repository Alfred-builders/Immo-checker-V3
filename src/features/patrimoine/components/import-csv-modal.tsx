import { useState, useCallback } from 'react'
import { UploadSimple, FileXls, ArrowRight, Check, WarningCircle, X, SpinnerGap } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Separator } from 'src/components/ui/separator'
import { toast } from 'sonner'
import { api } from 'src/lib/api-client'

// ImmoChecker target fields
const BATIMENT_FIELDS = [
  { id: 'designation', label: 'Désignation', required: true },
  { id: 'type', label: 'Type (immeuble/maison/local_commercial/mixte)', required: true },
  { id: 'rue', label: 'Adresse — Rue', required: true },
  { id: 'code_postal', label: 'Code postal', required: true },
  { id: 'ville', label: 'Ville', required: true },
  { id: 'complement', label: 'Complement adresse', required: false },
  { id: 'num_batiment', label: 'N batiment', required: false },
  { id: 'nb_etages', label: 'Nombre etages', required: false },
  { id: 'annee_construction', label: 'Année construction', required: false },
  { id: 'commentaire', label: 'Commentaire', required: false },
]

const LOT_FIELDS = [
  { id: 'designation', label: 'Désignation lot', required: true },
  { id: 'type_bien', label: 'Type de bien', required: true },
  { id: 'etage', label: 'Étage', required: false },
  { id: 'emplacement_palier', label: 'Emplacement palier', required: false },
  { id: 'surface', label: 'Surface (m2)', required: false },
  { id: 'nb_pieces', label: 'Nombre de pieces', required: false },
  { id: 'meuble', label: 'Meuble (oui/non)', required: false },
  { id: 'reference_interne', label: 'Reference interne', required: false },
  { id: 'dpe_classe', label: 'DPE (A-G)', required: false },
  { id: 'ges_classe', label: 'GES (A-G)', required: false },
  { id: 'num_cave', label: 'N cave', required: false },
  { id: 'num_parking', label: 'N parking', required: false },
  { id: 'commentaire', label: 'Commentaire', required: false },
]

const SKIP_VALUE = '__skip__'

type ImportType = 'batiments' | 'lots'
type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'done'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported?: () => void
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }

  // Detect separator (comma, semicolon, tab)
  const firstLine = lines[0]
  const sep = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ','

  const parseRow = (line: string) => {
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === sep && !inQuotes) { cells.push(current.trim()); current = ''; continue }
      current += ch
    }
    cells.push(current.trim())
    return cells
  }

  const headers = parseRow(lines[0])
  const rows = lines.slice(1).map(parseRow).filter(r => r.some(c => c))
  return { headers, rows }
}

function autoMatch(csvHeader: string, targetFields: { id: string; label: string }[]): string {
  const h = csvHeader.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')

  const aliases: Record<string, string[]> = {
    designation: ['designation', 'nom', 'name', 'libelle', 'intitule'],
    type: ['type', 'typebatiment', 'typebien', 'typebien'],
    type_bien: ['typebien', 'type', 'typedelogement', 'naturelogement'],
    rue: ['rue', 'adresse', 'address', 'voie', 'libellerue'],
    code_postal: ['codepostal', 'cp', 'zipcode', 'zip'],
    ville: ['ville', 'city', 'commune', 'localite'],
    complement: ['complement', 'complementadresse', 'batiment', 'residence'],
    num_batiment: ['numbatiment', 'nbatiment', 'batiment', 'escalier'],
    nb_etages: ['nbetages', 'etages', 'nombreetages', 'niveaux'],
    annee_construction: ['anneeconstruction', 'annee', 'construction', 'dateconst'],
    etage: ['etage', 'niveau', 'floor'],
    surface: ['surface', 'superficie', 'm2', 'surfacehabitable'],
    nb_pieces: ['nbpieces', 'pieces', 'nbchambres', 'typologiepieces', 'nombre de pièces'],
    meuble: ['meuble', 'furnished', 'ameuble'],
    reference_interne: ['reference', 'ref', 'refbail', 'bail', 'refcadastrale'],
    dpe_classe: ['dpe', 'classedpe', 'diagnosticdpe'],
    ges_classe: ['ges', 'classeges'],
    num_cave: ['cave', 'numcave', 'numerocave'],
    num_parking: ['parking', 'numparking', 'numeroparking'],
    emplacement_palier: ['emplacement', 'palier', 'porte', 'emplacementpalier'],
    commentaire: ['commentaire', 'comment', 'note', 'notes', 'observation'],
  }

  for (const field of targetFields) {
    const fieldAliases = aliases[field.id] || [field.id]
    if (fieldAliases.some(a => h.includes(a) || a.includes(h))) {
      return field.id
    }
  }
  return SKIP_VALUE
}

export function ImportCSVModal({ open, onOpenChange, onImported }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [importType, setImportType] = useState<ImportType>('batiments')
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][] }>({ headers: [], rows: [] })
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [results, setResults] = useState<{ success: number; errors: string[] }>({ success: 0, errors: [] })
  const [importing, setImporting] = useState(false)

  const targetFields = importType === 'batiments' ? BATIMENT_FIELDS : LOT_FIELDS

  function reset() {
    setStep('upload')
    setCsvData({ headers: [], rows: [] })
    setMapping({})
    setResults({ success: 0, errors: [] })
    setImporting(false)
  }

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.headers.length === 0) {
        toast.error('Fichier CSV vide ou invalide')
        return
      }
      setCsvData(parsed)

      // Auto-match columns
      const autoMapping: Record<string, string> = {}
      for (const csvCol of parsed.headers) {
        autoMapping[csvCol] = autoMatch(csvCol, targetFields)
      }
      setMapping(autoMapping)
      setStep('mapping')
    }
    reader.readAsText(file, 'UTF-8')
  }, [targetFields])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      handleFile(file)
    } else {
      toast.error('Fichier CSV uniquement')
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  // Check required fields are mapped
  const requiredFields = targetFields.filter(f => f.required)
  const mappedRequired = requiredFields.filter(f => Object.values(mapping).includes(f.id))
  const allRequiredMapped = mappedRequired.length === requiredFields.length

  async function handleImport() {
    setImporting(true)
    setStep('importing')
    let success = 0
    const errors: string[] = []

    for (let i = 0; i < csvData.rows.length; i++) {
      const row = csvData.rows[i]
      try {
        const data: Record<string, unknown> = {}
        for (const [csvCol, targetField] of Object.entries(mapping)) {
          if (targetField === SKIP_VALUE) continue
          const colIndex = csvData.headers.indexOf(csvCol)
          if (colIndex === -1) continue
          let value: unknown = row[colIndex]?.trim()
          if (!value) continue

          // Type coercion
          if (['nb_etages', 'annee_construction'].includes(targetField)) {
            value = parseInt(value as string) || undefined
          } else if (targetField === 'surface') {
            value = parseFloat((value as string).replace(',', '.')) || undefined
          } else if (targetField === 'meuble') {
            const v = (value as string).toLowerCase()
            value = v === 'oui' || v === 'true' || v === '1' || v === 'yes'
          } else if (targetField === 'type') {
            const v = (value as string).toLowerCase()
            if (v.includes('maison')) value = 'maison'
            else if (v.includes('commercial') || v.includes('local')) value = 'local_commercial'
            else if (v.includes('mixte')) value = 'mixte'
            else value = 'immeuble'
          } else if (targetField === 'type_bien') {
            const v = (value as string).toLowerCase()
            if (v.includes('maison')) value = 'maison'
            else if (v.includes('studio')) value = 'studio'
            else if (v.includes('commercial') || v.includes('local')) value = 'local_commercial'
            else if (v.includes('parking')) value = 'parking'
            else if (v.includes('cave')) value = 'cave'
            else value = 'appartement'
          } else if (targetField === 'dpe_classe' || targetField === 'ges_classe') {
            value = (value as string).toUpperCase().charAt(0)
            if (!['A','B','C','D','E','F','G'].includes(value as string)) value = undefined
          }

          if (value !== undefined && value !== '') data[targetField] = value
        }

        if (importType === 'batiments') {
          if (!data.designation || !data.type || !data.rue) {
            errors.push(`Ligne ${i + 2}: designation, type et rue requis`)
            continue
          }
          await api('/batiments', {
            method: 'POST',
            body: JSON.stringify({
              designation: data.designation,
              type: data.type,
              num_batiment: data.num_batiment,
              nb_etages: data.nb_etages,
              annee_construction: data.annee_construction,
              commentaire: data.commentaire,
              adresses: [{
                type: 'principale',
                rue: data.rue,
                complement: data.complement,
                code_postal: data.code_postal || '00000',
                ville: data.ville || 'Inconnue',
              }],
            }),
          })
          success++
        } else {
          // Lots need a batiment_id — skip for now, would need batiment matching
          errors.push(`Ligne ${i + 2}: import lots necessite un bâtiment existant (non supporte en V1)`)
        }
      } catch (err: any) {
        errors.push(`Ligne ${i + 2}: ${err.message || 'Erreur inconnue'}`)
      }
    }

    setResults({ success, errors })
    setImporting(false)
    setStep('done')
    if (success > 0) onImported?.()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileXls className="h-5 w-5 text-primary" />
            Importer des données (CSV)
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            {/* Import type selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Type d'import</label>
              <div className="flex gap-2">
                <Button
                  variant={importType === 'batiments' ? 'default' : 'outline'}
                  size="sm"
                  className={importType === 'batiments' ? 'bg-primary hover:bg-primary/90' : ''}
                  onClick={() => setImportType('batiments')}
                >
                  Batiments
                </Button>
                <Button
                  variant={importType === 'lots' ? 'default' : 'outline'}
                  size="sm"
                  className={importType === 'lots' ? 'bg-primary hover:bg-primary/90' : ''}
                  onClick={() => setImportType('lots')}
                >
                  Lots
                </Button>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              <UploadSimple className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Glissez votre fichier CSV ici</p>
              <p className="text-xs text-muted-foreground/60 mt-1">ou cliquez pour parcourir</p>
              <p className="text-[10px] text-muted-foreground/40 mt-3">Formats: .csv (separateurs: virgule, point-virgule, tabulation)</p>
              <input
                id="csv-input"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>
        )}

        {/* Step 2: Column mapping */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Mapping des colonnes</p>
                <p className="text-xs text-muted-foreground/60">{csvData.rows.length} lignes detectees — Associez chaque colonne CSV a un champ ImmoChecker</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{csvData.headers.length} colonnes</Badge>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {csvData.headers.map((header) => {
                const currentMapping = mapping[header] || SKIP_VALUE
                const isMapped = currentMapping !== SKIP_VALUE
                return (
                  <div key={header} className={`grid grid-cols-[1fr_24px_240px] items-center gap-3 p-2.5 rounded-lg border ${isMapped ? 'bg-emerald-50/30 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{header}</p>
                      <p className="text-[10px] text-muted-foreground/60 truncate">{csvData.rows[0]?.[csvData.headers.indexOf(header)] || '—'}</p>
                    </div>
                    <ArrowRight className={`h-3.5 w-3.5 shrink-0 ${isMapped ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                    <Select value={currentMapping} onValueChange={(v) => setMapping({ ...mapping, [header]: v })}>
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SKIP_VALUE} className="text-xs text-muted-foreground/60">— Ignorer —</SelectItem>
                        {targetFields.map(f => (
                          <SelectItem key={f.id} value={f.id} className="text-xs">
                            {f.label} {f.required && <span className="text-red-500">*</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>

            {!allRequiredMapped && (
              <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/30 rounded-lg p-2.5">
                <WarningCircle className="h-3.5 w-3.5 shrink-0" />
                Champs obligatoires manquants: {requiredFields.filter(f => !Object.values(mapping).includes(f.id)).map(f => f.label).join(', ')}
              </div>
            )}

            <Separator />

            {/* Preview first 3 rows */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Apercu (3 premières lignes)</p>
              <div className="overflow-x-auto">
                <table className="text-[10px] w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1 text-left font-semibold text-muted-foreground/60">#</th>
                      {targetFields.filter(f => Object.values(mapping).includes(f.id)).map(f => (
                        <th key={f.id} className="px-2 py-1 text-left font-semibold text-muted-foreground">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.rows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="px-2 py-1 text-muted-foreground/40">{i + 1}</td>
                        {targetFields.filter(f => Object.values(mapping).includes(f.id)).map(f => {
                          const csvCol = Object.entries(mapping).find(([, v]) => v === f.id)?.[0]
                          const colIdx = csvCol ? csvData.headers.indexOf(csvCol) : -1
                          return <td key={f.id} className="px-2 py-1 text-foreground max-w-[120px] truncate">{colIdx >= 0 ? row[colIdx] || '—' : '—'}</td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={reset}>Retour</Button>
              <Button size="sm" onClick={handleImport} disabled={!allRequiredMapped} className="bg-primary hover:bg-primary/90 text-white">
                Importer {csvData.rows.length} lignes
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === 'importing' && (
          <div className="py-8 text-center">
            <SpinnerGap className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground">Import en cours...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{csvData.rows.length} lignes a traiter</p>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 'done' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              {results.success > 0 ? (
                <Check className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              ) : (
                <WarningCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              )}
              <p className="text-lg font-bold text-foreground">{results.success} element{results.success > 1 ? 's' : ''} importe{results.success > 1 ? 's' : ''}</p>
              {results.errors.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{results.errors.length} erreur{results.errors.length > 1 ? 's' : ''}</p>
              )}
            </div>

            {results.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                {results.errors.map((err, i) => (
                  <p key={i} className="text-[10px] text-red-700">{err}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={reset}>Nouvel import</Button>
              <Button size="sm" onClick={() => { reset(); onOpenChange(false) }} className="bg-primary hover:bg-primary/90 text-white">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
