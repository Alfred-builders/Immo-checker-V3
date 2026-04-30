import { useState } from 'react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import type { BatimentDetail } from '../types'

interface Props {
  batiment: BatimentDetail
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}

export function EditBuildingForm({ batiment, onSave, onCancel }: Props) {
  const [designation, setDesignation] = useState(batiment.designation ?? '')
  const [type, setType] = useState(batiment.type)
  const [numBatiment, setNumBatiment] = useState(batiment.num_batiment || '')
  const [nbEtages, setNbEtages] = useState(batiment.nb_etages?.toString() || '')
  const [anneeConstruction, setAnneeConstruction] = useState(batiment.annee_construction?.toString() || '')
  const [commentaire, setCommentaire] = useState(batiment.commentaire || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      designation: designation.trim() || undefined,
      type,
      num_batiment: numBatiment || undefined,
      nb_etages: nbEtages ? parseInt(nbEtages) : undefined,
      annee_construction: anneeConstruction ? parseInt(anneeConstruction) : undefined,
      commentaire: commentaire || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Numéro / lettre — structuré, distingue plusieurs bâtiments à la même adresse */}
        <div className="space-y-2">
          <Label>Numéro / lettre</Label>
          <Input value={numBatiment} onChange={(e) => setNumBatiment(e.target.value)} placeholder="A, B, 1…" maxLength={50} />
        </div>

        {/* Désignation — optionnelle */}
        <div className="space-y-2">
          <Label>Désignation</Label>
          <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Les Lilas, Résidence du Parc…" />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as BatimentDetail['type'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="immeuble">Immeuble</SelectItem>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="local_commercial">Local commercial</SelectItem>
              <SelectItem value="mixte">Mixte</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nb etages */}
        <div className="space-y-2">
          <Label>Nombre d'etages</Label>
          <Input type="number" min="0" value={nbEtages} onChange={(e) => setNbEtages(e.target.value)} placeholder="5" />
        </div>

        {/* Année construction */}
        <div className="space-y-2">
          <Label>Année de construction</Label>
          <Input type="number" min="1800" max="2099" value={anneeConstruction} onChange={(e) => setAnneeConstruction(e.target.value)} placeholder="1990" />
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
