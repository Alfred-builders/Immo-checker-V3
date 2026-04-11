---
notion_id: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
notion_url: "https://www.notion.so/EPIC-11-Multi-workspace-Auth-Comptes-Param-tres-3131d95b2f8a812cab8bed6b2d98c4fa"
last_synced: "2026-03-26T12:53:54.965Z"
created: "2026-02-26T15:28:00.000Z"
last_edited: "2026-03-23T13:11:00.000Z"
properties:
  Status: "📋 Planned"
  User Stories: "3131d95b-2f8a-81a7-b0f3-e3558e44a603, 3131d95b-2f8a-81c4-8534-dd208f9a2c2d, 3131d95b-2f8a-81d2-ba8a-d1710b4b4a0f, 3131d95b-2f8a-8137-bb3f-d33d86fd27a6, 3131d95b-2f8a-817f-93a1-c77d53bf7e21, 3131d95b-2f8a-81d8-8baa-e3ac1558e639, 3271d95b-2f8a-815c-9b9b-e7934413f9ef, 3271d95b-2f8a-813d-8a4c-d55606d17d85"
  Categories: "Infrastructure, Feature"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Fondation technique du produit. Sans workspace ni auth, rien ne fonctionne. Prépare la commercialisation SaaS multi-clients dès le départ. Inclut la page Paramètres (infos workspace, utilisateurs, rôles, invitations)."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 11 — Multi-workspace, Auth, Comptes & Paramètres"
---

# EPIC 11 — Multi-workspace, Auth, Comptes & Paramètres

| Propriete | Valeur |
|-----------|--------|
| Status | 📋 Planned |
| User Stories | 3131d95b-2f8a-81a7-b0f3-e3558e44a603, 3131d95b-2f8a-81c4-8534-dd208f9a2c2d, 3131d95b-2f8a-81d2-ba8a-d1710b4b4a0f, 3131d95b-2f8a-8137-bb3f-d33d86fd27a6, 3131d95b-2f8a-817f-93a1-c77d53bf7e21, 3131d95b-2f8a-81d8-8baa-e3ac1558e639, 3271d95b-2f8a-815c-9b9b-e7934413f9ef, 3271d95b-2f8a-813d-8a4c-d55606d17d85 |
| Categories | Infrastructure, Feature |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Fondation technique du produit. Sans workspace ni auth, rien ne fonctionne. Prépare la commercialisation SaaS multi-clients dès le départ. Inclut la page Paramètres (infos workspace, utilisateurs, rôles, invitations). |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 11 — Multi-workspace, Auth, Comptes & Paramètres |

Socle d'authentification, architecture multi-tenant, gestion des comptes et page Paramètres. Chaque workspace = un client ImmoChecker avec isolation complète des données.

## Périmètre fonctionnel

### Authentification & Multi-tenant
- Création et configuration de workspace (nom, type, logo, adresse, SIRET, email, téléphone)
- 3 types de workspace : `societe_edl` | `bailleur` | `agence`
- Authentification JWT (access token 15-30min + refresh token 7j, refresh silencieux, lockout 10 tentatives/15min)
- Table `Utilisateur` unifiée (interne + prestataires externes)
- Table pivot `WorkspaceUser` (user_id, workspace_id, role)
- 3 rôles : Admin / Gestionnaire / Technicien
- Pas de `tiers_id` ni `is_externe` sur WorkspaceUser — la table Tiers est réservée aux stakeholders autour des lots (propriétaire, locataire, mandataire). Les techniciens (internes comme externes) sont exclusivement dans User.
- La société réalisatrice de l'EDL = le Workspace (dérivé de `Workspace.nom`, `Workspace.siret`)
- Scoping V1 uniforme : tous les techniciens ne voient que leurs missions assignées
- Archivage & conformité : rétention 10+ ans, tout en hot en V1 (cold storage V2 quand volume le justifie)

### Page Paramètres du workspace (back-office)
- **Informations workspace** : nom, logo, type, adresse, SIRET, email, téléphone — éditable par l'admin
- **Gestion des utilisateurs** : tableau des utilisateurs (nom, email, rôle, statut), modification de rôle par dropdown inline, désactivation/suppression. Le dernier admin ne peut pas être supprimé.
- **Invitations** : formulaire email + rôle, envoi email d'invitation, apparaît comme "En attente" dans le tableau. Expiration 7 jours.
- **Point d'entrée navigation** vers les sous-sections (toutes dans l'EPIC 4, ex-EPIC 6 fusionnée) :
  - Templates / Pièces (EPIC 4) → CRUD TypePiece + TemplatePieceItem
  - Catalogue d'items (EPIC 4) → CRUD CatalogueItem + ValeurReferentiel
  - Paramétrage Critères (EPIC 4) → ConfigCritereCategorie + ConfigCritereItem

### Navigation conditionnelle par type de workspace
- Le `type_workspace` conditionne l'affichage de certains onglets (ex : Mandataire masqué pour workspaces de type "agence")

## Décisions d'architecture
- Un User existe **une seule fois** (cross-workspace)
- Le rôle est porté par le pivot WorkspaceUser. Pas de `tiers_id` ni `is_externe` (supprimés 20/03/2026 — simplification V1)
- Pas de table Prestataire séparée. La table Tiers = stakeholders lot uniquement
- La société réalisatrice d'un EDL est **dérivée du Workspace** (pas d'un Tiers lié au technicien)
- La page Paramètres fournit l'UI pour les tables déjà gérées par les US backend (Workspace, WorkspaceUser, Utilisateur)

## Dépendances
- **Bloque** : Toutes les autres EPICs (fondation)
- **Dépend de** : Rien