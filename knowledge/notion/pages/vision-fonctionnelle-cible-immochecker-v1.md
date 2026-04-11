---
notion_id: "3131d95b-2f8a-8146-af90-c1a3bb0ac08f"
notion_url: "https://www.notion.so/Vision-Fonctionnelle-Cible-ImmoChecker-V1-3131d95b2f8a8146af90c1a3bb0ac08f"
last_synced: "2026-03-26T12:51:34.539Z"
created: "2026-02-26T15:32:00.000Z"
last_edited: "2026-03-23T13:28:00.000Z"
properties:
  title: "🎯 Vision Fonctionnelle Cible — ImmoChecker V1"
---

# 🎯 Vision Fonctionnelle Cible — ImmoChecker V1

| Propriete | Valeur |
|-----------|--------|


# Vision Produit
> 📌 **ImmoChecker** est l'outil de création d'états des lieux (EDL) et d'inventaires de Flat Checker, destiné à optimiser le travail terrain, fiabiliser les rapports, maîtriser les données et préparer la commercialisation SaaS.
> ⚠️ **ImmoChecker n'est pas un logiciel de gestion locative.** L'occupation des logements n'est pas gérée (un EDL d'entrée peut être fait par FC et la sortie par un autre prestataire). Les informations "dernier locataire" sont informatives, pas un statut d'occupation fiable. La gestion locative pourra être envisagée en V2 pour les workspaces agence/bailleur si le besoin est confirmé.

---


# 3 Profils de Workspace

## 🏢 Société EDL *(ex: FlatChecker)*
Cas le plus complexe. La société reçoit des demandes d'agences immobilières, planifie des missions, assigne des techniciens (internes ou externes), et réalise les EDL pour le compte de tiers.
**Flux type** : Demande agence → Validation → Mission créée → Technicien assigné → EDL réalisé sur tablette → Signature → PDF envoyé
**Acteurs** : Admin, Gestionnaire, Technicien (interne), Prestataire (externe)
**Spécificité** : onglet Mandataire visible (tiers agences), gestion des prestataires externes

## 🧑 Bailleur Direct *(ex: Tony)*
Cas simplifié. Le bailleur gère ses propres biens et réalise lui-même les EDL. Pas de mandataire, pas de mission nécessaire.
**Flux type** : Création bâtiment/lot → Création EDL directe → Saisie tablette → Signature → PDF
**Acteurs** : Admin-bailleur (rôle unique)
**Spécificité** : EDL sans mission possible, onglet Mandataire masqué

