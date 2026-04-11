---
notion_id: "3131d95b-2f8a-81da-aa5d-cb97824de207"
notion_url: "https://www.notion.so/FCR-US592-Retrouver-un-tiers-par-nom-type-ou-r-le-3131d95b2f8a81daaa5dcb97824de207"
last_synced: "2026-03-26T12:55:30.160Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-23T12:28:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "592"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Retrouver un tiers par nom, type ou rôle"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US592 Retrouver un tiers par nom, type ou rôle"
  Time Spent Activation: "Non"
---

# FCR - US592 Retrouver un tiers par nom, type ou rôle

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 592 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8164-8e3e-e9fee9e70624 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:52:00.000Z |
| Code | FCR - US592 Retrouver un tiers par nom, type ou rôle |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire,
**je veux** rechercher un tiers rapidement via l'auto-complétion ou la barre de recherche,
**afin de** le retrouver et le sélectionner dans n'importe quel contexte (tableau, formulaire, picker).
> ℹ️ Cette US couvre le **moteur de recherche tiers** et l'**auto-complétion dans les pickers**. L'affichage du tableau tiers par onglets est couvert par [US-808](https://www.notion.so/3271d95b2f8a8182bde1fcdcfba5aff9).

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Recherche et auto-complétion tiers

  # ──────────────────────────────────────
  # BARRE DE RECHERCHE (PAGE TIERS)
  # ──────────────────────────────────────

  Scenario: Recherche textuelle dans le tableau tiers
    Given le gestionnaire est sur la page Tiers (n'importe quel onglet)
    When il tape "Dupont" dans la barre de recherche
    Then les tiers dont nom, prénom, raison_sociale, email ou téléphone contiennent "Dupont" apparaissent
    And le filtre s'applique en temps réel (debounce 300ms)
    And la recherche s'applique **au sein de l'onglet actif** (pas cross-onglet)

  # ──────────────────────────────────────
  # AUTO-COMPLÉTION DANS LES RECORD PICKERS
  # ──────────────────────────────────────

  Scenario: Auto-complétion dans un formulaire (picker locataire)
    Given le gestionnaire est dans le formulaire de création de mission (US-594)
    When il tape "Mar" dans le champ locataire
    Then une dropdown suggère les tiers correspondants :
      | Nom / Raison sociale | Type  | Email             |
      | Marie Martin         | PP    | marie@email.com   |
      | Marc Dubois          | PP    | marc@dubois.fr    |
      | Martel Immobilier    | PM    | contact@martel.fr |
    And la colonne agrégée "Nom / Raison sociale" suit le même pattern que les tableaux (Prénom Nom ou Raison sociale)
    And un bouton "+ Créer un tiers" est disponible en bas de la dropdown (cf US-588)

  Scenario: Auto-complétion dans un picker propriétaire (fiche lot)
    Given le gestionnaire est sur la fiche lot, section propriétaires
    When il tape "Ler" dans le picker propriétaire
    Then les tiers correspondants sont suggérés (PP et PM)
    And la recherche couvre nom, prénom, raison_sociale, email

  Scenario: Recherche sans résultat
    Given le gestionnaire tape "xyz123" dans un picker
    Then le message "Aucun tiers trouvé" s'affiche
    And le bouton "+ Créer un tiers" est mis en évidence
```

---


# Modèle de données impacté
**Tables consultées** :
- `Tiers` — recherche full-text sur nom, prenom, raison_sociale, email, tel

---


# Règles métier
- La recherche couvre : nom, prénom, raison_sociale, email, téléphone
- L'auto-complétion est utilisée dans **tous les record pickers tiers** de l'application (formulaire mission, fiche lot, formulaire EDL, etc.)
- Le format d'affichage dans les pickers = "Nom / Raison sociale" (même pattern agrégé que les tableaux, cf US-808)
- Création rapide via "+ Créer un tiers" directement depuis les pickers (cf US-588)
- La recherche est scopée au workspace courant
- Debounce 300ms sur la saisie

---


# Décisions
- **20/03/2026** : Recentrage de cette US sur le moteur de recherche + auto-complétion dans les pickers. La vue tableau tiers est couverte par US-808.