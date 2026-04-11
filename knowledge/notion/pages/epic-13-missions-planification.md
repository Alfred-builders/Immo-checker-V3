---
notion_id: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
notion_url: "https://www.notion.so/EPIC-13-Missions-Planification-3131d95b2f8a8131b48be85641cc8c31"
last_synced: "2026-03-26T12:54:28.981Z"
created: "2026-02-26T15:29:00.000Z"
last_edited: "2026-03-20T17:41:00.000Z"
properties:
  Status: "📌 Ready to Start"
  User Stories: "3131d95b-2f8a-819f-b3db-c62635733740, 3131d95b-2f8a-81f3-a6da-dac0429a77f9, 3131d95b-2f8a-817f-ba22-f11c8bf1d7e3, 3131d95b-2f8a-8110-9f94-efe5ea03c3c9, 3271d95b-2f8a-818d-9885-e00e5b5da241, 3271d95b-2f8a-81e7-98d6-f6f6bcb85516, 3271d95b-2f8a-81b1-9531-e27b41241ed3, 3271d95b-2f8a-8137-bb3a-cd3de4b85862, 3271d95b-2f8a-810c-b29c-f28899dba1de, 3271d95b-2f8a-812b-b154-e6592687d050, 3271d95b-2f8a-81b1-a89b-cc72394b0423, 3271d95b-2f8a-8195-8b4b-d794fff76dbd"
  Categories: "Feature"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Planification et assignation des interventions terrain. Permet la vue planning par technicien et le regroupement logique des EDL/inventaires par lot."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 13 — Missions & Planification"
---

# EPIC 13 — Missions & Planification

| Propriete | Valeur |
|-----------|--------|
| Status | 📌 Ready to Start |
| User Stories | 3131d95b-2f8a-819f-b3db-c62635733740, 3131d95b-2f8a-81f3-a6da-dac0429a77f9, 3131d95b-2f8a-817f-ba22-f11c8bf1d7e3, 3131d95b-2f8a-8110-9f94-efe5ea03c3c9, 3271d95b-2f8a-818d-9885-e00e5b5da241, 3271d95b-2f8a-81e7-98d6-f6f6bcb85516, 3271d95b-2f8a-81b1-9531-e27b41241ed3, 3271d95b-2f8a-8137-bb3a-cd3de4b85862, 3271d95b-2f8a-810c-b29c-f28899dba1de, 3271d95b-2f8a-812b-b154-e6592687d050, 3271d95b-2f8a-81b1-a89b-cc72394b0423, 3271d95b-2f8a-8195-8b4b-d794fff76dbd |
| Categories | Feature |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Planification et assignation des interventions terrain. Permet la vue planning par technicien et le regroupement logique des EDL/inventaires par lot. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 13 — Missions & Planification |

Gestion des missions d'intervention. Une Mission = 1 intervention sur 1 lot, pouvant contenir un EDL, un inventaire, ou les deux.

## Périmètre fonctionnel

