---
notion_id: "3101d95b-2f8a-809d-b5e3-f43f86d81075"
notion_url: "https://www.notion.so/Document-de-cadrage-amont-3101d95b2f8a809db5e3f43f86d81075"
last_synced: "2026-03-26T12:53:24.150Z"
created: "2026-02-23T12:41:00.000Z"
last_edited: "2026-02-23T12:41:00.000Z"
properties:
  Builders: "Théo Auzas Mota"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Status: "Terminé"
  Name: "Document de cadrage amont"
---

# Document de cadrage amont

| Propriete | Valeur |
|-----------|--------|
| Builders | Théo Auzas Mota |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Status | Terminé |

> 📌 Version 1 — Flat Checker
Produit : Outil interne d’état des lieux & inventaires (tablette + back-office)
Objectif : Remplacer Immopad, fiabiliser les données, fluidifier l’opérationnel, préparer la commercialisation future.

#  🎯 Vision Produit
ImmoChecker est l’outil de création d’états des lieux (EDL) et d’inventaires de Flat Checker, destiné :
- à **optimiser le travail sur le terrain** (application tablette)
- à **fiabiliser les rapports** (EDL, inventaires)
- à **maîtriser les données et le process**
- à **préparer un produit vendu à des agences** (architecture multi-workspace)
- à **s’intégrer au back-office** (via API)
Le produit doit être **“pédagogoique”,** **simple**, **robuste**, et refléter toute l’expertise métier Flat Checker.

# 🧩 EPICs (Grandes Briques Fonctionnelles)
> 📌 

## EPIC 1 — Gestion des Bâtiments & Lots
Structure hiérarchique identique à Immopad : **Bâtiment → Lot**
L’étage est un simple champ du lot (pas un niveau supplémentaire).
Interface beaucoup plus explicite que l’existant.
> 📌 

## EPIC 2 — Gestion des Propriétaires & Locataires
- Gestion des **propriétaires** associés aux bâtiments/lots : nom, contact, informations contractuelles
- Gestion des **locataires** associés aux lots : nom, contact, dates d'entrée/sortie
- Liaison avec les EDL et inventaires
- Interface de recherche et filtres
> 📌 

## EPIC 3 — Gestion des Prestataires (P1)
- Gestion des **prestataires volants** (agents terrain externes)
- Création de comptes prestataires avec accès limité
- Assignation d'EDL/inventaires à réaliser
- Accès restreint aux lots assignés uniquement
> 📌 

## EPIC 4 — Gestion des Templates (EDL & Inventaires)
- Templates séparés (obligation légale)
- Contenu : pièces, équipements généraux, descriptions *(les référentiels matériaux/états/dégradations sont gérés en EPIC 6)*
- Templates éditables par Flat Checker
- Template inventaire à refondre complètement
- Template EDL à améliorer légèrement
- **Banque de vocabulaire exhaustive** par section (mobilier, couverts, vaisselle, ustensiles cuisine, batterie cuisine, électroménager, rangement, literie, linge maison, éclairage, décoration, salle de bain, WC sanitaire, entretien, multimédia, divers)
- Système d'items avec sous-items (ex: évier → robinet, bonde, siphon)
- Templates de sections pré-définies mais customisables
> 📌 

