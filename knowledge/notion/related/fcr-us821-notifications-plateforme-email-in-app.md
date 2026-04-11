---
notion_id: "3271d95b-2f8a-819f-8230-d8709d29290b"
notion_url: "https://www.notion.so/FCR-US821-Notifications-plateforme-email-in-app-3271d95b2f8a819f8230d8709d29290b"
last_synced: "2026-03-26T12:57:10.381Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-18T14:33:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "821"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Notifications plateforme (email + in-app)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-8198-928c-f11fa16a89de"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US821 Notifications plateforme (email + in-app)"
  Time Spent Activation: "Non"
---

# FCR - US821 Notifications plateforme (email + in-app)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 821 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3271d95b-2f8a-8198-928c-f11fa16a89de |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:33:00.000Z |
| Code | FCR - US821 Notifications plateforme (email + in-app) |
| Time Spent Activation | Non |


# User Story
**En tant que** utilisateur (admin, gestionnaire ou technicien),
**je veux** recevoir des notifications par email et in-app lorsqu'un événement important se produit,
**afin de** réagir rapidement sans devoir vérifier manuellement la plateforme.
> Voir la page dédiée : [Notifications — Spécification](https://www.notion.so/3271d95b2f8a81418819de8b78d33994)

---


# Périmètre V1
- **Email** : canal principal
- **In-app** (cloche) : complément webapp, badge compteur non-lus, dropdown récents
- **Push mobile** : technicien uniquement

---


# Modèle de données
- `Notification` : user_id, type, titre, message, lien, est_lu, created_at