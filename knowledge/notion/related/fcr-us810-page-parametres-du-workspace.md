---
notion_id: "3271d95b-2f8a-815c-9b9b-e7934413f9ef"
notion_url: "https://www.notion.so/FCR-US810-Page-Param-tres-du-workspace-3271d95b2f8a815c9b9be7934413f9ef"
last_synced: "2026-03-26T12:55:55.982Z"
created: "2026-03-18T09:27:00.000Z"
last_edited: "2026-03-18T14:44:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "810"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Page Paramètres du workspace"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:27:00.000Z"
  Code: "FCR - US810 Page Paramètres du workspace"
  Time Spent Activation: "Non"
---

# FCR - US810 Page Paramètres du workspace

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 810 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:27:00.000Z |
| Code | FCR - US810 Page Paramètres du workspace |
| Time Spent Activation | Non |


# User Story
**En tant que** admin,
**je veux** configurer les paramètres de mon workspace depuis une page dédiée,
**afin de** personnaliser l'outil pour mon organisation et gérer mes utilisateurs.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Paramètres workspace

  Scenario: Informations de base du workspace
    Given l'admin accède à la page Paramètres
    Then il voit une section "Informations" éditable :
      | Champ               | Type                                |
      | Nom du workspace    | Texte                               |
      | Logo                | Upload image                        |
      | Type                | Enum (societe_edl, agence, bailleur)|
      | Adresse             | Adresse complète                    |
      | SIRET               | Texte                               |
      | Email de contact    | Email                               |
      | Téléphone           | Texte                               |

  Scenario: Gestion des utilisateurs
    Given l'admin consulte la section "Utilisateurs"
    Then il voit un tableau :
      | Utilisateur    | Email              | Rôle          | Statut   |
      | Jean Dupont    | jean@fc.com        | admin         | Actif    |
      | Marie Martin   | marie@fc.com       | gestionnaire  | Actif    |
      | Paul Tech      | paul@fc.com        | technicien    | Actif    |
    And il peut modifier le rôle d'un utilisateur via dropdown inline
    And il peut désactiver ou supprimer un utilisateur
    And le dernier admin ne peut pas être supprimé

  Scenario: Invitation d'un utilisateur
    Given l'admin clique sur "Inviter un utilisateur"
    Then un formulaire demande : email, rôle
    And un email d'invitation est envoyé
    And l'invitation apparaît comme "En attente" dans le tableau

  Scenario: Branding du workspace
    Given l'admin consulte la section "Branding"
    Then il peut configurer :
      | Champ             | Type         | Description                                           |
      | Logo              | Upload image | Affiché sur les PDF, la page de vérification, l'app    |
      | Couleur primaire  | Color picker | Couleur principale de l'interface et des PDF           |
    And si aucun logo n'est uploadé, le logo ImmoChecker par défaut est utilisé
    And si aucune couleur n'est définie, la couleur ImmoChecker par défaut est utilisée

  Scenario: Navigation vers les sous-sections
    Given la page Paramètres
    Then elle sert de point d'entrée vers :
      | Sous-section            | EPIC source          |
      | Templates / Pièces      | EPIC 4               |
      | Catalogue d'items       | EPIC 4               |
      | Paramétrage Critères    | EPIC 4               |
      | Référentiels (tags)      | EPIC 4 (ex-EPIC 6)   |
```

---


# Modèle de données impacté
**Tables modifiées** :
- `Workspace` — infos de base (nom, logo_url, couleur_primaire, type_workspace, adresse, SIRET, email, telephone)
- `WorkspaceUser` — rôles et statuts (consommé par US579)
- `Utilisateur` — comptes (consommé par US578/US580)
Aucune nouvelle table — cette US fournit l'interface UI pour les tables déjà gérées par les US backend de l'EPIC 11.

---


# Règles métier
- Seuls les admin peuvent accéder aux paramètres
- Le dernier admin du workspace ne peut pas être supprimé ni rétrogradé
- Les invitations expirent après 7 jours
- Le type de workspace conditionne l'affichage de certains onglets (ex : Mandataire masqué pour agence)
- Les sous-sections Templates, Catalogue, Paramétrage et Référentiels sont toutes dans l'EPIC 4 (ex-EPIC 6 fusionnée)