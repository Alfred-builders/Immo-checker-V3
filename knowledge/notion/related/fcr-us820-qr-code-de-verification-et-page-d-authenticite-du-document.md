---
notion_id: "3271d95b-2f8a-815c-84d0-fe7a68deca14"
notion_url: "https://www.notion.so/FCR-US820-QR-code-de-v-rification-et-page-d-authenticit-du-document-3271d95b2f8a815c84d0fe7a68deca14"
last_synced: "2026-03-26T12:56:27.059Z"
created: "2026-03-18T09:40:00.000Z"
last_edited: "2026-03-18T09:40:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "820"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "QR code de vérification et page d'authenticité du document"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81a1-bb6a-d5c2b927d5e5"
  Brique Fonctionnelle: "3131d95b-2f8a-8158-a7f1-e187fd1ba493"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:40:00.000Z"
  Code: "FCR - US820 QR code de vérification et page d'authenticité du document"
  Time Spent Activation: "Non"
---

# FCR - US820 QR code de vérification et page d'authenticité du document

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 820 |
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
| Date de création | 2026-03-18T09:40:00.000Z |
| Code | FCR - US820 QR code de vérification et page d'authenticité du document |
| Time Spent Activation | Non |


# User Story
**En tant que** partie prenante d'un EDL (propriétaire, locataire, mandataire, technicien),
**je veux** pouvoir vérifier l'authenticité d'un document EDL ou inventaire via un QR code intégré au PDF,
**afin de** m'assurer que le document n'a pas été falsifié et de pouvoir le télécharger depuis une page web de confiance.
> **Benchmark** : pattern Nockee ([app.nockee.fr/verify](http://app.nockee.fr/verify)) — QR code dans le PDF renvoyant vers une page minimaliste avec type de document, date, adresse, bouton télécharger, badge scellé électronique.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: QR code de vérification et page d'authenticité

  Scenario: Génération du scellé à la signature
    Given un EDL vient d'être signé par toutes les parties
    When le système verrouille le document
    Then un `verification_token` est généré (hash unique du contenu signé)
    And une `url_verification` est créée (ex : app.immochecker.fr/verify/{token})
    And ces deux champs sont stockés sur `EDL_Inventaire`

  Scenario: QR code intégré dans le PDF généré
    Given un PDF d'EDL est généré après signature
    Then le PDF contient un encadré de vérification :
      | Élément                    | Détail                                   |
      | QR code                    | Encode l'url_verification                |
      | Texte                      | "Ce document est protégé contre la fraude" |
      | Instruction                | "Scannez ce code QR pour vérifier"       |
    And l'encadré est positionné en en-tête de la première page du PDF

  Scenario: Page web publique de vérification
    Given un utilisateur scanne le QR code ou accède à l'url_verification
    Then une page web publique s'affiche avec :
      | Section                    | Contenu                                  |
      | Logo                       | Logo ImmoChecker (ou logo workspace si custom) |
      | Type de document           | "État des lieux d'entrée" / "Inventaire"  |
      | Date de réalisation        | Date de signature formatée               |
      | Adresse du bien            | Adresse complète du lot                  |
      | Bouton télécharger         | Télécharge le PDF                        |
      | Badge sécurité             | "Ce document est protégé contre la fraude grâce à un scellé électronique" |
    And la page ne nécessite PAS d'authentification (accès public)
    And la page est responsive (mobile + desktop)

  Scenario: Vérification d'intégrité
    Given un document dont le contenu a été altéré après signature
    When le système recalcule le hash et le compare au verification_token
    Then la page de vérification affiche un avertissement :
      | "Ce document ne correspond pas au document original signé" |
    And le bouton télécharger est désactivé

  Scenario: Document non signé
    Given un EDL non encore signé (brouillon)
    Then aucun QR code n'est généré
    And l'url_verification est null
```

---


# Modèle de données impacté
**Champs ajoutés sur **`**EDL_Inventaire**` :
- `verification_token` (string) — hash unique du contenu signé, généré à la signature
- `url_verification` (url) — lien public vers la page de vérification
**Aucune nouvelle table.**
Le QR code lui-même n'est pas stocké en base — il est généré dynamiquement dans le PDF à partir de `url_verification`.

---


# Règles métier
- Le `verification_token` est généré uniquement à la signature (pas avant)
- L'`url_verification` est un lien persistant non expirant
- La page de vérification est publique (pas d'auth) mais les informations affichées sont limitées (type, date, adresse — pas de contenu de l'EDL)
- Le PDF légal (`url_pdf_legal`) et le PDF standard (`url_pdf`) contiennent tous deux le QR code
- Le hash couvre le contenu complet du document signé (items, photos, signatures, compteurs)
- Si un avenant est ajouté post-signature, un nouveau token est généré pour l'avenant (le token du document original reste inchangé)

# EPICs concernées
- **EPIC 8** (Signature & Verrouillage Légal) — génération du token et du scellé au moment de la signature
- **EPIC 9** (Génération & Diffusion des Rapports) — intégration du QR code dans le PDF + page web publique de vérification