---
notion_id: "3271d95b-2f8a-810a-95d7-c6f604926f0d"
notion_url: "https://www.notion.so/FCR-US807-Consulter-la-fiche-d-tail-d-un-locataire-3271d95b2f8a810a95d7c6f604926f0d"
last_synced: "2026-03-26T12:56:15.821Z"
created: "2026-03-18T09:25:00.000Z"
last_edited: "2026-03-23T12:28:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "807"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Consulter la fiche détail d'un locataire"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:25:00.000Z"
  Code: "FCR - US807 Consulter la fiche détail d'un locataire"
  Time Spent Activation: "Non"
---

# FCR - US807 Consulter la fiche détail d'un locataire

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 807 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8164-8e3e-e9fee9e70624 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:25:00.000Z |
| Code | FCR - US807 Consulter la fiche détail d'un locataire |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** consulter la fiche complète d'un locataire,
**afin de** voir tous ses lots liés (historique), ses documents EDL et ses missions.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Fiche détail locataire

  # ──────────────────────────────────────
  # INFORMATIONS DE BASE
  # ──────────────────────────────────────

  Scenario: Informations de base
    Given un locataire "Marie Martin" (personne physique)
    When le gestionnaire ouvre la fiche
    Then il voit les infos de contact : nom, prénom, email, téléphone, adresse
    And l'affichage est conditionnel au type_personne (PP : nom/prénom, PM : raison_sociale/SIREN)

  # ──────────────────────────────────────
  # LOTS LIÉS (HISTORIQUE COMPLET)
  # ──────────────────────────────────────

  Scenario: Tous les lots liés au locataire (pas seulement le lot actuel)
    Given un locataire "Marie Martin" qui a été liée à 3 lots au fil du temps (via EDLLocataire)
    When le gestionnaire consulte la section "Lots"
    Then il voit tous les lots avec l'historique :
      | Lot    | Bâtiment              | Adresse               | Propriétaire  | Entrée     | Sortie     | Statut     |
      | Apt 2B | Résidence Les Tilleuls| 12 rue des Lilas      | Pierre Leroy  | 01/01/2026 | —          | En cours   |
      | Apt 3A | Résidence Les Roses   | 8 rue des Roses       | Jean Dupont   | 01/06/2024 | 31/12/2025 | Terminé    |
      | Studio | —                     | 5 rue Victor Hugo     | Marie Petit   | 01/03/2023 | 31/05/2024 | Terminé    |
    And chaque lot est cliquable vers sa fiche détail
    And la colonne "Entrée" = date du dernier EDL d'entrée pour ce locataire sur ce lot
    And la colonne "Sortie" = date du dernier EDL de sortie (null si pas encore sorti)
    And "En cours" = pas d'EDL de sortie après l'EDL d'entrée
    And les lots sont triés par date d'entrée DESC (le plus récent en haut)

  Scenario: Locataire sans lot lié
    Given un locataire créé mais jamais lié à un EDL
    Then la section "Lots" affiche "Aucun lot lié à ce locataire"

  # ──────────────────────────────────────
  # DOCUMENTS EDL
  # ──────────────────────────────────────

  Scenario: Documents EDL liés
    Given un locataire avec des EDL signés sur plusieurs lots
    When le gestionnaire consulte la section "Documents"
    Then il voit tous les documents liés via EDLLocataire :
      | Type             | Lot    | Date       | Statut | PDF      | Web      |
      | EDL Entrée       | Apt 2B | 01/01/2026 | Signé  | 📄 Lien | 🌐 Lien |
      | Inventaire Entrée| Apt 2B | 01/01/2026 | Signé  | 📄 Lien | 🌐 Lien |
      | EDL Sortie       | Apt 3A | 31/12/2025 | Signé  | 📄 Lien | 🌐 Lien |
      | EDL Entrée       | Apt 3A | 01/06/2024 | Signé  | 📄 Lien | 🌐 Lien |
    And les liens PDF/Web ne sont disponibles que pour les EDL signés
    And les documents sont triés par date DESC

  # ──────────────────────────────────────
  # MISSIONS
  # ──────────────────────────────────────

  Scenario: Missions associées
    Given un locataire avec des missions (via EDLLocataire → EDL_Inventaire → Mission)
    When le gestionnaire consulte la section "Missions"
    Then il voit :
      | Mission   | Lot    | Date       | Type       | Statut    | Technicien    |
      | M-2026-42 | Apt 2B | 01/01/2026 | Entrée     | Terminée  | Jean Dupont   |
      | M-2025-89 | Apt 3A | 31/12/2025 | Sortie     | Terminée  | Paul Martin   |
    And chaque mission est cliquable vers sa fiche détail (US-811)
    And les missions sont triées par date DESC

  # ──────────────────────────────────────
  # TIERS MULTI-RÔLE
  # ──────────────────────────────────────

  Scenario: Locataire qui est aussi propriétaire (multi-rôle)
    Given un tiers "Jean Dupont" qui est locataire d'un lot ET propriétaire d'un autre
    When le gestionnaire ouvre sa fiche depuis l'onglet Locataire
    Then la fiche affiche toutes les sections pertinentes :
      - Section "Lots (locataire)" : lots où il est locataire via EDLLocataire
      - Section "Lots possédés" : lots où il est propriétaire via LotProprietaire
      - Section "Documents" : tous ses EDL
      - Section "Missions" : toutes ses missions
    And un indicateur en haut de la fiche montre ses rôles : badges "Locataire" + "Propriétaire"
```

---


# Modèle de données impacté
**Tables consultées** :
- `Tiers` — infos de base
- `EDLLocataire` → `EDL_Inventaire` → `Mission` → `Lot` → `Batiment` — lots liés, documents, missions
- `LotProprietaire` → `Lot` — lots possédés (si multi-rôle)
- `Tiers` (via LotProprietaire) — propriétaire de chaque lot loué

---


# Règles métier
- **Pas de "lot actuel"** — on affiche tous les lots liés au locataire avec leur historique (entrée/sortie). ImmoChecker n'est pas un logiciel de gestion locative, on ne gère pas l'occupation.
- Le statut "En cours" est déduit : EDL d'entrée présent sans EDL de sortie postérieur pour ce locataire sur ce lot.
- Les documents sont triés par date DESC et incluent les liens PDF/Web (si signés).
- La fiche est **une fiche unique par tiers avec sections conditionnelles** : si le tiers a aussi des LotProprietaire → la section "Lots possédés" apparaît. Badges de rôle en haut de la fiche.
- **Pattern d'édition** : CTA "Modifier" → édition inline → "Enregistrer" / "Annuler". Lecture par défaut. Pattern identique sur toutes les fiches détail (cf US-610).
- **Affichage conditionnel PP/PM** : si PP → nom, prénom, representant_nom, procuration, adresse, tel, email. Si PM → raison_sociale, SIREN, adresse, tel, email.
- Accessible aux admin et gestionnaires

---


# Décisions
- **20/03/2026** : "Lot actuel" remplacé par "Lots liés" (historique complet). Section Missions détaillée avec tableau. Gestion multi-rôle (sections conditionnelles, badges en haut de fiche).