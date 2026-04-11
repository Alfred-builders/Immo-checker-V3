---
notion_id: "3271d95b-2f8a-818d-9885-e00e5b5da241"
notion_url: "https://www.notion.so/FCR-US811-Consulter-la-page-d-tail-d-une-mission-3271d95b2f8a818d9885e00e5b5da241"
last_synced: "2026-03-26T12:56:47.897Z"
created: "2026-03-18T09:27:00.000Z"
last_edited: "2026-03-23T12:07:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "811"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Consulter la page détail d'une mission"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:27:00.000Z"
  Code: "FCR - US811 Consulter la page détail d'une mission"
  Time Spent Activation: "Non"
---

# FCR - US811 Consulter la page détail d'une mission

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 811 |
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
| Date de création | 2026-03-18T09:27:00.000Z |
| Code | FCR - US811 Consulter la page détail d'une mission |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** consulter et modifier la fiche complète d'une mission,
**afin de** piloter l'intervention et accéder aux informations EDL sans naviguer.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Page détail mission

  Scenario: Affichage des informations de la mission
    Given une mission "M-2026-0042" planifiée
    When le gestionnaire ouvre la fiche
    Then il voit :
      | Section            | Contenu                                           |
      | En-tête            | Référence, statut mission (badge), statut RDV, date, technicien + statut invitation |
      | Lot                | Nom, adresse, étage, emplacement (cliquable)       |
      | Bâtiment           | Désignation, adresse (cliquable)                   |
      | Parties prenantes  | Propriétaire, locataire entrant/sortant, mandataire|
      | Documents EDL      | EDL entrée/sortie, inventaire, statut de chaque    |
      | Historique         | Timeline des actions (création, assignation, etc.)  |

  Scenario: Modification des informations (mission non terminée)
    Given la fiche détail d'une mission en statut "planifiee" ou "assignee"
    When le gestionnaire clique sur "Modifier"
    Then il peut éditer : date, heure début/fin, technicien assigné, statut RDV (a_confirmer | confirme | reporte), commentaire
    And il ne peut pas changer le lot (mission figée sur un lot)
    And le statut invitation du technicien est affiché en lecture seule (en_attente | accepte | refuse)

  Scenario: Verrouillage mission terminée (EDL signés)
    Given une mission en statut "terminee" (tous les EDL signés)
    Then les champs suivants passent en lecture seule :
      | Champ              | Raison                                          |
      | Date planifiée     | Fait historique — l'intervention a eu lieu       |
      | Heure début/fin    | Fait historique                                  |
      | Technicien         | Qui a réalisé la mission est un fait             |
      | Statut RDV         | Plus pertinent après terminaison                |
      | Statut mission     | Géré automatiquement (auto-terminaison)        |
    And les champs suivants restent modifiables :
      | Champ              | Raison                                          |
      | Commentaire        | Notes post-mission autorisées                   |
      | Clés (statut dépôt)| Le dépôt a lieu après la mission (cf US-822)   |
    And le bouton "Annuler la mission" est masqué (cf US-825)
    And le bouton "Ajouter un EDL" est masqué
    And un bandeau visuel indique "Mission terminée — édition limitée"

  Scenario: Revalidation au changement de date/heure
    Given une mission avec un technicien ayant accepté (statut_invitation = accepte)
    When le gestionnaire modifie la date ou l'heure
    Then une confirmation s'affiche avec le choix :
      | Option                   | Effet sur statut_invitation              | Effet sur statut_rdv        |
      | Demander revalidation    | Repasse à "en_attente" + notif technicien | Repasse à "a_confirmer"     |
      | Confirmer d'office       | Reste "accepte" (pas de notif)           | Reste inchangé              |
    And l'admin peut choisir indépendamment pour l'invitation ET le RDV si les deux sont impactés
    And ce comportement est identique que ce soit depuis la fiche mission ou le drawer dashboard (US-842)

  Scenario: Infos EDL remontées dans la mission
    Given une mission avec un EDL créé
    Then la fiche mission affiche les données communes :
      | Donnée                  | Source           |
      | Consentement locataire  | EDL.consentement_locataire |
      | Code d'accès            | EDL.code_acces |
      | Statut signature        | EDL.statut     |

  Scenario: Accès aux documents PDF et Web
    Given une mission avec un EDL signé
    Then la section "Documents" affiche pour chaque document (EDL, inventaire) :
      | Document         | Statut | PDF          | Web          | PDF légal     | Web légal     |
      | EDL Entrée       | Signé  | Lien téléch. | Lien web     | Lien téléch.  | Lien web      |
      | Inventaire Entrée| Signé  | Lien téléch. | Lien web     | Lien téléch.  | Lien web      |
    And chaque lien PDF ouvre le téléchargement du fichier
    And chaque lien Web ouvre la version web en lecture seule dans un nouvel onglet
    And les liens ne sont disponibles que si le document est signé (statut = signe)

  Scenario: Mission colocation — Plusieurs EDL sur le même lot
    Given une mission sur un lot en colocation (bails individuels)
    Then la section "Documents" affiche N EDL distincts :
      | Document            | Locataire      | Statut    |
      | EDL Entrée #1       | Marie Martin   | Brouillon |
      | EDL Entrée #2       | Paul Durand    | Brouillon |
      | EDL Entrée #3       | Julie Petit    | Brouillon |
    And un bouton "Ajouter un EDL" permet de créer un EDL supplémentaire (tant que mission non terminée)
    And la duplication d'EDL est une fonctionnalité de l'app tablette (EPIC 5), pas du back-office
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` — base
- `MissionTechnicien` → `Utilisateur` — technicien + `statut_invitation` (en_attente | accepte | refuse)
- `Mission.statut_rdv` — statut du rendez-vous avec le locataire
- `Lot` → `Batiment` → `AdresseBatiment`
- `LotProprietaire` → `Tiers` + `Lot.mandataire_id` → `Tiers`
- `EDL_Inventaire` → `EDLLocataire` → `Tiers`
- `EDL_Inventaire.url_pdf`, `url_web`, `url_pdf_legal`, `url_web_legal` — liens documents générés

---


# Règles métier
- Le statut mission est dérivé des EDL sous-jacents
- Le lot n'est pas modifiable après création
- Les infos EDL sont en lecture seule (modifiables uniquement depuis la tablette)
- **Mission terminée = édition limitée** : date, heure, technicien, statut RDV verrouillés. Seuls le commentaire et le statut de dépôt des clés restent modifiables. Annulation impossible (cf [US-825](https://www.notion.so/3271d95b2f8a81b1a89bcc72394b0423))
- **Pattern d'édition** : CTA "Modifier" → édition inline → "Enregistrer" / "Annuler". Lecture par défaut. Le layout ne change pas entre les deux modes — les valeurs texte deviennent simplement des inputs éditables au même emplacement (bordure/fond léger). Si l'utilisateur quitte avec des modifications non sauvegardées, une modale propose "Enregistrer et quitter" / "Quitter sans sauvegarder". Pattern identique sur toutes les fiches détail (cf US-610).
- La modification de date/heure déclenche un choix de revalidation (même mécanisme que le drawer dashboard US-842)
- Accessible aux admin et gestionnaires

## Colocation (bails individuels)
- 1 mission peut contenir N EDL sur le même lot (1 par colocataire)
- Le back-office permet d'**ajouter un EDL** à la mission (EDL vide, locataire à renseigner)
- La **duplication d'EDL** (copie structure + contenu + photos) est une fonctionnalité exclusive de l'app tablette (EPIC 5), pas du back-office