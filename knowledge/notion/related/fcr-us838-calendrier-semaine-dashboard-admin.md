---
notion_id: "3281d95b-2f8a-81df-908b-fb9e488e79ab"
notion_url: "https://www.notion.so/FCR-US838-Calendrier-semaine-Dashboard-Admin-3281d95b2f8a81df908bfb9e488e79ab"
last_synced: "2026-03-26T12:55:41.560Z"
created: "2026-03-19T13:22:00.000Z"
last_edited: "2026-03-20T08:31:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "838"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Calendrier semaine Dashboard Admin"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-816e-9e35-ec34bc151a59"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-19T13:22:00.000Z"
  Code: "FCR - US838 Calendrier semaine Dashboard Admin"
  Time Spent Activation: "Non"
---

# FCR - US838 Calendrier semaine Dashboard Admin

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 838 |
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
| Date de création | 2026-03-19T13:22:00.000Z |
| Code | FCR - US838 Calendrier semaine Dashboard Admin |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** un calendrier semaine affichant les missions et indisponibilités,
**afin de** visualiser la charge de travail de la semaine.
> Rattachée à l'[EPIC 14 — Dashboard Admin (Back-office)](https://www.notion.so/3271d95b2f8a816e9e35ec34bc151a59)

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Calendrier semaine Dashboard Admin

  Scenario: Affichage du calendrier semaine
    Given le dashboard admin
    Then un calendrier semaine occupe la zone principale (gauche)
    And chaque jour de la semaine est une colonne

  Scenario: Navigation entre semaines
    Given le calendrier semaine
    Then des flèches ← → permettent de naviguer semaine précédente / suivante
    And un bouton "Aujourd'hui" ramène à la semaine courante

  Scenario: Filtres rapides (dropdowns compacts)
    Given le calendrier semaine
    Then une barre de filtres rapides est affichée au-dessus du calendrier avec des dropdowns compacts :
      | Filtre             | Type      | Valeurs                                          |
      | Technicien         | Dropdown  | Tous / liste des techniciens                     |
      | Statut             | Dropdown  | Tous / Planifiée / Actions en attente / Confirmée / Terminée / Annulée |
    And les dropdowns sont combinables
    When l'admin filtre sur "Paul"
    Then seules les missions assignées à Paul et ses indisponibilités sont affichées

  Scenario: Carte mission dans le calendrier
    Given des missions planifiées cette semaine
    Then chaque mission s'affiche comme une carte compacte sur le jour correspondant
    And la carte affiche :
      | Info             | Source                        | Affichage           |
      | Référence        | Mission.reference             | Texte (M-2026-042)  |
      | Adresse courte   | Bâtiment.adresse (tronquée)   | 1 ligne max         |
      | Technicien       | MissionTechnicien → User      | Initiales ou avatar |
    And la **couleur de fond** de la carte (teinte pastel) reflète le statut :
      | Statut             | Couleur de fond          |
      | Planifiée          | Bleu clair / neutre      |
      | Actions en attente | Orange clair             |
      | Confirmée          | Vert clair               |
      | Terminée           | Gris clair               |
      | Annulée            | Rouge clair              |

  # ──────────────────────────────────────
  # INDISPONIBILITÉS (cf US-823)
  # ──────────────────────────────────────

  Scenario: Indisponibilité ponctuelle — créneau horaire
    Given un technicien a une indisponibilité mardi 14h-17h (est_journee_entiere = false)
    Then une plage grisée est affichée sur le créneau 14h-17h du mardi
    And la plage affiche le nom du technicien et le motif (si renseigné)

  Scenario: Indisponibilité ponctuelle — journée entière
    Given un technicien a une indisponibilité journee_entiere le mercredi
    Then la colonne du mercredi affiche une plage grisée sur toute la journée
    And la plage affiche le nom du technicien et le motif

  Scenario: Indisponibilités récurrentes
    Given un technicien a une récurrence "Tous les lundis 9h-12h"
    Then chaque lundi de la semaine affichée montre une plage grisée 9h-12h
    And un icône de récurrence (↻) est affiché sur la plage pour la distinguer d'une ponctuelle

  Scenario: Clic sur une indisponibilité → Popup léger
    Given une plage grisée d'indisponibilité dans le calendrier
    When l'admin clique dessus
    Then un popup léger s'ouvre avec :
      | Info            | Source                                          |
      | Technicien      | User.prenom + User.nom                          |
      | Date(s)         | date_debut → date_fin (+ heures si créneau)     |
      | Motif           | motif (ou "Non renseigné")                      |
      | Récurrence      | Fréquence en clair (si récurrent)               |
      | Bouton Modifier | Ouvre le formulaire d'édition (cf US-823)        |
      | Bouton Supprimer| Supprime (avec choix occurrence/série si récurrent, cf US-823) |
    And le popup se ferme au clic en dehors

  Scenario: Clic sur une carte mission → Drawer
    Given une carte mission dans le calendrier
    When l'admin clique sur la carte
    Then le drawer latéral s'ouvre (US-842)
    And le dashboard reste visible en arrière-plan

  Scenario: Clic sur un jour vide → Modale de création
    Given le calendrier semaine
    When l'admin clique sur une zone vide d'un jour (pas sur une carte mission ni une indisponibilité)
    Then la modale de création s'ouvre avec le choix Mission / Indisponibilité (même modale que le bouton "+", cf US-840)
    And la date du jour cliqué est pré-remplie dans le formulaire correspondant
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` (date_planifiee, heure_debut, heure_fin, statut, statut_rdv)
- `MissionTechnicien` → `User` (technicien, statut_invitation)
- `Lot` → `Batiment` → `AdresseBatiment` (adresse courte)
- `IndisponibiliteTechnicien` (plages grisées)

---


# Règles métier
- Le calendrier ne supporte PAS le drag & drop ni la création inline
- Le clic sur un **jour vide** ouvre la modale de création (Mission / Indisponibilité) avec la date pré-remplie (même modale que le bouton "+", cf US-840)
- Le clic sur une **carte mission** ouvre le drawer (US-842)
- Le clic sur une **plage d'indisponibilité** ouvre un popup léger (nom, dates, motif, boutons modifier/supprimer)
- Les indisponibilités récurrentes affichent toutes les occurrences générées, avec un icône ↻ pour les distinguer
- Définition complète des indisponibilités : [US-823](https://www.notion.so/3271d95b2f8a812bb154e6592687d050)
- Affiche tous les techniciens par défaut, filtrable via **dropdown compact** (même pattern UX que le tableau US-597 et la carte US-813)
- La couleur de fond reflète un statut dérivé : "Actions en attente" si la mission a au moins 1 action non résolue (MissionTechnicien vide, statut_invitation != accepte, ou statut_rdv = a_confirmer)