import { useState } from 'react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
import type { LotDetail } from '../types'

interface Props {
  lot: LotDetail
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}

const NONE_VALUE = '__none__'

export function EditLotForm({ lot, onSave, onCancel }: Props) {
  const [designation, setDesignation] = useState(lot.designation)
  const [referenceInterne, setReferenceInterne] = useState(lot.reference_interne || '')
  const [typeBien, setTypeBien] = useState(lot.type_bien)
  const [etage, setEtage] = useState(lot.etage || '')
  const [emplacementPalier, setEmplacementPalier] = useState(lot.emplacement_palier || '')
  const [surface, setSurface] = useState(lot.surface?.toString() || '')
  const [nbPieces, setNbPieces] = useState(lot.nb_pieces || '')
  const [meuble, setMeuble] = useState(lot.meuble)
  const [dpeClasse, setDpeClasse] = useState(lot.dpe_classe || '')
  const [gesClasse, setGesClasse] = useState(lot.ges_classe || '')
  const [numCave, setNumCave] = useState(lot.num_cave || '')
  const [numParking, setNumParking] = useState(lot.num_parking || '')
  const [commentaire, setCommentaire] = useState(lot.commentaire || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      designation,
      reference_interne: referenceInterne || undefined,
      type_bien: typeBien,
      etage: etage || undefined,
      emplacement_palier: emplacementPalier || undefined,
      surface: surface ? parseFloat(surface) : undefined,
      nb_pieces: nbPieces || undefined,
      meuble,
      dpe_classe: dpeClasse || undefined,
      ges_classe: gesClasse || undefined,
      num_cave: numCave || undefined,
      num_parking: numParking || undefined,
      commentaire: commentaire || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Désignation */}
        <div className="col-span-2 space-y-2">
          <Label>Désignation *</Label>
          <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Appartement 201" required />
        </div>

        {/* Référence interne */}
        <div className="space-y-2">
          <Label>Référence interne</Label>
          <Input value={referenceInterne} onChange={(e) => setReferenceInterne(e.target.value)} placeholder="REF-001" />
        </div>

        {/* Type de bien */}
        <div className="space-y-2">
          <Label>Type de bien *</Label>
          <Select value={typeBien} onValueChange={setTypeBien}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="local_commercial">Local commercial</SelectItem>
              <SelectItem value="parking">Parking</SelectItem>
              <SelectItem value="cave">Cave</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Étage */}
        <div className="space-y-2">
          <Label>Étage</Label>
          <Input value={etage} onChange={(e) => setEtage(e.target.value)} placeholder="2" />
        </div>

        {/* Emplacement palier */}
        <div className="space-y-2">
          <Label>Emplacement palier</Label>
          <Input value={emplacementPalier} onChange={(e) => setEmplacementPalier(e.target.value)} placeholder="Gauche" />
        </div>

        {/* Surface */}
        <div className="space-y-2">
          <Label>Surface (m2)</Label>
          <Input type="number" step="0.01" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="65" />
        </div>

        {/* Nb pieces */}
        <div className="space-y-2">
          <Label>Nombre de pieces</Label>
          <Select value={nbPieces || NONE_VALUE} onValueChange={(v) => setNbPieces(v === NONE_VALUE ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>—</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="T1">T1</SelectItem>
              <SelectItem value="T2">T2</SelectItem>
              <SelectItem value="T3">T3</SelectItem>
              <SelectItem value="T4">T4</SelectItem>
              <SelectItem value="T5">T5</SelectItem>
              <SelectItem value="T6">T6+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meuble switch */}
      <div className="flex items-center gap-3">
        <Switch checked={meuble} onCheckedChange={setMeuble} />
        <Label>Meublé</Label>
      </div>

      {/* Energie */}
      <div className="border-t border-border/60 pt-4">
        <p className="text-sm font-medium mb-3">Energie</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>DPE</Label>
            <Select value={dpeClasse || NONE_VALUE} onValueChange={(v) => setDpeClasse(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="E">E</SelectItem>
                <SelectItem value="F">F</SelectItem>
                <SelectItem value="G">G</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>GES</Label>
            <Select value={gesClasse || NONE_VALUE} onValueChange={(v) => setGesClasse(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="E">E</SelectItem>
                <SelectItem value="F">F</SelectItem>
                <SelectItem value="G">G</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Annexes */}
      <div className="border-t border-border/60 pt-4">
        <p className="text-sm font-medium mb-3">Annexes</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>N cave</Label>
            <Input value={numCave} onChange={(e) => setNumCave(e.target.value)} placeholder="C12" />
          </div>
          <div className="space-y-2">
            <Label>N parking</Label>
            <Input value={numParking} onChange={(e) => setNumParking(e.target.value)} placeholder="P05" />
          </div>
        </div>
      </div>

      {/* Commentaire */}
      <div className="space-y-2">
        <Label>Commentaire</Label>
        <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Notes..." rows={3} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  )
}
