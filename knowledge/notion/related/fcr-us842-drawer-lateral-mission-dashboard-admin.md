---
notion_id: "3281d95b-2f8a-812d-bc42-ec3a3592ae96"
notion_url: "https://www.notion.so/FCR-US842-Drawer-lat-ral-mission-Dashboard-Admin-3281d95b2f8a812dbc42ec3a3592ae96"
last_synced: "2026-03-26T12:55:54.661Z"
created: "2026-03-19T13:23:00.000Z"
last_edited: "2026-03-20T08:39:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "842"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Drawer latéral mission Dashboard Admin"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-816e-9e35-ec34bc151a59"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-19T13:23:00.000Z"
  Code: "FCR - US842 Drawer latéral mission Dashboard Admin"
  Time Spent Activation: "Non"
---

# FCR - US842 Drawer latéral mission Dashboard Admin

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 842 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3271d95b-2f8a-816e-9e35-ec34bc151a59 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-19T13:23:00.000Z |
| Code | FCR - US842 Drawer latéral mission Dashboard Admin |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** consulter les détails d'une mission et résoudre les actions en attente dans un panneau latéral,
**afin de** ne pas quitter le dashboard pour agir.
> Rattachée à l'[EPIC 14 — Dashboard Admin (Back-office)](https://www.notion.so/3271d95b2f8a816e9e35ec34bc151a59)

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Drawer latéral mission

  Scenario: Points d'ouverture du Drawer
    Given le dashboard admin
    Then le drawer s'ouvre depuis les points d'entrée suivants :
      | Point d'entrée                              | Contexte                          |
      | Clic carte mission dans calendrier semaine  | Consultation + actions (US-838)  |
      | Clic mission dans modale mini-calendrier    | Consultation + actions (US-839)  |
      | Clic carte dans bloc "Actions en attente"   | Focus sur la résolution (US-841) |

  # ──────────────────────────────────────
  # ORDRE DES SECTIONS (priorité aux infos actionnables)
  # ──────────────────────────────────────

  Scenario: Contenu détaillé du drawer
    Given le drawer est ouvert pour une mission
    Then il affiche les sections suivantes, de haut en bas :

    # Section 1 — En-tête
      | Champ              | Source                  | Type        |
      | Référence           | Mission.reference       | Lecture     |
      | Statut mission      | Mission.statut          | Badge color |
      | Date planifiée      | Mission.date_planifiee  | Éditable    |
      | Heure début         | Mission.heure_debut     | Éditable    |
      | Heure fin           | Mission.heure_fin       | Éditable    |
      | Commentaire terrain  | Mission.commentaire     | Éditable    |

    # Section 2 — Technicien & Invitation
      | Champ                | Source                              | Type                |
      | Technicien assigné   | MissionTechnicien → User.nom        | Éditable (dropdown) |
      | Statut invitation    | MissionTechnicien.statut_invitation | Badge color         |
    And si aucun technicien assigné, le dropdown affiche "Non assigné" avec un CTA "Assigner"
    And si statut = refusé, un bouton "Réassigner" est affiché à côté

    # Section 3 — Statut RDV
      | Champ              | Source                  | Type              |
      | Statut RDV          | Mission.statut_rdv      | Éditable (dropdown) |
    And les valeurs possibles : a_confirmer / confirmé / reporté

    # Section 4 — Actions en attente (résolution)
    And si la mission a des actions en attente, un bloc dédié est affiché avec les boutons de résolution
    And si aucune action en attente, cette section est masquée

    # Section 5 — Documents EDL & Locataires
    And la section "Documents EDL" affiche la liste des EDL liés à la mission (cf scénarios EDL ci-dessous)

    # Section 6 — Lot & Bâtiment
      | Champ              | Source                         | Type              |
      | Nom du lot          | Lot.nom                        | Lecture (lien)    |
      | Type de lot         | Lot.type_lot                   | Lecture           |
      | Étage               | Lot.etage                      | Lecture           |
      | Meublé              | Lot.est_meuble                 | Lecture           |
      | Adresse complète    | AdresseBatiment (principale)   | Lecture           |
      | Nom du bâtiment     | Batiment.nom                   | Lecture (lien)    |
    And le nom du lot et du bâtiment sont cliquables (lien vers leur fiche détail)

    # Section 7 — Parties prenantes (hors locataires)
      | Champ              | Source                              | Type           |
      | Propriétaire(s)     | LotProprietaire → Tiers            | Lecture (lien) |
      | Mandataire          | Lot.mandataire_gestion_id → Tiers   | Lecture (lien) |
    And chaque tiers affiche : nom complet (ou raison sociale si morale) + téléphone
    And chaque tiers est cliquable (lien vers sa fiche)
    And les locataires ne sont PAS affichés ici — ils sont liés aux EDL dans la section 5

    # Footer
    And un lien "Ouvrir la fiche complète →" navigue vers la page mission (US-811)

  # ──────────────────────────────────────
  # SECTION EDL & LOCATAIRES (détail)
  # ──────────────────────────────────────

  Scenario: Section Documents EDL — Cas standard (1 EDL, 1 locataire)
    Given une mission avec 1 EDL d'entrée lié à 1 locataire
    Then la section affiche :
      | Champ              | Source                        | Type           |
      | Sens                | EDL_Inventaire.sens           | Badge          |
      | Type                | EDL_Inventaire.type           | Badge          |
      | Locataire           | EDLLocataire → Tiers.nom      | Éditable       |
      | Statut              | EDL_Inventaire.statut         | Badge          |
      | Lien PDF            | EDL_Inventaire.url_pdf        | Lien (si signé)|
      | Lien Web            | EDL_Inventaire.url_web        | Lien (si signé)|
    And chaque EDL est cliquable (lien vers sa fiche)

  Scenario: Section Documents EDL — Bail collectif (1 EDL, N locataires)
    Given une mission avec 1 EDL lié à 3 locataires (colocation bail collectif)
    Then la section affiche 1 ligne EDL avec la mention "3 locataires"
    And en dépliant, la liste des locataires est visible :
      | Locataire        | Source               |
      | Marie Martin     | EDLLocataire → Tiers |
      | Paul Durand      | EDLLocataire → Tiers |
      | Julie Petit      | EDLLocataire → Tiers |
    And chaque locataire est cliquable (lien vers sa fiche Tiers)
    And tant que la mission n'est pas terminée, on peut ajouter/retirer des locataires

  Scenario: Section Documents EDL — Baux individuels (N EDL, 1 locataire chacun)
    Given une mission avec 3 EDL d'entrée (colocation baux individuels)
    Then la section affiche 3 lignes distinctes :
      | EDL              | Sens    | Locataire      | Statut    |
      | EDL Entrée #1    | Entrée  | Marie Martin   | Brouillon |
      | EDL Entrée #2    | Entrée  | Paul Durand    | Brouillon |
      | EDL Entrée #3    | Entrée  | Julie Petit    | Brouillon |
    And chaque EDL est cliquable

  Scenario: Section Documents EDL — Entrée ET sortie sur la même mission
    Given une mission avec 1 EDL de sortie (ancien locataire) et 1 EDL d'entrée (nouveau locataire)
    Then la section affiche 2 lignes distinctes :
      | EDL              | Sens    | Locataire       | Statut    |
      | EDL Sortie       | Sortie  | Pierre Leroy    | Brouillon |
      | EDL Entrée       | Entrée  | Marie Martin    | Brouillon |
    And les deux sens sont supportés simultanément sur la même mission

  Scenario: Section Documents EDL — Ajout et modification
    Given la mission n'est PAS terminée (statut != terminee)
    Then un bouton "Ajouter un EDL" est affiché en bas de la section
    When l'admin clique sur "Ajouter un EDL"
    Then un mini-formulaire inline apparaît : Sens (entrée/sortie) + Type (EDL/inventaire) + Locataire (picker optionnel)
    And le locataire de chaque EDL existant est éditable (picker Tiers) tant que l'EDL n'est pas signé

  Scenario: Mission terminée — verrouillage global du drawer
    Given la mission est terminée (statut = terminee, EDL signés)
    Then les champs suivants passent en lecture seule dans le drawer :
      | Champ              | Section     | Raison                              |
      | Date planifiée     | En-tête    | Fait historique                      |
      | Heure début/fin    | En-tête    | Fait historique                      |
      | Technicien         | Section 2   | Qui a réalisé la mission est un fait |
      | Statut RDV         | Section 3   | Plus pertinent                      |
      | Section EDL        | Section 5   | Documents signés = lecture seule    |
      | Locataires EDL     | Section 5   | Liés aux EDL signés                 |
    And les champs suivants restent modifiables :
      | Champ              | Section     | Raison                              |
      | Commentaire terrain| En-tête    | Notes post-mission autorisées       |
    And le bouton "Ajouter un EDL" est masqué
    And la section Actions en attente est masquée (mission terminée = plus d'actions)
    And un bandeau visuel indique "Mission terminée — édition limitée"

  # ──────────────────────────────────────
  # MODIFICATION DATE/HEURE + REVALIDATION
  # ──────────────────────────────────────

  Scenario: Modification date et heure + revalidation
    Given le drawer est ouvert pour une mission
    Then les champs date, heure début et heure fin sont éditables directement
    When l'admin modifie la date ou l'heure
    Then une confirmation s'affiche avec le choix :
      | Option                            | Effet sur statut_invitation                  | Effet sur statut_rdv             |
      | Demander revalidation             | Repasse à "en_attente" + notif technicien    | Repasse à "a_confirmer"          |
      | Confirmer d'office                | Reste "accepte" (pas de notif)               | Reste inchangé                   |
    And l'admin peut choisir indépendamment pour l'invitation ET le RDV si les deux sont impactés
    And après confirmation, les badges et stat cards sont mis à jour

  Scenario: Modification statut RDV
    Given le drawer est ouvert pour une mission
    Then le statut RDV est éditable (dropdown : a_confirmer / confirmé / reporté)
    When l'admin passe le statut à "reporté"
    Then un champ "nouvelle date proposée" apparaît (optionnel)
    When l'admin passe le statut à "confirmé"
    Then l'action "RDV à confirmer" disparaît du bloc Actions en attente (US-841)

  # ──────────────────────────────────────
  # RÉSOLUTION DES ACTIONS
  # ──────────────────────────────────────

  Scenario: Résolution des actions
    Given le drawer est ouvert et la mission a des actions en attente
    Then la section "Actions" affiche pour chaque action un bouton de résolution :
      | Action                  | Résolution dans le drawer                              |
      | À assigner              | Dropdown pour sélectionner un technicien + bouton Assigner |
      | À assigner (après refus)| Dropdown pour assigner un nouveau technicien + bouton Assigner |
      | Invitation en attente   | Affichage du statut (pas d'action, juste suivi)           |
      | RDV à confirmer         | Boutons : Confirmer / Reporter + champ date si reporté    |
    When une action est résolue
    Then elle disparaît du bloc Actions
    And les stat cards du dashboard sont mis à jour en temps réel
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` (statut, statut_rdv, date_planifiee, heure_debut, heure_fin, commentaire)
- `MissionTechnicien` (user_id, statut_invitation)
- `EDL_Inventaire` (type, sens, statut, url_pdf, url_web) + `EDLLocataire`
- `Lot` + `Batiment` + `AdresseBatiment`
- `Tiers` (propriétaire, mandataire)
- `LotProprietaire`

---


# Règles métier
- Le drawer est le **point central** de consultation et résolution des actions sur le dashboard
- Le dashboard reste visible en arrière-plan quand le drawer est ouvert
- **Ordre des sections** : les infos actionnables (technicien, statut RDV, actions) sont en haut, les infos de contexte (lot, bâtiment, propriétaire) en bas
- Le mécanisme de revalidation au changement de date/heure est **identique** à celui de la page mission (US-811)
- Une mission peut avoir **plusieurs actions en attente** résolues indépendamment
- **EDL/Locataires** :
  - Bail collectif : 1 EDL avec N locataires (via EDLLocataire)
  - Baux individuels : N EDL distincts, 1 locataire chacun
  - Entrée + sortie simultanées : supporté sur la même mission (ex : sortie ancien locataire + entrée nouveau)
  - La section est **éditable** tant que la mission n'est pas terminée (ajout EDL, modification locataire)
  - Passe en **lecture seule** quand statut mission = terminee
- **Mission terminée = verrouillage global** : tous les champs éditables du drawer passent en lecture seule (date, heure, technicien, statut RDV, EDL, locataires) sauf le commentaire terrain et le statut de dépôt des clés ([US-822](https://www.notion.so/3271d95b2f8a810cb29cf28899dba1de))
- Les locataires sont affichés dans la section EDL (pas dans la section Parties prenantes) car ils sont liés aux EDL, pas à la mission directement
- Le lien "Ouvrir la fiche complète" navigue vers la page mission dédiée (US-811)

---


# Décisions
- **19/03/2026** : Réorganisation sections — infos actionnables en haut (technicien, statut RDV, actions), contexte en bas (lot, bâtiment, propriétaire)
- **19/03/2026** : Locataires rattachés à la section EDL (pas aux parties prenantes) — reflète le modèle de données (EDLLocataire)
- **19/03/2026** : Section EDL éditable tant que mission non terminée (ajout EDL, modification locataire)
- **19/03/2026** : Support des cas coloc : bail collectif (1 EDL, N locataires) + baux individuels (N EDL) + entrée/sortie simultanées