## 🏠 Agence Immobilière *(gestion interne)*
L'agence gère son parc immobilier et réalise les EDL en interne ou via des prestataires.
**Flux type** : Gestion du parc → Mission planifiée → Agent assigné → EDL réalisé → Signature → PDF
**Acteurs** : Admin agence, Agent de location, Prestataire externe (optionnel)
**Spécificité** : onglet Mandataire masqué (l'agence est elle-même le mandataire)

---


# Architecture Fonctionnelle

## Lot 1 — Back-office / Webapp
Tout ce qui doit exister avant qu'un technicien ouvre sa tablette. Gestion du patrimoine, planification, configuration, administration.
| EPIC | Nom | Priorité | Périmètre clé |
| 11 | Multi-workspace, Auth, Comptes & Paramètres | P0 | JWT, WorkspaceUser, rôles, page Paramètres (infos workspace, utilisateurs, invitations), point d'entrée Templates/Catalogue/Référentiels |
| 1 | Bâtiments & Lots | P0 | Page "Parc immobilier" (vue tableau + vue carte), drill-down bâtiment → lots, record picker enrichi, fiches détail éditables, barre de recherche + filtres rapides. ~~Compteurs retirés de la fiche lot~~ (gérés côté EDL tablette). |
| 2 | Gestion des Tiers | P0 | Table unique Tiers, onglets par type (Proprio/Locataire/Mandataire/Tous) avec colonnes dynamiques et colonne agrégée "Nom / Raison sociale", fiches détail avec sections conditionnelles par rôle (multi-rôle supporté), TiersOrganisation pour PM, barre de recherche + filtres dropdown. Locataire : historique complet lots (pas "lot actuel"). |
| 4 | Templates, Catalogue & Référentiels (ex-EPIC 4+6 fusionnées) | P0 | TypePiece, CatalogueItem (~155 items), ConfigCritereCategorie (8 critères × 4 niveaux), TemplatePieceItem, ValeurReferentiel (tags par item), 3 niveaux (plateforme → workspace → terrain), aides contextuelles. Onglets EDL | Inventaire dans le détail pièce. |
| 13 | Missions & Planification | P0 | Formulaire modal + record picker enrichi + type de bail (individuel/collectif), vue Kanban (sans drag & drop), vue carte/map, stat cards "Actions en attente", page détail mission avec verrouillage post-terminaison, CleMission (edl_id, 3 statuts, photos), IndisponibiliteTechnicien (créneaux + récurrence), auto-terminaison, filtres dropdown compacts |
| 14 | Dashboard | P0 | Admin (webapp) : stat cards (EDL du mois, Actions en attente, À venir) + calendrier semaine (cartes pastels) + mini-cal mensuel + bloc Actions en attente + drawer latéral + bouton "+" (mission/indispo). Indispos avec créneaux horaires, récurrence, popup au clic. Verrouillage drawer si mission terminée. Technicien (app mobile, EPIC 5) : stats + calendrier + checklist clés |
| 16 | Composants Transverses | P0 | Colonnes configurables, filtres dynamiques type Notion, **filtres rapides en dropdown compact** (pattern transversal), recherche globale (Ctrl+K), compacité tableaux, voyant alerte orange (actions en attente). ~~Édition inline retirée~~ (logique de transition trop complexe). |
| 10 | API Back-office | P0 | API REST (CRUD Missions, EDL auto-générés, colocation), API keys par workspace, webhooks (edl.signed, mission.terminee, etc.), documentation OpenAPI/Swagger. Respecte auto-terminaison + verrouillage + blocage annulation. Accès via Paramètres > API & Intégrations. |
| 3 | Gestion Prestataires | P0 | Absorbée dans EPIC 11/13. Pas de `tiers_id` ni `is_externe` sur WorkspaceUser. Tous les techniciens = Users avec role="technicien". Table Tiers = stakeholders lot. Société réalisatrice = Workspace. Scoping uniforme V1. |
| 15 | Contrôle Qualité | V2 | Reporté V2. Focus : rating locataire du technicien (type Uber) + prise de notes admin optionnelle/aléatoire |

## Lot 2 — Saisie Terrain & Production
L'expérience tablette de bout en bout.
| EPIC | Nom | Priorité | Périmètre clé |
| 5 | Saisie EDL/Inventaires Tablette & Photos (ex-EPIC 5+7 fusionnées) | P0 | Navigation une page avec toggles, auto-complétion, PieceEDL, EvaluationItem (self-ref), duplication pièces, mode hors-ligne. Photos attachées aux items/pièces, stockage S3, compression, raccourcis photo, association photo-item pour comparatifs V2. **Duplication EDL** (colocation) : fonctionnalité exclusive tablette (pas dans le back-office). |
| 8 | Signature & Verrouillage Légal | P0 | Signature manuscrite tablette, verrouillage post-signature, scellé électronique (verification_token), avenants |
| 9 | Génération & Diffusion Rapports | P0 | PDF avec QR code vérification (benchmark Nockee), page web publique d'authenticité, version web lecture seule, duplication intelligente, baguette magique, liaison entrée/sortie |
| 12 | Saisie Vocale & IA | P1 | Dictée vocale inventaires, parsing IA, auto-catégorisation, objectif ÷2 temps de saisie |

---


# Navigation Back-office

## Menu Admin / Gestionnaire
```javascript
📊 OPÉRATIONNEL
  ├── Tableau de bord (EPIC 14)
  └── Missions (EPIC 13)

📁 RÉFÉRENTIEL
  ├── Parc immobilier — Bâtiments & Lots (EPIC 1)
  └── Tiers (EPIC 2)

⚙️ ADMINISTRATION
  ├── Paramètres (EPIC 11)
  │   ├── Informations workspace
  │   ├── Utilisateurs & Rôles
  │   ├── Templates / Pièces (EPIC 4)
  │   ├── Catalogue d'items (EPIC 4)
  │   ├── Paramétrage Critères (EPIC 4)
  │   └── Référentiels / Tags (EPIC 4, ex-6)
  └── API & Intégrations (EPIC 10)
```

## Technicien = App mobile uniquement
> 📱 **Le technicien n'a accès qu'à l'application mobile/tablette.** Pas d'interface desktop. Décision validée meeting client 18/03/2026.
L'app mobile/tablette du technicien couvre : dashboard personnel (stats + calendrier + checklist clés), missions assignées (accepter/refuser), navigation GPS, saisie EDL, signature.

---


# Cycles de vie

## Mission
`Planifiée` → `Assignée` → `Terminée` | `Annulée`
- Planifiée : mission créée, pas de technicien
- Assignée : technicien assigné (peut accepter/refuser)
- **Terminée (auto)** : passage automatique quand **tous les EDL liés** sont signés. En colocation (N EDL), attend le dernier signé. Pas de passage manuel.
- Annulée : annulation avant réalisation (motif obligatoire). **Bloquée si mission terminée** (EDL signés = documents légaux).
**Verrouillage post-terminaison** : date, heure, technicien, statut RDV passent en lecture seule. Seuls le commentaire et le statut de dépôt des clés restent modifiables. Appliqué sur la fiche mission, le drawer, et le tableau.

## EDL / Inventaire
`Brouillon` → `Signé` | `Infructueux`
- Brouillon : en cours de saisie sur tablette
- Signé : toutes les parties ont signé, document verrouillé, QR code et PDF générés
- Infructueux : EDL non réalisé (locataire absent, problème accès…) avec motif obligatoire

## Avenant (post-signature)
Le locataire dispose de 10 jours pour émettre des réserves sur un EDL d'entrée (article 3-2 loi du 6 juillet 1989). Un avenant est un document lié à l'EDL original via `avenant_parent_id`.

---


# Chaîne de Signature
Le document EDL final porte :
1. **Bailleur** (Tiers, propriétaire du lot — via `LotProprietaire`)
1. **Représenté par** (Tiers, agence mandataire — via `Lot.mandataire_id`, optionnel)
1. **Réalisé par** (dérivé du **Workspace** : `Workspace.nom`, `Workspace.siret`, `Workspace.adresse`)
1. **Technicien** (User, signe physiquement)
1. **Locataire** (Tiers, via `EDLLocataire` — entrant ou sortant, ou représentant avec procuration)
Signature manuscrite sur tablette. **Scellé électronique** : un `verification_token` (hash du contenu signé) est généré à la signature. Un QR code intégré au PDF renvoie vers une page publique de vérification d'authenticité (`url_verification`). Benchmark : Nockee ([app.nockee.fr/verify](http://app.nockee.fr/verify)).

---


# Webapp vs Tablette — Périmètre des données
> 📋 La webapp ne descend **jamais en dessous du niveau **`**EDL_Inventaire**`. Les données de saisie terrain (pièces, items évalués, relevés compteurs) sont consultables uniquement via le **PDF/Web généré**. Le back-office pilote et consulte, la tablette saisit.
| Donnée | Webapp | Tablette |
| Bâtiment, Lot, Tiers | ✅ CRUD | ✅ Lecture |
| Mission, Assignation | ✅ CRUD | ✅ Accepter/refuser + voir |
| CompteurLot | ✅ Fiche lot (type, n°, emplacement) | ✅ Lecture |
| ReleveCompteur, ValeurReleve | ❌ (saisie terrain) | ✅ CRUD |
| EDL_Inventaire (statut, URLs) | ✅ Lecture | ✅ CRUD |
| PieceEDL, EvaluationItem | ❌ (saisie terrain) | ✅ CRUD |
| CatalogueItem, TypePiece | ✅ Paramètres admin | ✅ Lecture |
| ConfigCritere* | ✅ Paramètres admin | ✅ Lecture |
| PDF / version web | ✅ Consultation + téléchargement | ✅ Post-signature |
| CleMission (clés) | ✅ Consultation + modification statut dépôt (admin) | ✅ CRUD (saisie terrain + confirmation dépôt) |
| Duplication EDL (colocation) | ❌ (exclusive tablette) | ✅ Duplication structure + contenu + photos |

---


# Responsive
> 📱 **Webapp** : responsive web + tablette + mobile. **App mobile native** : responsive tablette + mobile (iOS + Android). Tous les développements front doivent être responsive dès la V1.

---


# ROI Attendu
- **Gain opérationnel** : ~25 000 - 30 000€/an (réduction temps terrain)
- **Rentabilité** : ~2-3 ans sur le P0, ~2 ans avec CII
- **Commercialisation SaaS** : 150-300€/mois/workspace, objectif 100+ clients en année 3

---


# Points ouverts (à traiter avec FC)
> ⚠️ **Critères par catégorie vs par item** : proposition validée côté Alfred (ConfigCritereCategorie + ConfigCritereItem pour overrides). En attente confirmation Flat Checker.
> ⚠️ **Version standard vs légale du rapport PDF** : faut-il 2 versions (document de travail + document contractuel annexé au bail) ou un seul format ? 4 URLs dans le data model en attendant (url_pdf, url_web, url_pdf_legal, url_web_legal). Benchmark Immopad : fait la distinction.
> ✅ **Contrôle Qualité (EPIC 15) → V2** : review admin optionnelle/aléatoire (pas systématique). Focus V2 : rating locataire du technicien (type Uber). Review locataire interactive pour avenants → V2+.
> ✅ **Gestion des clés (résolu 20/03/2026)** : `CleMission` liée à l'EDL (`edl_id`, pas mission_id — colocation). 3 statuts : `remise` (entrée, documentaire), `a_deposer` / `deposee` (sortie, workflow dépôt). Photos par clé (entity_type = `cle`). Type de clé (7 valeurs enum) + quantité + lieu de dépôt (texte libre). Modifiable admin webapp + technicien mobile. Cf [US-822](https://www.notion.so/3271d95b2f8a810cb29cf28899dba1de). V2 : historique mouvements, récupération en amont.
> ⚠️ **Avenants** : workflow précis (modification post-signature, double signature, versioning). Impact chiffrage si workflow complexe.
> ✅ **Technicien = mobile uniquement** (validé 18/03/2026). Pas d'interface desktop pour le technicien.