---
notion_id: "3271d95b-2f8a-8113-a23c-ef06c1f3ec24"
notion_url: "https://www.notion.so/FCR-US831-Page-web-publique-de-consultation-EDL-3271d95b2f8a8113a23cef06c1f3ec24"
last_synced: "2026-03-26T12:56:28.975Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-18T14:33:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "831"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Page web publique de consultation EDL"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81a1-bb6a-d5c2b927d5e5"
  Brique Fonctionnelle: "3131d95b-2f8a-8158-a7f1-e187fd1ba493"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US831 Page web publique de consultation EDL"
  Time Spent Activation: "Non"
---

# FCR - US831 Page web publique de consultation EDL

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 831 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-81a1-bb6a-d5c2b927d5e5 |
| Brique Fonctionnelle | 3131d95b-2f8a-8158-a7f1-e187fd1ba493 |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:33:00.000Z |
| Code | FCR - US831 Page web publique de consultation EDL |
| Time Spent Activation | Non |


# User Story
**En tant que** partie prenante (locataire, propriétaire, mandataire),
**je veux** consulter un EDL signé via un lien web,
**afin de** le lire sans télécharger de PDF.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Page web publique EDL

  Scenario: Consultation via lien
    Given un EDL signé avec url_web générée
    When un utilisateur accède à l'url_web
    Then une page web s'affiche avec :
      | Section           | Contenu                              |
      | En-tête           | Logo workspace, type EDL, date       |
      | Bien              | Adresse, type, surface               |
      | Parties           | Bailleur, locataire, technicien      |
      | Contenu EDL       | Pièces, items, états, photos         |
      | Signatures        | Signatures des parties               |
      | Téléchargement    | Bouton "Télécharger le PDF"           |
    And la page est publique (pas d'authentification)
    And la page est responsive (mobile + desktop)
    And le lien est persistant et non expirant
```

# Règles métier
- Accès public sans auth
- Lien envoyé par email aux parties après signature
- Responsive
- Lien non expirant