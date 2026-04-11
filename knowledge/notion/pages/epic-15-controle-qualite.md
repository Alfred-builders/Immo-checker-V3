---
notion_id: "3271d95b-2f8a-8111-b535-c38898546a10"
notion_url: "https://www.notion.so/EPIC-15-Contr-le-Qualit-3271d95b2f8a8111b535c38898546a10"
last_synced: "2026-03-26T12:54:30.530Z"
created: "2026-03-18T09:24:00.000Z"
last_edited: "2026-03-18T13:35:00.000Z"
properties:
  Status: "🧐 À cadrer"
  Categories: "Feature, Research"
  Priority: "P1"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Différenciant fort vs concurrence. Transforme ImmoChecker d'un outil de saisie en outil de pilotage qualité. Review interne + review locataire + notation technicien."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 15 — Contrôle Qualité"
---

# EPIC 15 — Contrôle Qualité

| Propriete | Valeur |
|-----------|--------|
| Status | 🧐 À cadrer |
| Categories | Feature, Research |
| Priority | P1 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Différenciant fort vs concurrence. Transforme ImmoChecker d'un outil de saisie en outil de pilotage qualité. Review interne + review locataire + notation technicien. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 15 — Contrôle Qualité |

**Statut : V2** — Reporté après la V1. Focus sur le rating locataire du technicien.
> ⚠️ Décision meeting client 18/03/2026 : review admin = optionnelle/aléatoire (Valentin relit 1-2 EDL par semaine). Review locataire interactive (avenants) = complexe, reportée V2. Focus V2 = rating locataire du technicien + prise de notes interne admin.

## Vision
Le contrôle qualité transformerait ImmoChecker d'un simple outil de saisie en un outil de pilotage qualité.

## Périmètre V2

### Rating locataire du technicien (prioritaire)
- Après la réalisation de l'EDL, le locataire reçoit un lien pour noter le technicien
- Critères proposés : déroulement de l'état des lieux, mise à disposition de la tablette pour relecture, ponctualité, politesse
- Tags rapides (type Uber) : "Super", "Tablette mise à disposition", "Ponctuel", etc.
- Score agrégé visible sur le profil du technicien côté admin
- Alimente le dashboard de pilotage qualité

### Prise de notes interne admin
- Review optionnelle/aléatoire : l'admin relit un EDL et laisse un commentaire interne
- Pense-bête qui transmet le feedback directement au technicien
- Pas de workflow de validation systématique

### Review locataire / Avenants (à creuser V2+)
- Sujet complexe — les locataires envoient des retours non structurés par mail
- Objectif : structurer le process pour que le locataire fasse l'effort de détailler (lié aux items)
- Clément : "il faut dégoûter le locataire de faire un avenant" — process structuré mais exigeant
- Tony propose : app locataire avec items liés pour comparatif → FC dit "usine à gaz" mais reconnaît la bonne approche structurelle
- Avenant doit être contradictoire et signé (actuellement via Pandadoc)
- À creuser dans un atelier dédié

## Impact data model (V2)
- `NotationTechnicien` : nouvelle table (edl_id, technicien_id, note_globale, tags, commentaire, date)
- `CommentaireQA` : nouvelle table (edl_id, item_id, commentaire, auteur_id, date)

## Dépendances
- **Dépend de** : EPIC 11 (auth), EPIC 13 (missions), EPIC 5 (saisie tablette)