### Table Mission
- CRUD complet
- `lot_id → Lot` (obligatoire, 1 mission = 1 lot, non modifiable après création)
- `reference` auto-générée (M-2026-XXXX)
- `date_planifiee`, `heure_debut`, `heure_fin`
- `statut` : `planifiee | assignee | terminee | annulee` (retour client : suppression de `en_cours` et de l'enum `creneau`)
- **Transition automatique → terminee** : quand **tous les EDL liés** à la mission sont signés (statut `signe`), la mission passe automatiquement en `terminee`. En colocation (N EDL), la mission attend que le dernier EDL soit signé.
- **Annulation bloquée si terminée** : une mission `terminee` avec des EDL signés ne peut plus être annulée (document légal irrévocable). Cf [US-825](https://www.notion.so/3271d95b2f8a81b1a89bcc72394b0423)
- **Verrouillage mission terminée** : une fois terminée, date/heure/technicien/statut RDV passent en lecture seule (fait historique). Seuls le commentaire et le statut de dépôt des clés restent modifiables. Appliqué sur la fiche mission ([US-811](https://www.notion.so/3271d95b2f8a818d9885e00e5b5da241)) et le drawer ([US-842](https://www.notion.so/3281d95b2f8a812dbc42ec3a3592ae96))
- `statut_rdv` : `a_confirmer | confirme | reporte` (statut du rendez-vous avec le locataire, séparé du statut mission)
- `commentaire` (instructions terrain)
- `created_by → User`

### Table pivot MissionTechnicien
- `mission_id`, `user_id`, `est_principal`
- **1 technicien par mission** en V1 (dropdown simple, pas multi-sélection) — pivot pour anticiper le multi-technicien
- `statut_invitation` : en_attente | accepte | refuse (séparé du statut mission, retour client 18/03/2026)
- Mission sans technicien = "à assigner" (visible dans les badges d'alerte du dashboard)

### Table CleMission (V1 — entrée + sortie)
- Clés documentées dans chaque EDL : entrée (remise au locataire, documentaire) et sortie (récupérées, workflow dépôt)
- **FK vers **`**edl_id**` (pas mission_id) : en colocation, chaque locataire remet/reçoit ses propres clés. L'agrégation au niveau mission se fait via le join `CleMission.edl_id → EDL_Inventaire.mission_id`.
- Attributs : type_cle (enum), quantite, statut (`remise | a_deposer | deposee`), lieu_depot (texte), commentaire + photos (table Photo, entity_type = `cle`)
- 3 statuts : `remise` (entrée, documentaire), `a_deposer` (sortie), `deposee` (sortie, confirmé)
- Modifiable par le technicien (mobile) ET l'admin (webapp)
- Vue checklist "Clés à déposer" agrégée sur le dashboard technicien (US-816) — filtre `a_deposer` uniquement
- Détail par mission sur la fiche mission (US-811) et le drawer dashboard (US-842)

### Table IndisponibiliteTechnicien
- Plages d'indisponibilité : date_debut (datetime), date_fin (datetime), est_journee_entiere (bool), motif, est_recurrent, recurrence_config (json)
- **Créneaux horaires** : toggle journée entière. Si désactivé, le composant horaire de date_debut/date_fin définit le créneau
- **Récurrence UX Google Calendar** : quotidien/hebdo/bimensuel/mensuel, modification par occurrence ou série
- Affichées en plages grisées dans le calendrier admin (US-838). Popup au clic (nom, dates, motif, modifier/supprimer)
- CRUD complet : création depuis dashboard (US-840) ou app mobile, modification, suppression
- Définition complète : [US-823](https://www.notion.so/3271d95b2f8a812bb154e6592687d050)

### Lien avec EDL
- `EDL.mission_id → Mission` (nullable)
- **Contrainte** : `EDL.lot_id` doit correspondre à `Mission.lot_id`
- `EDL.technicien_id` pré-rempli depuis la Mission, mais modifiable
- Le sens (entrée/sortie) et le toggle inventaire dans le formulaire de création déterminent quels documents EDL_Inventaire sont créés automatiquement
- **Plusieurs EDL par mission** : supporté pour les colocations à bails individuels (ex: 3 EDL d'entrée le même jour dans le même lot, 1 par colocataire)

### Cas colocation
**Deux types de bail gérés dès le formulaire de création** (choix via radio "Type de bail" quand 2+ locataires, cf [US-594](https://www.notion.so/3131d95b2f8a819fb3dbc62635733740)) :
**Bail collectif** (colocation solidaire) : 1 seul EDL signé par tous les locataires. Les N locataires sont liés au même EDL via la table pivot `EDLLocataire`.
**Bails individuels** (défaut, chambres séparées) : N EDL distincts (1 par locataire), rattachés à la même mission. Le technicien voit à l'avance le nombre d'EDL à réaliser.
**Entrée + sortie sur la même mission** (décision 19/03/2026) : une mission peut contenir à la fois des EDL de sortie (ancien locataire) et d'entrée (nouveau locataire) sur le même lot. Le champ "type" dans le tableau des missions affiche alors plusieurs tags (Entrée + Sortie).
**Sur le terrain**, le technicien peut aussi :
1. Réaliser l'EDL complet pour le locataire 1
1. **Dupliquer** l'EDL au sein de la même mission (structure + contenu + photos copiés)
1. **Modifier** l'EDL dupliqué : changer le locataire + ajuster les pièces (retirer la chambre non occupée, ajouter la bonne)
1. Répéter pour chaque colocataire
La seule différence entre les EDL d'une même mission coloc = le locataire + la/les chambre(s) attribuée(s).

## Interface back-office

### Formulaire de création (modal harmonisée)
- **Ouverture en modal** quel que soit le point d'entrée (dashboard, page missions, page bâtiment)
- **Record picker enrichi** pour le lot : nom + adresse + propriétaire + étage + emplacement palier
- **Création à la volée** : lot et bâtiment créables depuis le formulaire si inexistants
- Champs : Lot (picker) → Sens (entrée/sortie) → Avec inventaire (toggle) → Locataire(s) + Type de bail (individuel/collectif si 2+) → Date → Heure début/fin → Technicien (dropdown) → Commentaire
- Pré-remplissage contextuel (depuis fiche lot ou calendrier)

### Vues de la page Missions
- **Tableau** avec colonnes configurables : référence, lot, adresse, date, type, technicien, statut mission, statut RDV, statut invitation (tous en lecture seule — édition via fiche mission ou drawer)
- **Stat cards** : Total / Missions du jour / Actions en attente / À venir (masquables, cliquables pour filtrer). "Actions en attente" = même définition que le dashboard admin (US-837/US-841) : 3 types (mission sans technicien, invitation en attente/refusée, RDV à confirmer)
- **Vue Kanban** par statut (Planifiée → Assignée → Terminée → Annulée) sans drag & drop (transitions de statut trop complexes — passage par drawer/fiche mission)
- **Vue carte/map** (Mapbox) : marqueurs colorés par statut, popup au clic, filtres temporels + technicien. Nécessite `AdresseBatiment.latitude/longitude`
- **Vue calendrier** : intégrée au dashboard admin (EPIC 14)
- **Filtres dynamiques** type Notion (EPIC 16)

### Page détail mission
- En-tête : référence, statut (badge), date, technicien
- Lot + Bâtiment (cliquables vers fiches détail)
- Parties prenantes : propriétaire, locataire entrant/sortant, mandataire
- **Documents EDL** : tableau avec statut + 4 liens (PDF, Web, PDF légal, Web légal) pour chaque document signé
- Infos EDL remontées : consentement locataire, code d'accès, statut signature
- Timeline historique des actions
- Édition : date, heure, technicien, commentaire (lot non modifiable)

### Interface technicien
- Accepter / refuser les missions assignées (desktop et/ou mobile)

## Décisions prises (retours client mars 2026)
- ✅ Suppression de l'enum `creneau` ("usine à gaz, ça obstrue")
- ✅ Suppression du champ `avec_edl` (toujours vrai)
- ✅ Statut simplifié : `planifiee | assignee | terminee | annulee`
- ✅ 1 technicien par mission en V1 (dropdown, pas checklist)
- ✅ Formulaire en modal avec record picker enrichi
- ✅ Stat cards : Total / Missions du jour / Actions en attente / À venir (retrait inventaire, 20/03 : "À assigner" remplacé par "Actions en attente" aligné dashboard)
- ✅ Suppression édition inline dans le tableau missions (US-597) — trop de logique de confirmation/revalidation. Édition via fiche mission ou drawer uniquement (20/03/2026)
- ✅ Duplication EDL retirée du back-office (US-811) — fonctionnalité exclusive de l'app tablette (EPIC 5) (20/03/2026)
- ✅ Verrouillage mission terminée : date/heure/technicien/statut RDV en lecture seule. Commentaire + clés restent modifiables. Appliqué sur fiche mission (US-811), drawer (US-842), tableau inline (US-597) (20/03/2026)
- ✅ Pattern UX transversal : **filtres rapides en dropdown compact** (pas des tags/pills) sur toutes les vues — tableau (US-597), carte (US-813), calendrier (US-838). Gain de place + cohérence. Les filtres dynamiques avancés (EPIC 16) restent disponibles en complément.
- ✅ Auto-terminaison mission quand tous les EDL liés sont signés (20/03/2026)
- ✅ Annulation bloquée sur mission terminée / EDL signés (20/03/2026, cf US-825)
- ✅ US-596 (Définir date et créneau) dépréciée — absorbée dans US-594 (création avec date/heure) et US-811 (modification + revalidation). L'enum `creneau` (matin/après-midi/journée/custom) est supprimé, remplacé par `heure_debut` + `heure_fin` simples. (20/03/2026)
- ✅ Formulaire création mission (US-594) : ajout radio "Type de bail" (individuel/collectif) quand 2+ locataires. Individuel = N EDL, Collectif = 1 EDL + N locataires via EDLLocataire (20/03/2026)

## Dépendances
- **Dépend de** : EPIC 11 (auth), EPIC 1 (lots), EPIC 2 (tiers pour les EDL)
- **Bloque** : EPIC 14 (dashboard utilise le calendrier missions)