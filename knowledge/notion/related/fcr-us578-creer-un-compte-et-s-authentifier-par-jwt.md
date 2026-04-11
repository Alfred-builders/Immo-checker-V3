---
notion_id: "3131d95b-2f8a-81c4-8534-dd208f9a2c2d"
notion_url: "https://www.notion.so/FCR-US578-Cr-er-un-compte-et-s-authentifier-par-JWT-3131d95b2f8a81c48534dd208f9a2c2d"
last_synced: "2026-03-26T12:55:04.824Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-23T13:09:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "578"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Créer un compte et s'authentifier par JWT"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US578 Créer un compte et s'authentifier par JWT"
  Time Spent Activation: "Non"
---

# FCR - US578 Créer un compte et s'authentifier par JWT

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 578 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:50:00.000Z |
| Code | FCR - US578 Créer un compte et s'authentifier par JWT |
| Time Spent Activation | Non |


# User Story
**En tant que** nouvel utilisateur,
**je veux** créer mon compte, me connecter et réinitialiser mon mot de passe,
**afin d'**accéder à ImmoChecker de manière sécurisée.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Authentification complète

  Scenario: Inscription par invitation
    Given un admin a invité "marie@fc.com" avec le rôle "gestionnaire"
    When Marie clique sur le lien d'invitation (email)
    Then elle arrive sur la page d'inscription avec :
      | Champ             | Pré-rempli          |
      | Email             | marie@fc.com (non modifiable) |
      | Nom               |                     |
      | Prénom            |                     |
      | Mot de passe      |                     |
      | Confirmer MDP     |                     |
    And après soumission, son compte est créé et rattaché au workspace
    And elle est redirigée vers le dashboard

  Scenario: Connexion (login)
    Given un utilisateur avec un compte actif
    When il se connecte avec email + mot de passe
    Then un JWT est généré
    And il est redirigé vers le dashboard de son workspace

  Scenario: Connexion multi-workspace
    Given un utilisateur appartenant à 2 workspaces
    When il se connecte
    Then un sélecteur de workspace s'affiche (page dédiée avec logo + nom de chaque workspace)
    And il choisit dans lequel travailler
    And un JWT est généré avec le workspace_id sélectionné

  Scenario: Switch de workspace (header sidebar)
    Given un utilisateur connecté dans le workspace "FlatChecker"
    Then le header de la sidebar affiche le logo + nom du workspace actif
    And un dropdown permet de switcher vers un autre workspace
    When il sélectionne "Agence Versailles"
    Then le JWT est rafraîchi avec le nouveau workspace_id
    And toutes les données sont rechargées (isolation complète)

  Scenario: Expiration du token
    Given un utilisateur connecté avec un access token expiré
    When il fait une action
    Then le refresh token est utilisé silencieusement pour obtenir un nouvel access token
    And l'action se poursuit sans interruption

  Scenario: Refresh token expiré
    Given un utilisateur dont le refresh token (7 jours) a expiré
    When il fait une action
    Then il est redirigé vers la page de login

  Scenario: Lockout après tentatives échouées
    Given un utilisateur qui a échoué 10 tentatives de connexion
    Then le compte est verrouillé pendant 15 minutes
    And un message "Trop de tentatives, réessayez dans 15 minutes" s'affiche

  Scenario: Réinitialisation de mot de passe
    Given un utilisateur sur la page de login
    When il clique "Mot de passe oublié"
    Then il saisit son email
    And un email avec lien de réinitialisation est envoyé (valide 1h)
    And le lien mène vers un formulaire de nouveau mot de passe

  Scenario: Invitation expirée
    Given une invitation de plus de 7 jours
    When l'invité clique sur le lien
    Then un message "Invitation expirée" s'affiche
    And un bouton "Demander une nouvelle invitation" est proposé

  Scenario: Déconnexion
    Given un utilisateur connecté
    When il clique "Se déconnecter"
    Then le JWT est invalidé et il est redirigé vers la page de login
```

---


# Modèle de données impacté
- `Utilisateur` : email (unique), mot_de_passe (hashé), nom, prenom, est_actif, created_at
- `WorkspaceUser` : user_id, workspace_id, role
- `Invitation` : workspace_id, email, role, token, expire_at, est_acceptee

---


# Règles métier
- L'inscription se fait uniquement par invitation (pas d'inscription publique en V1)
- **JWT** : access token courte durée (15-30 min) + refresh token longue durée (7 jours). Refresh silencieux en arrière-plan. Si refresh token expiré → redirect login. Stockage : httpOnly cookie (webapp) / secure storage (mobile).
- Le JWT contient : user_id, workspace_id, role
- **Mot de passe** : min 8 caractères + au moins 1 majuscule + 1 chiffre. Blocage après 10 tentatives échouées (lockout 15 min).
- Le lien de reset expire après 1h
- Les invitations expirent après 7 jours
- Un utilisateur peut appartenir à plusieurs workspaces (1 seul actif à la fois)