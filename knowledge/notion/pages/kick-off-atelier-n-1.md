---
notion_id: "3101d95b-2f8a-806f-9397-f09b4d801898"
notion_url: "https://www.notion.so/Kick-off-Atelier-n-1-3101d95b2f8a806f9397f09b4d801898"
last_synced: "2026-03-26T12:53:53.163Z"
created: "2026-02-23T12:41:00.000Z"
last_edited: "2026-03-02T09:00:00.000Z"
properties:
  Builders: "Théo Auzas Mota"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Status: "Pas commencé"
  Name: "Kick off & Atelier n°1 "
---

# Kick off & Atelier n°1 

| Propriete | Valeur |
|-----------|--------|
| Builders | Théo Auzas Mota |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Status | Pas commencé |

> 🎯 **Objectif de l'atelier** : Lever toutes les ambiguïtés fonctionnelles EPIC par EPIC, valider les parcours utilisateurs clés, et produire des réponses suffisamment précises pour alimenter une backlog de features détaillée et lancer le développement sans zones grises.
> ⏱️ **Durée estimée** : 2h — **Participants** : Alfred + équipe Flat Checker (métier/terrain)

---


# 📋 Questions par EPIC

## EPIC 1 — Gestion des Bâtiments & Lots
> 📌 **Scope** : Structure hiérarchique Bâtiment → Lot. L'étage est un champ du lot.
1. Quels sont les **champs obligatoires d'un bâtiment** ? *(nom, adresse, nb étages, syndic, code accès…)*
1. Quels sont les **champs obligatoires d'un lot** ? *(numéro, étage, surface, type de bien, nb pièces, référence cadastrale…)*
1. Un **lot peut-il exister sans bâtiment** ? *(cas des maisons individuelles)* → Impact sur la hiérarchie obligatoire
1. Un **bâtiment peut-il avoir plusieurs propriétaires** ? Ou le propriétaire est-il au niveau du lot uniquement ? → Impact sur la liaison EPIC 2
1. Quels **filtres et tris** sont nécessaires sur la liste des lots ? *(par bâtiment, par ville, par propriétaire, par statut EDL…)*

## EPIC 2 — Gestion des Propriétaires & Locataires
> 📌 **Scope** : Gestion des contacts liés aux biens, liaison avec EDL.
1. Un **propriétaire peut-il posséder plusieurs lots/bâtiments** ?
1. Comment gère-t-on les **co-propriétaires** ? *(plusieurs contacts sur un même lot)*
1. Comment gère-t-on les **colocataires** ? *(plusieurs locataires sur un même lot)* → Impact sur la signature EPIC 8
1. Faut-il un **historique des locataires par lot** ? *(locataire actuel + anciens locataires)*

## EPIC 3 — Gestion des Prestataires (P1)
> ⚠️ **Priorité P1** — À clarifier mais pas bloquant pour le démarrage dev.
1. Quelles **informations sur un prestataire** ? *(nom, contact, SIRET, zone géo, spécialité…)*
1. Un prestataire peut-il **voir la liste des lots du bâtiment** ou uniquement le lot assigné ? → Granularité de l'accès restreint
1. Le prestataire utilise-t-il une interface simplifiée ? Niveau de permission ?
1. **Validation du travail du prestataire** ? Workflow de relecture avant signature ?

## EPIC 4 — Gestion des Templates (EDL & Inventaires)
> 📌 **Scope** : Templates éditables, banque de vocabulaire, items/sous-items, séparation EDL/Inventaire.
1. **Qui peut créer/modifier les templates** ? *(admin uniquement, managers, agents terrain ?)*
1. Faut-il **plusieurs templates par type** ? *(ex: EDL meublé vs EDL vide, inventaire studio vs T4)*
1. Peut-on fournir un **export de la banque de vocabulaire actuelle** d'Immopad ? → Migration et complétude
1. Pour les sous-items : **combien de niveaux maximum** en pratique ? *(ex: Cuisine → Évier → Robinet → Poignée ?)* — Actuellement prévu 2-3 niveaux max
1. Les **sections prédéfinies** (mobilier, couverts, vaisselle…) sont-elles identiques pour tous les types de bien ?
1. Le **template EDL actuel** : quels sont les points à améliorer concrètement ?
1. Le **template inventaire** : en quoi la refonte est-elle nécessaire ? Quels sont les manques actuels ?