## EPIC 5 — Saisie des EDL / Inventaires sur Tablette
- Mode hors-ligne complet
- Application tablette (iOS/Android)
- **Navigation sur une seule page** avec sections repliables (toggles), pas de sous-pages
- **Navigation par ancres** (scroll automatique vers section)
- Système de sections par pièce (mobilier, couverts, vaisselle, etc.)
- Bouton "+" pour ajouter items/sections custom
- Auto-complétion basée sur la banque de vocabulaire
- Guidage “non bloquant”
- Duplication de pièce (T2/T3/T4)
- Ajout / suppression de pièces
- Aides contextuelles (tips)
- **Commentaire global sur la pièce** (pas d'état général par pièce)
- Support items avec sous-items (2-3 niveaux max)
> 📌 

## EPIC 6 — Référentiels Métier (Matériaux, États, Dégradations)
- Référentiels internes (issus d’Immopad + expertise FC)
- Matériaux : peinture, toile de verre, résine, inox, etc.
- Dégradations : éclats, rayures, oxydation, traces…
- État / aspect : léger, important, mal fixé…
- Ces référentiels sont modifiables depuis l’admin
> 📌 

## EPIC 7 — Gestion des Photos
- Photos attachées à des éléments (pas une galerie globale)
- **Photos d'ensemble par section/élément composé** (ex: évier complet)
- **Photos individuelles par sous-item** (ex: robinet seul)
- Raccourcis photos (photos globales, évier, etc.)
- **Association photo-item pour liaison entrée/sortie** *(utilisé pour les comparatifs EPIC 9)*
- Résolution configurable
- Optimisation PDF / stockage
> 📌 

## EPIC 8 — Signature & Verrouillage Légal
- Signature électronique sur tablette
- Impossibilité de modifier après signature
- Gestion des avenants et signatures associées
> 📌 

## EPIC 9 — Génération & Diffusion des Rapports
- Génération PDF (EDL & Inventaire)
- Version web du rapport (lecture seule)
- Liens persistants (non expirants)
- Bouton « Télécharger PDF » sur la page web
- Structure claire, professionnelle et lisible
- **Duplication intelligente d’EDL complet avec options granulaires** :
  - Garder structure des pièces uniquement
  - Garder contenu des pièces (items)
  - Garder/supprimer commentaires
  - Garder/supprimer photos
  - "Baguette magique" : vider états et commentaires mais garder structure
- **Système de liaison items entrée ↔ sortie** pour comparatifs détaillés *(en prévision de ces développements, s'appuie sur l'association photo-item de l'EPIC 7)*
> 📌 

## EPIC 10 — API de Gestion des EDL (Back-office)
Permettre à Airtable / un SaaS / Automatisation externe de :
- Créer des EDL / Inventaires planifiés à l’avance (avec modèle)
- Récupérer les URLs PDF & Web après signature
- Recevoir un webhook EDL terminé / signé
- API sécurisée par workspace
> 📌 

## EPIC 11 — Multi-workspace, Gestion des Comptes & Archivage
- Préparer la commercialisation future
- Workspace = un client d’ImmoChecker
- Isolation complète des données
- Gestion des utilisateurs par workspace
- **Archivage & Conformité** : règle de rétention S3 (conservation 10+ ans, archivage froid)
> 📌 

## EPIC 12 — Saisie Vocale & IA (P1)
- **Dictée vocale pour saisie des inventaires** (gain de temps majeur)
- Transcription et catégorisation automatique par IA
- Pré-remplissage des items avec relecture/validation manuelle
- Guide contextuel de saisie vocale (quantité → élément → spécificité → état)
- **Fallback manuel** : choix entre vocal ou saisie classique selon préférence utilisateur
- Gestion des corrections vocales en temps réel ("non en fait c'est rouge pas orange")
- Auto-catégorisation dans les bonnes sections (mobilier, couverts, vaisselle, etc.)
- Objectif : **diviser par 2 le temps de saisie** (de 15min à 7-10min par pièce meublée)

# ❓ Points à clarifier au kick-off
> ⚠️ **Points à valider avec Flat Checker avant démarrage du développement**

### EPIC 8 — Gestion des avenants
- [ ] **Définition d'un avenant** : Qu'est-ce qu'un avenant dans le contexte EDL ? (modification post-signature, document séparé, nouvelle version ?)
- [ ] **Workflow avenant** : Peut-on modifier un EDL signé ? Faut-il une double signature sur l'avenant ?
- [ ] **Versioning** : L'EDL original reste-t-il inchangé ? Les avenants sont-ils des PDFs séparés ?
- [ ] **⚠️ Impact chiffrage** : Si workflow avenant complexe (versioning, double signature, PDF séparés), prévoir +1 000 - 2 000€ sur EPIC 8

### EPIC 12 — Saisie Vocale & IA
- [ ] **Gestion hors-ligne** : La saisie vocale nécessite-t-elle une connexion ? Ou transcription locale possible ?
→ Pour le moment prévue avec connexion

#  🗂️ Features
📊 **Sous-database:** Features (1)

#  🗂️ Design / Mockups prioritaire à faire

## `Back-office`
Dans l’ensemble des modules à concevoir, la **priorité absolue en termes de maquettage, prototypage et itération UX** doit être portée sur **l’interface de saisie sur tablette lors de la réalisation d’un état des lieux**. C’est la zone où se concentrent à la fois la plus grande complexité fonctionnelle, les plus fortes attentes utilisateurs, et surtout **le potentiel de gain de temps le plus élevé** pour Flat Checker.
L’objectif est de repenser en profondeur : la navigation entre pièces, la structure des éléments, la prise de photos reliée aux bons items, le bulk edit, la reprise de position, les raccourcis, la saisie des états/aspects/matériaux, ainsi que les micro-interactions qui feront gagner littéralement des minutes par EDL.
Cela ne signifie pas que les autres modules sont secondaires, **la gestion des bâtiments & lots**, **la création des templates**, et **la planification des EDL** sont indispensables et doivent être robustes dès la V1. Cependant, leur complexité UX est plus faible :
- pour **bâtiments & lots**, j’ai déjà commencé à prototyper une interface (cf ci-dessous)
- pour **la planification des EDL**, les patterns sont relativement standard (tableau, filtres, formulaire de création) ;
- pour **les templates**, un éditeur WYSIWYG (ou une vue calquée sur l’interface tablette réembarquée) permettra de capitaliser sur le design et les interactions de la tablette.
En résumé, nous devons concentrer nos efforts de design et d’itération sur l’interface **tablette,** cœur opérationnel du produit, tout en maintenant des modules back-office complets, mais dont la structure UX est plus conventionnelle et donc plus rapide à cadrer.
[Video](https://www.loom.com/share/bd7dd7e9a7f84855a268d1cd136fa2ed)

## `Tablette`
**Approche de prototypage** : Navigation sur une seule page avec scroll et sections repliables (toggles). L'objectif est d'éliminer la multiplication des sous-pages qui ralentit actuellement le travail sur le terrain.
**Éléments clés du prototype** :
- **Sidebar de navigation** : Liste des pièces avec scroll automatique vers la section sélectionnée (navigation par ancres)
- **Sections par catégorie** : Catégories pré-définies (mobilier, couverts, vaisselle, ustensiles cuisine, batterie cuisine, électroménager, rangement, literie, linge maison, éclairage, décoration, salle de bain, WC sanitaire, entretien, multimédia, divers)
- **Items avec auto-complétion** : Saisie facilitée par suggestions basées sur la banque de vocabulaire
- **Photos associées aux items** : Prise de photo directement liée à chaque élément pour faciliter les comparatifs entrée/sortie
- **Items avec sous-items** : Support des éléments composés (ex: Évier → Robinet, Bonde, Siphon) avec photo d'ensemble + photos individuelles
- **Guidage non-bloquant** : Suggestions visuelles sans empêcher la progression de l'utilisateur
L'interface doit être optimisée pour tablette en mode paysage avec des zones de tap généreuses (minimum 44px) et des animations fluides pour les transitions.
[Video](https://www.loom.com/share/60ba466f022246b89ba8ea4c9e7ef25b)

#  🧑‍💻 Stack d’outils
Le choix de la stack technique sera **déterminé une fois l'architecture et le maquettage finalisés**. Cette décision permettra d'arbitrer entre vélocité de développement, maintenabilité long terme, et capacité à répondre aux besoins spécifiques identifiés lors de la phase de design.
Deux options techniques sont envisagées :

## Option 1 — Stack Low-code
> ⚡ **Base de données** : Xano ou Supabase
**Back-office (web admin)** : WeWeb
**Application tablette** : FlutterFlow

### Avantages
- **Vélocité de développement** : Prototypage et itérations rapides, idéal pour tester et ajuster l'UX
- **Time-to-market** : Mise en production accélérée pour répondre rapidement aux besoins opérationnels de Flat Checker
- **Coût de développement initial** : Réduction significative du temps de développement
- **Maintenabilité visuelle** : Interface de gestion accessible pour des ajustements futurs sans intervention développeur
- **Mode hors-ligne natif** : FlutterFlow offre des capacités hors-ligne robustes essentielles pour le terrain

### Contraintes
- **Limitations fonctionnelles** : Certaines features complexes (ex: saisie vocale IA, gestion fine des sous-items) peuvent nécessiter du code custom
- **Scalabilité** : Performances à valider en cas de forte montée en charge (commercialisation multi-workspace)
- **Personnalisation UX** : Contraintes sur certaines micro-interactions spécifiques

## Option 2 — Stack Full Code
> 💻 **Base de données** : Xano ou Supabase
**Back-office (web admin)** : Code (Vue.js, Next.js ou autre framework moderne)
**Application tablette** : Code natif ou cross-platform (React Native, Flutter, ou PWA)

### Avantages
- **Flexibilité totale** : Contrôle complet sur l'UX, les micro-interactions et les fonctionnalités avancées
- **Performance optimisée** : Optimisation fine du mode hors-ligne, de la gestion des photos et de la synchronisation
- **Scalabilité** : Architecture maîtrisée pour supporter la commercialisation et le multi-workspace
- **Intégration IA** : Implémentation de la saisie vocale et du parsing IA sans contraintes
- **Pérennité** : Pas de dépendance à des plateformes propriétaires, évolutions techniques maîtrisées

### Contraintes
- **Maintenance** : Responsabilité complète sur les mises à jour et évolutions techniques
- **Technicité plus importante**

## Éléments communs aux deux options
Quelle que soit l'option retenue :
- **Base de données** : Xano ou Supabase (choix final selon besoins d'API, authentification, stockage fichiers)
- **Stockage photos** : S3-compatible (R2 Cloudflare, AWS S3, Supabase Storage)
- **Génération PDF** : Service dédié (ex: Gotenberg, Puppeteer, ou API spécialisée)
- **API REST** : Architecture API-first pour intégration avec le back-office existant (Airtable)
- **Authentification** : JWT avec gestion des workspaces et permissions

## Critères de décision
Le choix entre les deux options sera arbitré selon :
1. **Complexité UX validée** : Si le maquettage révèle des besoins d'interactions très spécifiques → Option 2
1. **Budget et ressources** : Arbitrage entre investissement initial et coût de maintenance long terme
1. **Vision commerciale** : Si commercialisation rapide multi-clients → Option 2 pour la scalabilité à moyen termes
La décision sera prise ensemble **après validation des maquettes et architecture détaillée.**

# 📊 ROI / Business Case
ImmoChecker représente un investissement. Voici les retours sur investissement attendus sur deux axes : **l'optimisation opérationnelle** et **la commercialisation en SaaS**.

## 1️⃣ ROI Opérationnel — Gains pour Flat Checker
> ⏱️ **Objectif : Réduire le temps terrain et la charge mentale des agents**

### Hypothèses de calcul
| **Paramètre** | **Valeur actuelle** | **Valeur cible** |
| Nombre d'EDL & inventaires / mois | ~100-150 | - |
| Temps moyen par EDL meublé complet | ~1h30 - 2h | ~45min - 1h |
| Temps moyen par pièce (inventaire) | ~15 min | ~7-10 min (avec EPIC 12) |
| Coût horaire agent terrain (chargé) | ~25-30€/h | - |
| Licence Immopad actuelle | ~300-500€/mois ? | ~200-300€/mois (hébergement) |

### Gains estimés
| **Type de gain** | **Estimation mensuelle** | **Estimation annuelle** |
| **Gain de temps terrain**
100 EDL × 45min économisées = 75h/mois | 75h × 25€ = **1 875€** | **22 500€** |
| **Réduction erreurs & litiges**
Problème API récurrents, Photos liées aux items, comparatifs auto | Difficilement chiffrable | **Plusieurs milliers €** |
| **Total gains opérationnels** | **~2 000 - 2 500€/mois** | **~25 000 - 30 000€/an** |
> ✅ **Rentabilité estimée : ~2,5 - 3 ans** sur le P0 (~76k€), sans compter la revente SaaS
Avec le CII (15-20k€ récupérés) → **Rentabilisé en ~2 ans**

### Gains qualitatifs (charge mentale)
- ✅ **Interface intuitive** : fini les clics multiples et sous-pages d'Immopad
- ✅ **Maitrise de son soft** - non dépendant d’Immopad
- ✅ Prépare pour les c**omparatifs automatiques **: moins de temps de comparatif ops
- ✅ **Photos liées aux items** : preuves incontestables, moins de litige, facilitent les comparatifs.
- ✅ **Duplication intelligente** : un T2 devient un T3 en 2 clics

## 2️⃣ ROI Stratégique — Commercialisation SaaS
> 💰 **Objectif : Transformer ImmoChecker en produit vendu à d'autres acteurs**

### Modèle économique envisagé
| **Élément** | **Hypothèse** |
| Cible | Agences immobilières, administrateurs de biens, gestionnaires locatifs |
| Pricing SaaS | **150 - 300€/mois** par workspace (selon volume EDL) |
| Modèle | Abonnement mensuel + volume (EDL supplémentaires) |
| Différenciation | UX terrain supérieure, saisie vocale IA, architecture moderne |

### Projections de revenus
| **Horizon** | **Nb clients** | **Revenu mensuel** | **Revenu annuel** |
| Année 1 | 10 clients | 2 000€ | 24 000€ |
| Année 2 | 50 clients | 10 000€ | **120 000€+** |
| Année 3 | 100+ clients | 20 000€ | **240 000€+** |
> 🚀 En prenant uniquement la projection de revenu ci-dessus, le projet se rentabilise en un peu plus d’1 an.

→ *Le marché français compte plus de 30 000 agences et administrateurs de biens. Même avec 1% de pénétration (300 clients), ImmoChecker générerait 60 000€/mois de revenus récurrents.*

### Avantages compétitifs pour la commercialisation
- **UX pensée terrain** : conçu par des experts EDL (vous), pas par des développeurs
- **Saisie vocale IA** : différenciant majeur vs Immopad et concurrents
- **Architecture multi-workspace native** : prêt pour le SaaS dès le départ

#  :calendar-alfred: Calendrier projet.
📊 **Sous-database:** New database

#  :sign-alfred: Proposition commerciale.
> 💡 `**Forfait**`
Vous devenez propriétaire de votre outil et gérez directement les abonnements aux outils tiers (hébergement, services externes, etc.).
Nous réalisons l’intégration complète et la mise en place du produit.
En cas de besoin de **maintenance, support ou évolutions**, nous pouvons ensuite vous accompagner **en régie (au temps passé)**, selon vos besoins ponctuels.
| **Scope** | Montant HT | **Détails** |
| **EPIC 1 - Gestion des Bâtiments & Lots** | 3 500€ | → Structure hiérarchique Bâtiment → Lot
→ Interface de création et gestion
→ Champs configurables (étage, type, etc.) |
| **EPIC 2 - Gestion des Propriétaires & Locataires** | 2 000€ | → Gestion propriétaires (nom, contact, infos contractuelles)
→ Gestion locataires (nom, contact, dates entrée/sortie)
→ Liaison avec EDL et inventaires |
| **EPIC 3 - Gestion des Prestataires** (P1) | 2 500€ | → Comptes prestataires 
→ Assignation d'EDL/inventaires
→ Accès restreint aux lots assignés |
| **EPIC 4 - Gestion des Templates (EDL & Inventaires)** | 4 000€ | → Templates EDL et Inventaires séparés
→ Banque de vocabulaire exhaustive (14 catégories)
→ Système items/sous-items
→ Templates éditables depuis admin |
| **EPIC 5 - Saisie EDL/Inventaires sur Tablette** | 20 000€ | → Application tablette iOS/Android
→ Navigation une page avec toggles
→ Auto-complétion vocabulaire
→ Sections par catégorie
→ Mode hors-ligne complet
→ Duplication de pièces |
| **EPIC 6 - Référentiels Métier** | 3 000€ | → Gestion matériaux (peinture, toile de verre, inox, etc.)
→ Gestion dégradations (éclats, rayures, oxydation, etc.)
→ Gestion états/aspects |
| **EPIC 7 - Gestion des Photos** | 3 000€ | → Photos attachées aux items
→ Photos d'ensemble + photos individuelles sous-items
→ Association photo-item pour liaison entrée/sortie
→ Optimisation stockage et PDF |
| **EPIC 8 - Signature & Verrouillage Légal** | 2 000€ | → Signature électronique sur tablette
→ Verrouillage post-signature
→ Gestion des avenants et signatures associées |
| **EPIC 9 - Génération & Diffusion des Rapports** | 6 000€ | → Génération PDF (EDL & Inventaire)
→ Version web du rapport (lecture seule)
→ Duplication intelligente (options granulaires)
→ Système liaison items entrée/sortie
→ Mode "Baguette Magique" |
| **EPIC 10 - API de Gestion des EDL** | 4 500€ | → API REST pour intégration Airtable/back-office
→ Création EDL/Inventaires programmatique
→ Webhooks (EDL terminé/signé)
→ Récupération URLs PDF & Web |
| **EPIC 11 - Multi-workspace, Gestion des Comptes & Archivage** | 4 000€ | → Architecture multi-workspace
→ Isolation complète des données
→ Gestion utilisateurs par workspace
→ Authentification JWT + permissions
→ Règle de rétention S3 (archivage 10+ ans) |
| **EPIC 12 - Saisie Vocale & IA** (P1) | 14 000 | → Dictée vocale pour inventaires
→ Transcription + parsing IA
→ Catégorisation automatique
→ Pré-remplissage avec validation
→ Objectif : diviser par 2 le temps de saisie
*(voir détail ci-dessous)* |
| Maquettage & Prototypage | 3 750€ |  |
| Phase de QA et améliorations | 5000€ | Phase comprenant : 
→ Phase de test finale (Quality Assurance)
→ Phase de retour de votre part (1 semaine)
→ Implémentations des retours priorisés |
| Gestion de projet Alfred (Manager, Synchro Hebdo) | 9800€ | → Accompagnement d'un Manager / Tech lead
→ Accompagnement projet global (Meeting, CR, Support) |
| Documentation technique & fonctionnelle | 5000€ | → Documentation technique permettant de reprendre le projet et assurer son évolution / maintenance
→ Documentation fonctionnelle pour les utilisateurs finaux |
| Onboarding & Formation | 750€ | → Préparation de l'onboarding
→ 2h d'onboarding par équipe concernée
→ Suivi et Q&A les premiers jours post mise en production |
| Hébergement de la solution / coûts des outils | À votre charge | → Environ 200-300€/mois en fixe (BDD, stockage, hosting)
→ + tokens IA selon usage (si EPIC 10 implémenté) |
| **Total P0 complet** | **76 300€** | EPICs P0 (52 000€) + Maquettage (3 750€) + QA + Gestion projet + Doc + Onboarding |
| **Total P0 + P1 complet** | **90 300€** | Total P0 + EPIC 3 (2 500€) + EPIC 12 (12 000-15 000€) |

## 🏛️ Subventions & Crédit d'Impôt Innovation (CII)
> 💰 **Bonne nouvelle : ce projet est éligible au Crédit d'Impôt Innovation (CII)**
`**Contexte Alfred**`
Nous sommes actuellement en cours d'obtention de l'**agrément CII** pour notre activité. Pour constituer notre dossier d'agrément, nous allons utiliser le projet ImmoChecker comme cas d'usage.
`**Ce que ça signifie pour vous**`
- **Dossier réutilisable** : Le dossier que nous allons constituer pour notre agrément pourra être réutilisé quasi tel quel pour votre demande de CII
- **Économie** : Cela vous fera économiser environ **3 000 - 4 000€** de frais de rédaction via un organisme dédié
- **Gain estimé** : Sur un projet de ce type, vous pourriez récupérer entre `**15 000 et 20 000€**`` de crédit d'impôt`
- Rétroactivité : À explorer : possibilité de récupérer rétroactivement le CII sur les travaux déjà réalisés sur la partie **comparatif EDL entrée/sortie** en 2025.
`**Partenaire**`
Nous passons par **Finalli** pour notre agrément. Après plusieurs échanges avec eux, nous avons validé les mécaniques et cette estimation.

### Détail chiffrage EPIC 12 — Saisie Vocale & IA
| **Brique technique** | **Estimation** | **Description** |
| Transcription vocale | 1 500 - 2 500€ | Intégration API (Whisper/Deepgram), enregistrement audio, envoi et réception |
| Parsing IA + prompt engineering | 3 000 - 5 000€ | Extraction : quantité, élément, spécificité, état. Gestion edge cases, fallback |
| Interface vocale | 2 000 - 3 000€ | Bouton enregistrement, feedback visuel temps réel, visualisation transcription, validation items |
| Corrections temps réel | 2 000 - 3 000€ | Détection des corrections ("non en fait..."), mise à jour des items, annulation |
| Auto-catégorisation (14 sections) | *Inclus parsing* | Classement automatique dans : mobilier, couverts, vaisselle, électroménager, etc. |
| Tests, itérations & marge imprévus | 3 000 - 3 500€ | Fine-tuning prompts, ajustements UX post-tests terrain, edge cases |
| **Total EPIC 12** | **12 000 - 15 000€** | *Fourchette selon complexité des corrections temps réel et fine-tuning requis* |