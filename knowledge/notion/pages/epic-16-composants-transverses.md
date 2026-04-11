---
notion_id: "3271d95b-2f8a-8198-928c-f11fa16a89de"
notion_url: "https://www.notion.so/EPIC-16-Composants-Transverses-3271d95b2f8a8198928cf11fa16a89de"
last_synced: "2026-03-26T12:54:34.386Z"
created: "2026-03-18T09:24:00.000Z"
last_edited: "2026-03-23T13:27:00.000Z"
properties:
  Status: "📋 Planned"
  User Stories: "3271d95b-2f8a-8185-a64b-c91517517ea8, 3271d95b-2f8a-8172-b557-db7102f28c23, 3271d95b-2f8a-819f-8230-d8709d29290b, 3271d95b-2f8a-8182-8a6e-f425ed4487ee, 3271d95b-2f8a-81d7-9c63-f4ca9959a2f0, 3271d95b-2f8a-81fe-aa70-d540c60628a5"
  Categories: "Feature, Technical"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Composants UI partagés par toutes les pages du back-office. Colonnes configurables, filtres dynamiques type Notion, recherche globale. Fondation UX commune."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 16 — Composants Transverses"
---

# EPIC 16 — Composants Transverses

| Propriete | Valeur |
|-----------|--------|
| Status | 📋 Planned |
| User Stories | 3271d95b-2f8a-8185-a64b-c91517517ea8, 3271d95b-2f8a-8172-b557-db7102f28c23, 3271d95b-2f8a-819f-8230-d8709d29290b, 3271d95b-2f8a-8182-8a6e-f425ed4487ee, 3271d95b-2f8a-81d7-9c63-f4ca9959a2f0, 3271d95b-2f8a-81fe-aa70-d540c60628a5 |
| Categories | Feature, Technical |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Composants UI partagés par toutes les pages du back-office. Colonnes configurables, filtres dynamiques type Notion, recherche globale. Fondation UX commune. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 16 — Composants Transverses |

Composants UI transverses partagés sur l'ensemble du back-office.

## Périmètre fonctionnel
- **Colonnes configurables** : toggle show/hide sur tous les tableaux, préférences par utilisateur, colonnes par défaut par workspace
- **Filtres dynamiques** : builder champ/opérateur/valeur type Notion/Airtable, filtres cumulables **AND uniquement en V1** (OR → V2). Presets sauvegardés → V2.
- **Recherche globale** (US-828) : Ctrl+K / Cmd+K, cross-entité (lots, tiers, missions, documents), résultats catégorisés. ~~US-819 dépréciée~~ (doublon).
- ~~**Édition inline**~~ : **retirée** (décision 20/03/2026). Les changements de statut/technicien impliquent des modales de confirmation, revalidation, verrouillage mission terminée. Toute modification passe par la fiche détail ou le drawer. V2 potentiel pour des champs simples.
- **Filtres rapides en dropdown compact** : pattern UX transversal appliqué sur toutes les vues (tableau missions US-597, Kanban US-812, carte US-813, calendrier US-838). Dropdowns compacts pour Période / Technicien / Statut, combinables entre eux. Complètent les filtres dynamiques avancés (builder champ/opérateur/valeur).
- **Voyant alerte** : indicateur orange en début de ligne dans les tableaux pour les objets avec actions en attente (missions). Tooltip au hover avec détail.
- **Compacité des tableaux** : hauteur de ligne réduite, resize/freeze colonnes
- **Liens cliquables** : tout objet de donnée dans un tableau avec page détail est cliquable
- **Autocomplete adresse (Google Places)** : composant partagé utilisé dans tous les formulaires de saisie d'adresse (création bâtiment, création tiers, paramètres workspace, etc.). Suggère des adresses en autocomplétion, remplit automatiquement rue, CP, ville et récupère les coordonnées GPS (latitude/longitude) pour la vue carte.
- **Composant carte** : composant partagé utilisé pour la vue carte bâtiments (EPIC 1), la vue carte missions (EPIC 13). Marqueurs colorés, clustering, popups, filtres. Choix technique (Mapbox / Google Maps / Leaflet) à déterminer selon la stack retenue.
- **Breadcrumb / Fil d'Ariane** : barre de navigation en haut de chaque page montrant le chemin hiérarchique (ex : `Parc immobilier > Résidence Les Tilleuls > Apt 3B`). Chaque segment est cliquable pour remonter dans la hiérarchie. Permet de naviguer sans utiliser le bouton retour du navigateur.
- **États de chargement** : skeleton screens sur les tableaux (lignes grises animées), spinners sur les boutons d'action, optimistic updates pour les éditions in-page sur les fiches détail (CTA "Modifier" → champs éditables). Sur mobile (app tablette) : animations spécifiques adaptées au contexte terrain.
- **Gestion des erreurs dans les formulaires** : validation en temps réel (bordure rouge + message sous le champ), messages d'erreur serveur affichés en toast, retry automatique sur les erreurs réseau (avec feedback visuel).
- **Responsive** : la webapp (back-office) doit être responsive sur web, tablette et mobile. L'app mobile native sera responsive tablette + mobile iOS/Android.

## Impact data model
- `UserPreference` : user_id, page, config JSON (colonnes visibles, ordre, largeurs, filtres actifs)
- `Notification` : user_id, type, titre, message, lien, est_lu, created_at

## Dépendances
- **Dépend de** : EPIC 11 (auth/workspace)