---


## EPIC 5 — Saisie EDL / Inventaires sur Tablette
> 🔴 **Cœur opérationnel du produit** — Priorité design #1. La majorité des réponses aux questions terrain alimentent directement cette EPIC.
1. **Duplication intelligente — Mode baguette magique** : concrètement, on garde la structure + items mais on vide états, photos et commentaires ? → Confirmer le comportement exact
1. **Workflow de démarrage** : Sélection lot → Choix template → Saisie ? Ou autre enchaînement ?
1. **Duplication de pièce** : concrètement, un T2 qui devient T3, on duplique une chambre entière avec tous ses items ?
1. **Bulk edit** : faut-il pouvoir appliquer un état/matériau à plusieurs items à la fois ? → Gain de temps potentiel important
1. **Commentaire global pièce vs commentaire par item** : quel est le comportement attendu exactement ? — Le cadrage mentionne un commentaire global, pas d'état général par pièce
1. **Orientation tablette** : paysage uniquement ou portrait aussi ?
1. **Taille minimum de zone de tap** : 44px confirmé ? Contraintes ergonomiques spécifiques ?

## EPIC 6 — Référentiels Métier (Matériaux, États, Dégradations)
> 📌 **Scope** : Référentiels internes issus d'Immopad + expertise Flat Checker, modifiables depuis l'admin.
1. Peut-on obtenir un **export complet des référentiels Immopad** actuels ? *(matériaux, dégradations, états)* → Base de départ pour la V1
1. Ces référentiels sont-ils les **mêmes pour EDL et Inventaire**, ou y a-t-il des différences ?
1. **Qui peut modifier les référentiels** en production ? *(admin uniquement ?)*
1. Faut-il un **historique des modifications** des référentiels ? *(traçabilité légale ?)*
1. Y a-t-il des **référentiels spécifiques par type de bien** ? *(ex: dégradations spécifiques au parquet, à la moquette…)*

---


## EPIC 7 — Gestion des Photos
> 📌 **Scope** : Photos attachées aux éléments, photos d'ensemble + individuelles, association photo-item pour liaison entrée/sortie.
1. **Nombre moyen de photos par EDL** aujourd'hui ? → Pour dimensionner le stockage
1. Y a-t-il un **nombre max de photos par item** souhaité ? Ou illimité ?
1. **Résolution par défaut** : quelle qualité ? *(HD, compressée, configurable par le workspace ?)*
1. Faut-il pouvoir **annoter les photos** ? *(flèches, cercles, texte sur la photo)* → Feature différenciante mais coûteuse
1. **Photo d'ensemble par section** : c'est une photo de la pièce entière, ou de l'élément composé *(ex: tout l'évier)* ?
1. L'**association photo-item** pour la liaison entrée/sortie : comment l'agent associe-t-il une photo à un item sur le terrain ? → UX critique pour le comparatif futur

---


## EPIC 8 — Signature & Verrouillage Légal
> 🔴 **Point bloquant identifié** — La gestion des avenants doit être clarifiée avant le dev.
1. **Qui signe** ? Le locataire + l'agent ? Le propriétaire aussi ?
1. Les deux parties signent-elles **sur la même tablette**, ou chacun sur son device ?
1. Signature avec ou **sans OTP / validation par email** ? → Niveau de sécurité juridique requis
1. **Définition d'un avenant** : modification post-signature ? Document séparé ? Nouvelle version du PDF ?
1. Peut-on **modifier un EDL signé** ? Si oui, quelles modifications sont autorisées ?
1. L'avenant nécessite-t-il une **double signature** ? *(locataire + agent)*
1. L'**EDL original reste-t-il inchangé** quand un avenant est créé ?
1. Cas de **refus de signature** par le locataire : quel est le workflow ?

