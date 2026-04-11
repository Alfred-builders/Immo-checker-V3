---
notion_id: "3281d95b-2f8a-8128-b901-de4706359017"
notion_url: "https://www.notion.so/FCR-US840-Bouton-Mission-Indisponibilit-Dashboard-Admin-3281d95b2f8a8128b901de4706359017"
last_synced: "2026-03-26T12:55:45.684Z"
created: "2026-03-19T13:23:00.000Z"
last_edited: "2026-03-20T08:18:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "840"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Bouton \"+\" Mission & Indisponibilité Dashboard Admin"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-816e-9e35-ec34bc151a59"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-19T13:23:00.000Z"
  Code: "FCR - US840 Bouton \"+\" Mission & Indisponibilité Dashboard Admin"
  Time Spent Activation: "Non"
---

# FCR - US840 Bouton "+" Mission & Indisponibilité Dashboard Admin

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 840 |
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
| Code | FCR - US840 Bouton "+" Mission & Indisponibilité Dashboard Admin |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** créer une mission ou une indisponibilité technicien depuis le dashboard,
**afin de** planifier rapidement sans changer de page.
> Rattachée à l'[EPIC 14 — Dashboard Admin (Back-office)](https://www.notion.so/3271d95b2f8a816e9e35ec34bc151a59)

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Bouton "+" Dashboard Admin

  Scenario: Points d'ouverture de la modale de création
    Given le dashboard admin
    Then la modale de création s'ouvre depuis 2 points d'entrée :
      | Point d'entrée                              | Date pré-remplie                  |
      | Bouton "+" à côté du calendrier              | Non (l'admin choisit la date)    |
      | Clic sur un jour vide du calendrier (US-838)| Oui (date du jour cliqué)        |
    And dans les deux cas, la modale propose le choix :
      | Option           | Action                                                       |
      | Mission          | Ouvre le formulaire standard de création mission (cf US-594) |
      | Indisponibilité  | Ouvre le formulaire de création d'indisponibilité            |

  Scenario: Création de mission
    Given l'admin a choisi "Mission"
    Then le formulaire standard de création mission s'ouvre en modal (cf US-594)
    And le formulaire est identique à celui utilisé partout sur la plateforme
    And après création, la mission apparaît dans le calendrier semaine

  Scenario: Formulaire d'indisponibilité (définition complète : US-823)
    Given l'admin a choisi "Indisponibilité"
    Then le formulaire contient :
      | Champ            | Type           | Obligatoire | Notes                                                  |
      | Technicien       | Select         | Oui         |                                                        |
      | Journée entière  | Toggle (bool)  | Oui         | Défaut : activé                                        |
      | Date début       | Date           | Oui         | Si journée entière : date seule                        |
      | Date fin         | Date           | Oui         | Si journée entière : date seule                        |
      | Heure début      | Time           | Conditionnel| Affiché uniquement si journée entière = off             |
      | Heure fin        | Time           | Conditionnel| Affiché uniquement si journée entière = off             |
      | Récurrence       | Toggle (bool)  | Oui         | Défaut : désactivé                                     |
      | Config récurrence| Bloc récurrence| Conditionnel| Fréquence, jours, fin (si récurrence = on, cf US-823)  |
      | Motif            | Texte libre    | Non         |                                                        |
    And si "Journée entière" est activé, les champs heure sont masqués
    And si "Journée entière" est désactivé, les date pickers incluent la sélection d'heure
    And si "Récurrence" est activé, le bloc de config récurrence apparaît (quotidien/hebdo/bimensuel/mensuel, jours, fin)

  Scenario: Création d'indisponibilité journée entière
    Given l'admin crée une indisponibilité pour Paul du 20/03 au 21/03 (journée entière)
    When il valide
    Then l'indisponibilité est créée
    And le calendrier semaine affiche une plage grisée sur les 2 jours pour Paul

  Scenario: Création d'indisponibilité créneau horaire
    Given l'admin crée une indisponibilité pour Paul le 20/03 de 14h à 17h
    When il valide
    Then l'indisponibilité est créée
    And le calendrier semaine affiche une plage grisée sur le créneau 14h-17h pour Paul
```

---


# Modèle de données impacté
**Tables modifiées** :
- `IndisponibiliteTechnicien` — création : user_id, workspace_id, date_debut (datetime), date_fin (datetime), est_journee_entiere (bool), est_recurrent (bool), recurrence_config (json, nullable), motif
- Pas de champs heure séparés : `date_debut` et `date_fin` sont des datetime, le flag `est_journee_entiere` indique si le composant horaire est significatif

---


# Règles métier
- Le formulaire mission est le **formulaire standard** réutilisé partout (cf US-594)
- La modale de création est déclenchée par le bouton "+" OU par un clic sur un jour vide du calendrier (US-838)
- Si ouvert depuis le calendrier, la date est pré-remplie avec le jour cliqué
- Si `est_journee_entiere = true`, le composant horaire de date_debut/date_fin est ignoré côté affichage
- Si `est_journee_entiere = false`, les datetime incluent les heures de début/fin du créneau
- Les indisponibilités récurrentes créées ici apparaissent immédiatement dans le calendrier (US-838) avec toutes les occurrences générées
- Définition complète des indisponibilités : [US-823](https://www.notion.so/3271d95b2f8a812bb154e6592687d050)