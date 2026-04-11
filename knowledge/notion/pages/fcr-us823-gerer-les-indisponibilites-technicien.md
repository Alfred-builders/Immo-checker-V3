---
notion_id: "3271d95b-2f8a-812b-b154-e6592687d050"
notion_url: "https://www.notion.so/FCR-US823-G-rer-les-indisponibilit-s-technicien-3271d95b2f8a812bb154e6592687d050"
last_synced: "2026-03-26T12:52:44.690Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-20T08:17:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "823"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Gérer les indisponibilités technicien"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US823 Gérer les indisponibilités technicien"
  Time Spent Activation: "Non"
---

# FCR - US823 Gérer les indisponibilités technicien

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 823 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8131-b48b-e85641cc8c31 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:33:00.000Z |
| Code | FCR - US823 Gérer les indisponibilités technicien |
| Time Spent Activation | Non |


# User Story
**En tant que** technicien ou admin,
**je veux** saisir, modifier et supprimer des plages d'indisponibilité ponctuelles ou récurrentes,
**afin que** les missions ne soient pas assignées sur des créneaux occupés et que le planning reflète la disponibilité réelle.
> Référencée par : [US-838 Calendrier semaine](https://www.notion.so/3281d95b2f8a81df908bfb9e488e79ab) (affichage), [US-840 Bouton "+"](https://www.notion.so/3281d95b2f8a8128b901de4706359017) (création depuis dashboard)

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Indisponibilités technicien

  # ──────────────────────────────────────
  # FORMULAIRE DE CRÉATION / MODIFICATION
  # ──────────────────────────────────────

  Scenario: Formulaire d'indisponibilité — champs
    Given le technicien (mobile) ou l'admin (webapp)
    When il ouvre le formulaire de création d'indisponibilité
    Then il voit les champs suivants :
      | Champ            | Type           | Obligatoire | Notes                                                  |
      | Technicien       | Select         | Oui         | Pré-rempli si technicien connecté (mobile). Choix admin (webapp) |
      | Journée entière  | Toggle (bool)  | Oui         | Défaut : activé                                        |
      | Date début       | Date           | Oui         | Si journée entière : date seule                        |
      | Date fin         | Date           | Oui         | Si journée entière : date seule. Peut = date début     |
      | Heure début      | Time           | Conditionnel| Affiché uniquement si journée entière = off             |
      | Heure fin        | Time           | Conditionnel| Affiché uniquement si journée entière = off             |
      | Récurrence       | Toggle (bool)  | Oui         | Défaut : désactivé                                     |
      | Config récurrence| Bloc récurrence| Conditionnel| Affiché uniquement si récurrence = on (cf scénario dédié) |
      | Motif            | Texte libre    | Non         | Ex : "Congé", "Formation", "Maladie"                  |
    And si "Journée entière" est activé, les champs heure sont masqués
    And si "Journée entière" est désactivé, les date pickers incluent la sélection d'heure

  # ──────────────────────────────────────
  # INDISPONIBILITÉ PONCTUELLE
  # ──────────────────────────────────────

  Scenario: Création indisponibilité ponctuelle — journée entière
    Given l'admin crée une indisponibilité pour Paul du 20/03 au 21/03 (journée entière)
    When il valide
    Then l'indisponibilité est créée avec est_journee_entiere = true, est_recurrent = false
    And le calendrier admin (US-838) affiche une plage grisée sur les 2 jours pour Paul

  Scenario: Création indisponibilité ponctuelle — créneau horaire
    Given le technicien crée une indisponibilité le 20/03 de 14h à 17h
    When il valide
    Then l'indisponibilité est créée avec est_journee_entiere = false, date_debut = 20/03 14:00, date_fin = 20/03 17:00
    And le calendrier admin affiche une plage grisée sur le créneau 14h-17h

  # ──────────────────────────────────────
  # INDISPONIBILITÉ RÉCURRENTE
  # ──────────────────────────────────────

  Scenario: Configuration de la récurrence (UX Google Calendar)
    Given le technicien active le toggle "Récurrence"
    Then un bloc de configuration apparaît avec :
      | Champ        | Type     | Valeurs                                          |
      | Fréquence    | Select   | Quotidien / Hebdomadaire / Bimensuel / Mensuel   |
      | Jours        | Multi-select | Lun / Mar / Mer / Jeu / Ven / Sam / Dim (si hebdo/bimensuel) |
      | Fin          | Radio    | Jamais / Après N occurrences / À une date        |
    And la configuration est stockée en JSON dans recurrence_config
    And le système génère les occurrences visibles dans le calendrier

  Scenario: Modifier une occurrence unique d'une récurrence
    Given une récurrence "Tous les lundis" pour Paul
    When l'admin modifie le lundi 24 mars (ex : décaler à mardi 25)
    Then le système demande : "Cet événement uniquement" ou "Tous les événements"
    When il choisit "Cet événement uniquement"
    Then seule l'occurrence du 24 mars est modifiée, les autres restent inchangées

  Scenario: Modifier toute la série récurrente
    Given une récurrence "Tous les lundis" pour Paul
    When l'admin choisit "Tous les événements"
    Then toute la série est mise à jour (fréquence, horaires, motif)

  # ──────────────────────────────────────
  # MODIFICATION ET SUPPRESSION
  # ──────────────────────────────────────

  Scenario: Modifier une indisponibilité ponctuelle
    Given une indisponibilité existante
    When le technicien (mobile) ou l'admin (webapp) ouvre l'indisponibilité
    Then il peut modifier tous les champs (dates, heures, motif, journée entière)
    And les modifications sont reflétées immédiatement dans le calendrier

  Scenario: Supprimer une indisponibilité ponctuelle
    Given une indisponibilité ponctuelle existante
    When l'utilisateur clique "Supprimer"
    Then une confirmation est demandée
    And l'indisponibilité est supprimée
    And la plage grisée disparaît du calendrier

  Scenario: Supprimer une occurrence d'une récurrence
    Given une récurrence "Tous les lundis" pour Paul
    When l'admin supprime le lundi 24 mars
    Then le système demande : "Cet événement uniquement" / "Cet événement et les suivants" / "Tous les événements"
    And l'action correspondante est appliquée

  # ──────────────────────────────────────
  # IMPACT SUR L'ASSIGNATION DE MISSIONS
  # ──────────────────────────────────────

  Scenario: Warning non-bloquant à l'assignation
    Given Paul est indisponible le 25 mars (journée entière)
    When l'admin assigne une mission à Paul le 25 mars (dropdown technicien)
    Then Paul apparaît grisé avec mention "Indisponible"
    And l'admin peut quand même le sélectionner (warning non-bloquant)

  Scenario: Warning créneau horaire
    Given Paul est indisponible le 25 mars de 14h à 17h
    When l'admin planifie une mission à Paul le 25 mars de 15h à 16h
    Then un warning "Conflit d'indisponibilité (14h-17h)" est affiché
    And l'assignation reste possible
```

---


# Modèle de données
**Table** : `IndisponibiliteTechnicien`
| Attribut | Type | Obligatoire | Notes |
| id | uuid | Oui | PK |
| user_id | uuid FK | Oui | → Utilisateur (technicien) |
| workspace_id | uuid FK | Oui | → Workspace |
| date_debut | datetime | Oui | Si journée entière, seule la date compte |
| date_fin | datetime | Oui | Idem |
| est_journee_entiere | bool | Oui | Défaut : true. Si false, les composants horaires de date_debut/date_fin définissent le créneau |
| est_recurrent | bool | Oui | Défaut : false |
| recurrence_config | json | Non | Config RRULE / json. Null si non récurrent. Structure : {frequence, jours[], fin_type, fin_valeur} |
| motif | string | Non | Ex : "Congé", "Formation" |

---


# Règles métier
- **Points d'entrée** : technicien sur app mobile, admin sur webapp (fiche technicien, calendrier via US-838/US-840)
- **Non-bloquant** : une indisponibilité ne bloque pas l'assignation d'une mission, elle affiche un warning
- **Récurrence UX Google Calendar** : quotidien, hebdo, bimensuel, mensuel. Modification par occurrence ou série entière.
- **Créneau horaire** : toggle "Journée entière" (défaut activé). Quand désactivé, les champs date incluent une sélection d'heure.
- **Pas de champs heure séparés** : `date_debut` et `date_fin` sont des `datetime`. Le flag `est_journee_entiere` indique si le composant horaire est significatif.
- **Suppression récurrence** : 3 options (cette occurrence / celle-ci et suivantes / toute la série)

---


# Décisions
- **20/03/2026** : Alignement formulaire avec US-840 (toggle journée entière, créneaux horaires). Ajout CRUD complet (modification, suppression, gestion occurrence/série). Ajout cross-refs US-838/US-840.