---


## EPIC 9 — Génération & Diffusion des Rapports
> 📌 **Scope** : PDF, version web, duplication intelligente, liaison items entrée/sortie.
1. Le **PDF doit-il correspondre à un format légal spécifique** ? *(arrêté du 30 mars 2016 ?)* → Contrainte réglementaire à vérifier
1. Le **comparatif entrée/sortie** : est-il dans le scope V1, ou on prépare uniquement la structure de données ? → Impact fort sur le chiffrage
1. **Version web du rapport** : qui y accède ? *(propriétaire, locataire, agent, tous ?)*
1. Faut-il un **aperçu PDF avant signature** ? *(preview sur tablette)*

---


## EPIC 10 — API de Gestion des EDL (Back-office)
> 📌 **Scope** : API REST pour intégration Airtable/back-office, webhooks.
1. Quels sont les **cas d'usage concrets de l'intégration Airtable** ? *(création EDL planifié, récup PDF, synchro contacts ?)* → Définir les endpoints prioritaires
1. Quels **champs doivent transiter** entre Airtable et ImmoChecker ? *(lot, locataire, date, type EDL…)*
1. Faut-il une **synchro bidirectionnelle ou unidirectionnelle** ? *(Airtable → ImmoChecker ? Les deux sens ?)*
1. **Webhooks** : quels événements déclenchent un webhook ? *(EDL créé, démarré, signé, PDF généré ?)*
1. Y a-t-il **d'autres systèmes à intégrer** à terme ? *(CRM, comptabilité, autre SaaS ?)* → Anticiper l'architecture API

---


## EPIC 11 — Multi-workspace, Gestion des Comptes & Archivage
> 📌 **Scope** : Architecture multi-workspace, isolation données, archivage long terme.
1. En V1, y a-t-il **uniquement le workspace Flat Checker** ? Ou un deuxième client en test ? → Déterminer si on isole dès le départ
1. Quels **rôles utilisateurs** dans un workspace ? *(admin, manager, agent terrain, prestataire, lecture seule ?)*
1. **Archivage** : la règle des 10+ ans s'applique-t-elle à tous les documents ? *(EDL + Inventaires + Photos ?)*
1. Faut-il pouvoir **restaurer un document archivé** ? Ou est-ce de la consultation seule ?
1. **Branding par workspace** : le client peut-il personnaliser le logo, les couleurs du PDF ? → Différenciation SaaS

---


## EPIC 12 — Saisie Vocale & IA (P1)
> ⚠️ **Priorité P1** — Différenciant majeur. À clarifier pour estimer le scope réel.
1. La saisie vocale est prévue **avec connexion**. Quid des zones avec mauvais réseau ? *(fallback, mise en file d'attente ?)*
1. Le **format de dictée** attendu : l'agent dicte item par item, ou en flux continu pour toute une section ? → Impact sur le parsing IA
1. **Guide contextuel vocal** : quelles informations l'agent doit-il dicter ? *(quantité → élément → spécificité → état : confirmé ?)*
1. En cas d'**erreur IA** : l'agent corrige manuellement sur l'écran, ou il re-dicte ? → Workflow de correction
1. Objectif : **diviser par 2 le temps**. Quel est le temps actuel mesuré par pièce type ? *(meublé / non meublé)* → Baseline pour mesurer le ROI

---


# ✅ Checklist de sortie — Atelier 1
- [ ] Toutes les questions EPIC 1 à 12 ont une réponse documentée
- [ ] Points bloquants EPIC 8 (avenants) et EPIC 12 (offline vocal) résolus
- [ ] Priorités P0/P1/P2/P3 validées par Flat Checker
- [ ] Liste des référentiels à migrer depuis Immopad identifiée
- [ ] Cas d'usage API / Airtable documentés
- [ ] Rôles utilisateurs définis (admin, agent, prestataire…)
- [ ] Décisions prises documentées pour chaque point bloquant