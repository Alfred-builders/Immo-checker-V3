---
notion_id: "3271d95b-2f8a-816e-9e35-ec34bc151a59"
notion_url: "https://www.notion.so/EPIC-14-Dashboard-Admin-Back-office-3271d95b2f8a816e9e35ec34bc151a59"
last_synced: "2026-03-26T12:52:46.855Z"
created: "2026-03-18T09:24:00.000Z"
last_edited: "2026-03-20T17:35:00.000Z"
properties:
  Status: "📌 Ready to Start"
  User Stories: "3281d95b-2f8a-812e-afb4-d868bd54baa2, 3281d95b-2f8a-81df-908b-fb9e488e79ab, 3281d95b-2f8a-818e-85e1-dcdb1512ec04, 3281d95b-2f8a-8128-b901-de4706359017, 3281d95b-2f8a-818c-ac05-c2548f4bf392, 3281d95b-2f8a-812d-bc42-ec3a3592ae96"
  Categories: "Feature, Design"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Point d'entrée principal du back-office webapp. Double calendrier (semaine + mini-cal mensuel), bloc Actions en attente, drawer latéral pour consultation et résolution des actions. Ne concerne PAS l'app mobile technicien (cf EPIC 5)."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 14 — Dashboard Admin (Back-office)"
---

# EPIC 14 — Dashboard Admin (Back-office)

| Propriete | Valeur |
|-----------|--------|
| Status | 📌 Ready to Start |
| User Stories | 3281d95b-2f8a-812e-afb4-d868bd54baa2, 3281d95b-2f8a-81df-908b-fb9e488e79ab, 3281d95b-2f8a-818e-85e1-dcdb1512ec04, 3281d95b-2f8a-8128-b901-de4706359017, 3281d95b-2f8a-818c-ac05-c2548f4bf392, 3281d95b-2f8a-812d-bc42-ec3a3592ae96 |
| Categories | Feature, Design |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Point d'entrée principal du back-office webapp. Double calendrier (semaine + mini-cal mensuel), bloc Actions en attente, drawer latéral pour consultation et résolution des actions. Ne concerne PAS l'app mobile technicien (cf EPIC 5). |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 14 — Dashboard Admin (Back-office) |


## Périmètre fonctionnel

### Dashboard Admin / Gestionnaire (webapp back-office uniquement)
- **Stat cards** (US-837) : EDL du mois, Actions en attente (cliquable → scroll), À venir
- **Calendrier semaine** (US-838) : panneau principal gauche, cartes mission en couleur de fond pastel, indispos grisées, navigation ← →, filtre technicien
- **Mini-calendrier mensuel** (US-839) : panneau droit, pastilles indicatrices, clic date → modale liste missions
- **Bouton "+"** (US-840) : choix Mission / Indisponibilité, formulaire indispo avec toggle journée entière + créneaux horaires + récurrence
- **Bloc "Actions en attente"** (US-841) : missions avec actions à résoudre (3 types : assignation, invitation, RDV), tags colorés
- **Drawer latéral** (US-842) : panneau coulissant droite, 7 sections de contenu, modification date/heure + revalidation, résolution des actions, **verrouillage si mission terminée** (lecture seule sauf commentaire)
> ℹ️ Le dashboard technicien (app mobile/tablette) est traité dans l'EPIC 5 — Saisie Tablette (US-816).

## User Stories
| US | Titre |
| [US-837](https://www.notion.so/3281d95b2f8a812eafb4d868bd54baa2) | Stat cards |
| [US-838](https://www.notion.so/3281d95b2f8a81df908bfb9e488e79ab) | Calendrier semaine |
| [US-839](https://www.notion.so/3281d95b2f8a818e85e1dcdb1512ec04) | Mini-calendrier mensuel |
| [US-840](https://www.notion.so/3281d95b2f8a8128b901de4706359017) | Bouton "+" (Mission & Indisponibilité) |
| [US-841](https://www.notion.so/3281d95b2f8a818cac05c2548f4bf392) | Bloc "Actions en attente" |
| [US-842](https://www.notion.so/3281d95b2f8a812dbc42ec3a3592ae96) | Drawer latéral mission |

## Dépendances
- **Dépend de** : EPIC 11 (auth/workspace), EPIC 13 (missions)

## Décisions
- **19/03/2026** : US-816 (Dashboard Technicien) déplacée vers EPIC 5
- **19/03/2026** : Découpage US-815 en 6 US (US-837 → US-842)
- **19/03/2026** : Suppression des badges d'alerte (redondants avec stat card + bloc Actions en attente)
- **19/03/2026** : Calendrier en lecture seule + bouton "+" plutôt que clic-sur-créneau
- **19/03/2026** : Double calendrier (semaine + mini-cal mensuel)
- **19/03/2026** : Drawer latéral pour consultation + résolution des actions
- **19/03/2026** : Cartes mission en couleur de fond pastel par statut
- **19/03/2026** : Date/heure modifiables depuis le drawer avec revalidation
- **19/03/2026** : Coloc baux séparés — création anticipée de N EDL (cf EPIC 13 + US-594)
- **19/03/2026** : Retrait du badge "EDL à reviewer" (ponctuel, pas d'action workflow)
- **19/03/2026** : Stat card "À assigner" renommée → "Actions en attente" (couvre assignation + invitation + RDV)
- **19/03/2026** : Refus technicien → mission revient dans "Actions en attente" (pas de workflow bloquant)
- **19/03/2026** : Formulaire indisponibilité avec toggle "Journée entière" (style Google Calendar)
- **19/03/2026** : Flèches ← → sur le calendrier semaine pour naviguer entre semaines
- **19/03/2026** : Les 3 actions s'appuient sur des champs existants (MissionTechnicien vide, statut_invitation, statut_rdv) — pas de modification du modèle de données
- **19/03/2026** : US-815 chapeau supprimée, contenu migré dans cette EPIC
- **19/03/2026** : Drawer (US-842) — réorganisation sections : infos actionnables en haut (technicien, statut RDV, actions), contexte en bas (lot, bâtiment, propriétaire)
- **19/03/2026** : Drawer (US-842) — section EDL éditable tant que mission non terminée (ajout EDL, modification locataire)
- **19/03/2026** : Support entrée + sortie simultanées sur la même mission. Colonne "Type(s)" multi-tags dans le tableau missions (US-597)
- **19/03/2026** : Locataires affichés dans la section EDL du drawer (pas dans Parties prenantes) — reflète le modèle EDLLocataire
- **19/03/2026** : Clic sur un jour vide du calendrier → ouvre la même modale que le bouton "+" (Mission / Indisponibilité) avec la date pré-remplie
- **20/03/2026** : Indisponibilités enrichies — créneaux horaires + récurrence complète (quotidien/hebdo/bimensuel/mensuel) + popup léger au clic (nom, dates, motif, modifier/supprimer). Cf [US-823](https://www.notion.so/3271d95b2f8a812bb154e6592687d050)
- **20/03/2026** : Verrouillage drawer si mission terminée — tous champs en lecture seule sauf commentaire. Cf [US-842](https://www.notion.so/3281d95b2f8a812dbc42ec3a3592ae96)
- **20/03/2026** : Filtres rapides en dropdown compact sur le calendrier semaine (US-838) — pattern transversal aligné avec tableau/carte/Kanban