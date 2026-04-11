---
notion_id: "3261d95b-2f8a-810c-91e2-e413f0c8b6c4"
notion_url: "https://www.notion.so/Synth-se-retours-prototype-Back-office-Mars-2026-3261d95b2f8a810c91e2e413f0c8b6c4"
last_synced: "2026-03-26T12:52:37.169Z"
created: "2026-03-17T16:20:00.000Z"
last_edited: "2026-03-23T12:10:00.000Z"
properties:
  title: "Synthèse retours prototype Back-office — Mars 2026"
---

# Synthèse retours prototype Back-office — Mars 2026

| Propriete | Valeur |
|-----------|--------|

> **Contexte** : Flat Checker a reviewé le premier prototype du back-office ImmoChecker (looms du 17 mars 2026). Ce document synthétise leurs retours, les positions d'Alfred, les décisions prises, les fonctionnalités à prévoir, et les questions ouvertes à discuter.

---


# 1. Tableau de bord (Admin)

## Retours Flat Checker
- **Cadre missions** : garder uniquement "à assigner" et "à venir" — retirer planifiées / en cours / terminées
- **Cadre inventaire** : suppression totale (jugé peu utile)
- **Cadre EDL** : conservé
- **Section détail** (missions à assigner, activités récentes) : tout remplacer par un **calendrier des missions** — vue jour, 3-4 jours, ou semaine selon filtre choisi

## Position Alfred
- Aligné sur l'optimisation du cadre mission et le calendrier
- **Point d'attention** : les "missions à assigner" portent des actions critiques (mission sans technicien, mission refusée par un technicien). Ne pas perdre cette visibilité en les retirant du dashboard.
- **Proposition** : conserver des **badges d'alerte cliquables** en haut du dashboard (style notification) pour les actions urgentes, et le calendrier en dessous pour la vue planning. Ça satisfait FC (plus de cadre lourd) tout en conservant la visibilité opérationnelle.

## Décisions
- [x] Cadre missions : renommé **"Actions en attente"** (couvre assignation + invitation technicien + RDV à confirmer)
- [x] Cadre inventaire : supprimé
- [x] Cadre EDL : conservé ("EDL du mois")
- [x] Remplacement section détail par un **double calendrier** : calendrier semaine (panneau principal gauche) + mini-calendrier mensuel (panneau latéral droit). Clic mini-cal → modale liste missions du jour. *(Décision 19/03/2026 — remplace la proposition initiale "vue jour / 3-4 jours / semaine")*
- [x] **Pas de clic-sur-créneau** pour créer — un bouton "+" à côté du calendrier ouvre un choix Mission / Indisponibilité. *(Décision 19/03/2026)*
- [x] Clic sur une carte mission → **Drawer latéral** (panneau coulissant droite) avec détails + résolution des actions. *(Décision 19/03/2026)*
- [x] Cartes mission en **couleur de fond pastel** par statut (pas de pastilles). *(Décision 19/03/2026)*
- [x] Date/heure **modifiables depuis le drawer** avec choix revalidation technicien. *(Décision 19/03/2026)*
- [ ] **Système de notifications** pour missions à assigner, refusées, etc.
- [x] **Gestion des indisponibilités technicien** : toggle "Journée entière" + créneaux horaires. Récurrence complète (quotidien/hebdo/bimensuel/mensuel, modification occurrence/série, suppression 3 options). Popup au clic dans le calendrier (nom, dates, motif, modifier/supprimer). CRUD complet. (cf [US-823](https://www.notion.so/3271d95b2f8a812bb154e6592687d050)). *(Mis à jour 20/03/2026)*
> ℹ️ **Spec détaillée à jour** : voir [EPIC 14 — Dashboard Admin](https://www.notion.so/3271d95b2f8a816e9e35ec34bc151a59) (US-815 découpée en US-837 à US-842)

## Questions à approfondir
- [x] Le calendrier doit-il supporter le drag & drop ? → **Non en V1**, calendrier en lecture seule. *(Décision 19/03/2026)*
- [ ] Notifications : in-app uniquement ou aussi par email / push mobile ?
- [x] Les indisponibilités technicien sont-elles visibles côté admin ? → **Oui**, plages grisées dans le calendrier semaine.

---


# 2. Bâtiments & Lots

## Retours Flat Checker
- **Supprimer l'onglet Lots** — accessible depuis la page Bâtiment, donc redondant
- **Renommer les lots** : utiliser le numéro de lot du bail (pertinent pour les agences)
- **Icône** par type de lot : appartement, maison, local commercial, etc.
- **Colonne propriétaire** à ajouter dans la vue lots
- Labels meublé / vide : garder tels quels
- **Supprimer la colonne année** sur le tableau bâtiments

## Position Alfred
- OK pour la suppression de l'onglet Lot si la navigation bâtiment → lots est fluide (drill-down)
- Aligné pour un champ "référence" libre sur le lot (numéro de bail, cadastral, etc.) en plus du nom d'affichage
- Proposer une fonctionnalité **colonnes configurables** (toggle show/hide) sur tous les tableaux de l'app — colonnes par défaut définies par FC, customisables par utilisateur
- Remplacer la colonne année par d'autres plus utiles (ex : nombre de lots par bâtiment)

## Décisions
- [ ] Suppression de l'onglet Lots séparé — lots accessibles via drill-down depuis Bâtiments
- [ ] Nom de lot modifiable par l'utilisateur + champ "référence" libre
- [ ] Icône par type de lot (appartement, maison, local commercial, etc.)
- [ ] Colonne propriétaire dans la vue lots
- [ ] Suppression colonne année — envisager colonnes plus utiles (nombre de lots, etc.)
- [ ] **Composant colonnes configurables** : bouton "Colonnes" → panneau toggles, partagé sur tous les tableaux
- [ ] **Recherche globale** sur l'application (lots, tiers, missions, documents) — à spécifier, choix techno à faire (Algolia, Meilisearch, ElasticSearch, dev custom, etc.)

## Questions à approfondir
- [ ] La suppression de la page Lots impacte-t-elle les cas d'usage avec des centaines de lots (vue transverse, recherche, export) ? La recherche globale compense-t-elle ?
- [ ] Techno de recherche : outil tiers (Algolia, Meilisearch) vs dev custom — arbitrage coût / perf / complexité

---


# 3. Tiers

## Retours Flat Checker
- **Supprimer le filtre "Tous"** et les boutons de filtrage → onglets dans l'ordre : Propriétaire → Locataire → Mandataire
- Mandataire uniquement pertinent pour sociétés EDL — pourrait être masqué pour les agences
- Vue locataire : ajouter **colonne propriétaire**
- **Supprimer colonne rôle** dans les vues proprio/locataire (cas double rôle → mentionné dans la fiche)
- **Supprimer colonne ville**, remplacer par : locataire actuel (vue proprio) / propriétaire (vue locataire)
- Personne morale : afficher le **représentant**
- Fiche locataire trop légère : ajouter adresse du bien + documents EDL

## Position Alfred
- Garder les onglets Propriétaire / Locataire / Mandataire comme navigation principale, **plus** un onglet "Tous" discret en fin de ligne (ou pouvoir déselectionner). La colonne rôle n'apparaît que dans la vue "Tous".
- Edge case multi-propriétaires : afficher le **propriétaire actuel** (lot actuellement occupé), historique dans la fiche. Si plusieurs lots simultanés → afficher le nombre ("2 lots") avec lien vers le détail.
- **Colonnes dynamiques par type de tiers** : colonnes par défaut différentes par onglet (proprio, locataire, mandataire), customisables par l'utilisateur → spec à faire ensemble
- Contact principal à afficher pour les personnes morales, prévoir une **liste de représentants** (pas un seul champ)
- Masquage onglet Mandataire si workspace agence → à implémenter en V1
- Enrichissement fiche locataire : lot(s) lié(s) avec lien, propriétaire, historique EDL/inventaires, documents

## Décisions
- [ ] Onglets Propriétaire → Locataire → Mandataire + onglet "Tous" discret (ou déselection)
- [ ] Ordre des onglets : Propriétaire, Locataire, Mandataire
- [ ] Masquage Mandataire si workspace de type agence
- [ ] Suppression colonne ville → remplacement par locataire actuel (vue proprio) / propriétaire (vue locataire)
- [ ] Suppression colonne rôle (sauf vue "Tous")
- [ ] Edge case multi-propriétaires : afficher propriétaire actuel, historique dans la fiche
- [ ] Personne morale : afficher contact principal + **liste de représentants/contacts**
- [ ] Colonnes dynamiques par type de tiers — spec détaillée à faire ensemble
- [ ] Enrichissement fiche locataire : lot(s), propriétaire, documents EDL, adresse du bien

## Questions à approfondir
- [ ] Colonnes par défaut par onglet : quelles colonnes pour proprio / locataire / mandataire ? (à specer ensemble)
- [ ] Colonnes différentes personne morale vs physique ?
- [ ] Plusieurs contacts/représentants par personne morale → sous-liste dans la fiche, ou table `TiersOrganisation` comme prévu dans le data model ?

---


# 4. Missions

## Retours Flat Checker
- **Stat cards** : garder total, remplacer "planifiées" par **missions du jour**, "EDL" par **à venir**, supprimer inventaire
- Ajouter vue **Kanban** en plus de liste et calendrier
- Les **filtres** ne sont pas intuitifs — à repenser

## Position Alfred
- Aligné sur les stat cards et le Kanban
- **Filtres Notion-like** : bouton "+ Filtre" → builder champ / opérateur / valeur + filtres rapides sauvegardés (presets "Mes missions du jour", "À assigner", etc.)
- **Vue carte / map** des missions : intégration Mapbox ou similaire — faisable en V1, utile pour les techniciens terrain et l'optimisation des tournées

## Décisions
- [x] Stat cards : Total — Missions du jour — **Actions en attente** — À venir (retrait inventaire). "Actions en attente" = missions sans technicien OU invitation en attente/refusée OU RDV à confirmer. Même définition partout (dashboard US-837, page missions US-814). *(Mise à jour 20/03/2026)*
- [x] Vue Kanban (colonnes par statut : Planifiée → Assignée → Terminée → Annulée). **Sans drag & drop** — trop de logique de transition (auto-terminaison, blocage annulation, motif obligatoire). Changement de statut via fiche mission ou drawer. *(Mise à jour 20/03/2026)*
- [ ] Système de **filtres dynamiques** type Notion / Airtable (builder + presets sauvegardés)
- [x] **Filtres rapides en dropdown compact** (Période, Technicien, Statut) sur toutes les vues (tableau, Kanban, carte, calendrier). Pattern UX transversal. *(Décision 20/03/2026)*
- [ ] **Vue carte / map** des missions (Mapbox ou similaire) — en V1
- [x] **Auto-terminaison mission** : quand tous les EDL liés sont signés, la mission passe automatiquement en `terminee`. *(Décision 20/03/2026)*
- [x] **Verrouillage mission terminée** : date/heure/technicien/statut RDV en lecture seule. Seuls commentaire + clés (statut dépôt) restent modifiables. Annulation bloquée (cf US-825). *(Décision 20/03/2026)*
- [x] **Pas d'édition inline** dans le tableau missions — les changements impliquent des modales de confirmation/revalidation. Édition via fiche mission ou drawer uniquement. *(Décision 20/03/2026)*
- [x] **Type de bail dans le formulaire création** : radio Individuel (N EDL) / Collectif (1 EDL, N locataires) visible dès 2+ locataires (cf US-594). *(Décision 20/03/2026)*

## Questions à approfondir
- [x] Kanban par statut de mission ou par étape workflow plus fin ? → **Par Mission.statut** (4 colonnes : Planifiée / Assignée / Terminée / Annulée). Sans drag & drop.
- [ ] Faut-il des vues sauvegardées par utilisateur (comme dans Notion) ?
- [x] Vue carte : affichage des missions du jour uniquement ou configurable ? → **Configurable** via dropdown période (Aujourd'hui / Cette semaine / Ce mois / Plage custom). Cf US-813.

---


# 5. Documents

## Retours Flat Checker
- **Supprimer l'onglet Documents** — les documents sont toujours dans les missions, donc redondant

## Position Alfred
- OK pour la V1 (tout EDL passe par une mission)
- Prévoir un mécanisme de **création de mission rapide** (un clic, minimum de champs) pour ne pas bloquer les cas simples
- La **recherche transverse de documents** doit être possible via la recherche globale ou via les fiches lots/locataires

## Décisions
- [ ] Suppression de l'onglet Documents en V1
- [ ] Documents accessibles via : missions, fiches lots, fiches locataires, recherche globale

## Point de vigilance à garder en tête
> **Pour la commercialisation future** : un document n'aura pas toujours une mission liée. Un particulier ou une petite agence pourrait vouloir créer un EDL sans passer par le workflow missions. Ce découplage sera à prévoir dans une version ultérieure.

---


# 6. Réorganisation du menu

## Retours Flat Checker
- Ordre : Tableau de bord → Missions → Bâtiment/Lot (renommé "Parc immobilier") → Tiers

## Position Alfred
- Aligné + séparation visuelle entre les sections

## Décision
Menu réorganisé avec séparation :
**Opérationnel**
- Tableau de bord
- Missions
**Référentiel**
- Parc immobilier (Bâtiments & Lots)
- Tiers
**Administration** 
- Paramètres

---


# 7. Technicien — Tableau de bord

## Retours Flat Checker
- Dashboard simplifié avec **stats** : nombre EDL entrée, EDL sortie, total EDL
- **Raccourci gestion des clés** : liste clés à récupérer / clés à déposer
- **Calendrier** des prochaines missions

## Position Alfred
- **Question structurante** : le technicien aura-t-il accès au desktop ou uniquement à l'app mobile ? → à confirmer avec le client
- Proposition : accès desktop **léger** (dashboard + missions en lecture) même si l'essentiel se passe sur tablette
- Garder le calendrier dans tous les cas
- Gestion des clés : besoin à détailler avant implémentation

## Décisions
- [ ] Stats technicien : EDL entrée, EDL sortie, total depuis le début
- [ ] Calendrier des missions du technicien
- [x] Gestion des clés V1 : entrée + sortie. 3 statuts (`remise` pour entrée documentaire, `a_deposer → deposee` pour sortie). FK vers `edl_id` (pas mission_id — chaque locataire remet/reçoit ses propres clés en coloc). Photos par clé (entity_type = `cle`). Modifiable par technicien (mobile) ET admin (webapp). *(Mises à jour 19-20/03/2026)*
- [x] **Technicien = app mobile uniquement** (pas d'interface desktop) — validé meeting 18/03/2026
- [x] US-816 (Dashboard Technicien) déplacée de EPIC 14 vers **EPIC 5 — Saisie Tablette** — décision 19/03/2026
> ℹ️ **Spec détaillée** : voir [US-816 Dashboard Technicien](https://www.notion.so/3271d95b2f8a8144a9adee462fed816b) (EPIC 5)

## Questions à approfondir — Gestion des clés
Le sujet "gestion des clés" est revenu comme un besoin fort. Voici les questions à creuser avec Flat Checker :
- [x] Qui détient les clés ? → Le locataire les remet au technicien pendant l'EDL de sortie. Le technicien les dépose ensuite (lieu_depot texte libre). À l'entrée, constatation documentaire.
- [x] La clé est-elle liée au lot, à la mission, ou aux deux ? → **Liée à l'EDL** (edl_id) pour tracer par locataire en coloc. Agrégation mission via join.
- [x] Quels sont les statuts possibles ? → 3 statuts : `remise` (entrée), `a_deposer` (sortie), `deposee` (sortie confirmée)
- [x] Y a-t-il plusieurs jeux de clés par lot ? → Oui, enum type_cle : cle_principale / badge / boite_aux_lettres / parking / cave / digicode / autre. Quantité par type.
- [x] Photos des clés ? → Oui, via table Photo (entity_type = `cle`)
- [ ] Faut-il un historique des mouvements de clés ? → V2
- [ ] Y a-t-il un registre de remise avec signature/preuve ? → V2
- [ ] Le technicien doit-il pouvoir signaler un problème de clé ? → V2 (champ commentaire suffit en V1)
> **Implémenté V1** (cf [US-822](https://www.notion.so/3271d95b2f8a810cb29cf28899dba1de)) : CleMission liée à l'EDL (pas à la mission). Entrée = constatation documentaire (statut `remise`). Sortie = workflow dépôt (statuts `a_deposer → deposee`). Photos, lieu de dépôt (texte libre), admin peut modifier depuis la webapp. Checklist agrégée sur le dashboard technicien (US-816).

## Question ouverte
- [ ] **Le technicien aura-t-il accès à l'interface desktop ?** Ou uniquement l'app mobile/tablette ? → à poser à FC
- [ ] Si desktop : proposition d'un mode léger (dashboard + missions en lecture seule)

---


# 8. Technicien — Navigation & Contrôle Qualité

## Retours Flat Checker
- **Supprimer** les onglets bâtiments, lots, tiers, documents pour les techniciens
- **Garder uniquement Missions** (contient tout : adresse, contact locataire, documents)
- Ajouter un onglet **Contrôle Qualité** avec : review interne (FC) + review locataire

## Position Alfred
- Aligné sur le retrait des onglets inutiles
- Le Contrôle Qualité est une fonctionnalité à fort potentiel et un **différenciant fort vs concurrence**

## Décisions
- [ ] Menu technicien réduit : Tableau de bord + Missions + Contrôle Qualité
- [ ] Retrait complet des onglets bâtiments, lots, tiers, documents

## Proposition de vision — Contrôle Qualité
Le contrôle qualité transformerait ImmoChecker d'un simple outil de saisie en un **outil de pilotage qualité**. Voici une proposition de workflow :
**Étape 1 — Saisie terrain**
Le technicien réalise et signe l'EDL sur le terrain.
**Étape 2 — Review interne (Flat Checker)**
Un admin vérifie la qualité du document : complétude, qualité des photos, descriptions, compteurs relevés.
- Statuts : À reviewer → Validé / À corriger
- Si "À corriger" : le technicien reçoit une notification avec les points à reprendre (commentaires ciblés sur les items)
**Étape 3 — Review locataire**
Le locataire reçoit un lien vers l'EDL et peut émettre des réserves/observations.
- Délai légal : 10 jours pour un EDL d'entrée (article 3-2 loi du 6 juillet 1989)
- Le locataire peut commenter des points spécifiques
- L'admin peut accepter ou rejeter les réserves
**Vue technicien** : le technicien voit ses EDL avec leur statut QA, les retours de l'admin, et peut corriger les points signalés.
**Vue admin** : tableau de bord QA avec les EDL à reviewer, statistiques de qualité par technicien, taux de correction.

## Questions à approfondir — Contrôle Qualité
- [ ] Le contrôle qualité interne se fait-il sur des **critères libres** ou sur une **checklist standardisée** (toutes les pièces ont des photos, tous les compteurs relevés, etc.) ?
- [ ] La review locataire : lien web avec formulaire de commentaires ? Ou mécanisme plus formel (signature d'approbation) ?
- [ ] Quel workflow si le locataire conteste un point post-EDL ?
- [ ] Faut-il un **score qualité** par technicien dérivé des reviews internes ? (KPI pour Flat Checker)
- [ ] Le technicien peut-il soumettre une correction directement depuis l'app mobile/tablette ?
- [ ] **Notation du technicien par le locataire** (type Uber) : le locataire pourrait noter le technicien après l'EDL (ponctualité, professionnalisme, clarté des explications, etc.). À confirmer avec FC — si validé, prévoir : échelle de notation (étoiles 1-5 ?), critères de notation (un score global ou plusieurs dimensions ?), visibilité (le technicien voit-il sa note ? l'admin uniquement ?), impact (score agrégé dans le profil technicien, KPI de pilotage pour FC)

---


# 9. Retours Tony — Prototype V1 (détails techniques & UX)
Retours détaillés issus de la review du prototype par Tony (17 mars 2026). Ces points complètent les retours Flat Checker et précisent les attentes en termes d'UX, de navigation et de cohérence technique.

## 9.1 Formulaire de création de mission
- [ ] Le bouton "Nouvelle mission" depuis le dashboard doit ouvrir une **modal** (pas de redirection vers la page missions)
- [ ] **Record picker enrichi pour les lots** : la dropdown de sélection de lot doit afficher pour chaque lot : nom du lot, adresse, nom du propriétaire, étage, emplacement sur le palier (porte de gauche, de droite, en face). Ceci pour identifier le bon lot quand plusieurs lots sont dans le même bâtiment/étage.
- [ ] Recherche dans la dropdown par nom, adresse ou propriétaire
- [ ] **Sélection technicien** : dropdown au lieu de checklist. Un seul technicien par mission (à confirmer avec FC).
- [ ] Champs du formulaire : sens de la mission (entrée/sortie), puis option inventaire (oui/non)
- [ ] Depuis le formulaire mission, pouvoir **créer un lot à la volée** si le lot n'existe pas
- [ ] **Record picker enrichi pour les bâtiments** (dans le formulaire de création de lot) : recherche par adresse, nom du bâtiment, nom du propriétaire. Avec bouton **"Ajouter un bâtiment"** dans la dropdown si le bâtiment n'existe pas.
- [ ] Les champs des formulaires de création lot/bâtiment doivent être alignés avec le **schéma d'architecture de données** défini dans Notion
- [ ] **Harmonisation des modales** : le formulaire de création de lot doit être le même partout (dashboard, page bâtiment, page missions)

## 9.2 Page Bâtiments
- [ ] Colonnes du tableau bâtiments à revoir en fonction du schéma de données Notion
- [ ] **Page détail bâtiment** : informations du bâtiment (complétées selon schéma données) + nombre de lots + navigation vers lots et missions
- [ ] Bouton **modifier** fonctionnel : ouvrir un mode édition (in-page ou formulaire modal) pour les informations de base du bâtiment
- [ ] Dans le tableau des lots (page détail bâtiment) et le tableau des missions : revoir les colonnes affichées. Ex : ajouter le locataire dans le tableau missions.

## 9.3 Page détail Lot
- [ ] **Navigation tabulaire** (ou sections distinctes) : informations de base du lot / dernières missions / tiers liés
- [ ] Pouvoir **modifier les informations** du lot (tiers liés, informations de base)
- [ ] **Liste des locataires** liés au lot : affichée mais **non modifiable** (provient des EDL réalisés)
- [ ] Afficher les missions liées au lot dans un petit tableau

## 9.4 Pages détail Tiers
**Propriétaire :**
- [ ] Afficher les lots possédés **et** les missions liées à ces lots
- [ ] Bouton modifier fonctionnel (mode édition in-page ou modal)
**Mandataire :**
- [ ] Afficher les lots en gestion **et** les missions liées à ces lots
- [ ] À challenger : est-ce réellement utile d'afficher les missions sur la fiche mandataire ?
**Locataire :**
- [ ] Afficher : missions liées, documents liés, lot(s) lié(s)
- [ ] Bouton modifier fonctionnel
**Personne morale :**
- [ ] Ajouter la gestion des **contacts principaux** liés à la personne morale

## 9.5 Missions — Tableau & Page détail
**Tableau des missions :**
- [ ] Revoir les colonnes affichées en fonction du schéma de données — surtout si l'onglet Documents est supprimé. Remonter certaines infos document dans le tableau (ex : locataire lié)
- [ ] Renommer la colonne "Équipe" en **"Technicien"**
- [ ] Ajouter des colonnes utiles : propriétaire, technicien assigné
- [ ] **Affichage trop volumineux** : actuellement seulement ~4 lignes visibles. Rendre l'affichage plus **compact**.
- [ ] Les stat cards / graphiques en haut du tableau : permettre à l'utilisateur de les **masquer** pour gagner en hauteur
- [ ] **Barre de recherche rapide** pour filtrer les items du tableau
- [ ] **Resize des colonnes** : permettre le redimensionnement ou l'auto-sizing
- [ ] **Freeze de colonnes** : pouvoir figer certaines colonnes (à gauche)
- [x] ~~Colonnes éditables inline~~ → **Retiré** : les changements de statut/technicien impliquent des modales de confirmation (revalidation, motif obligatoire, verrouillage mission terminée). Édition via fiche mission (US-811) ou drawer (US-842) uniquement. *(Décision 20/03/2026)*
**Page détail mission :**
- [ ] Pouvoir **modifier les informations** (date, technicien, etc.)
- [ ] Ajouter toutes les informations utiles selon le schéma de données
- [ ] **Remonter des infos EDL** dans la page mission pour éviter la navigation (données communes EDL/inventaire : lot, bâtiment, adresse, parties prenantes, signature, consentement)
- [ ] Réflexion : données communes EDL/inventaire vs données spécifiques à chaque type de document
- [ ] Réflexion : signature séparée EDL et inventaire ou signature commune ? (à clarifier avec FC)
**Interface technicien côté missions :**
- [ ] Prévoir une interface pour **accepter ou refuser** les missions assignées (desktop et/ou mobile)

## 9.6 Page Paramètres
- [ ] Construire la page Paramètres à partir des specs Notion existantes :
  - Paramétrage des pièces, liste d'items par pièce (référentiels métier)
  - Informations de base du Workspace (logo, nom, etc.)
  - Liste des utilisateurs du workspace + rôles
  - Création de nouveaux utilisateurs / invitations
- [ ] Se baser sur le tableau de specs et les documents Notion existants

## 9.7 UX / Principes transverses
- [ ] **Liens cliquables dans les tableaux** : tout objet de donnée affiché dans un tableau qui a une page détail doit être cliquable (technicien → page utilisateur, locataire → page tiers, lot → page lot, etc.)
- [ ] **Harmonisation des formulaires de création** : même modal de création de lot que ce soit depuis le dashboard, la page bâtiment, ou la page missions
- [ ] **Bouton réduire le menu** : le bouton actuel prend trop de place (une bande entière dans le menu). Proposer un **système flottant** discret sur le bord du menu.
- [ ] **Compacité des tableaux** : réduire la hauteur des lignes pour afficher plus de données à l'écran
- [ ] **Édition in-page** : toutes les pages détail (bâtiment, lot, tiers, mission) doivent permettre la modification des informations

---


# 10. Récapitulatif — Fonctionnalités à prévoir

## Composants transverses
- [ ] **Colonnes configurables** (toggle show/hide) — composant partagé sur tous les tableaux
- [ ] **Recherche globale** sur l'application (lots, tiers, missions, documents)
- [ ] **Système de notifications** (in-app + potentiellement email/push)
- [ ] **Filtres dynamiques** type Notion/Airtable (builder + presets sauvegardés)
- [ ] **Liens cliquables dans les tableaux** : tout objet avec page détail doit être cliquable
- [ ] **Harmonisation des modales de création** (lot, bâtiment) sur toute la plateforme
- [ ] **Compacité des tableaux** : réduire la hauteur des lignes, plus de données visibles
- [ ] **Barre de recherche rapide** sur tous les tableaux
- [ ] **Resize / freeze de colonnes** sur les tableaux
- [x] ~~Colonnes éditables inline~~ → **Retiré** : édition via fiche mission ou drawer. *(Décision 20/03/2026)*
- [x] **Voyant alerte tableau** : indicateur orange en début de ligne pour les missions avec actions en attente + tooltip au hover. *(Décision 20/03/2026)*
- [x] **Édition in-page** : pattern **CTA → édition inline** sur toutes les fiches détail (bâtiment, lot, tiers, mission). Lecture par défaut, bouton "Modifier" active l'édition, "Enregistrer" / "Annuler" pour sortir. Le layout ne change pas — les valeurs deviennent des inputs au même emplacement (bordure/fond léger). *(Décision 19/03/2026)*
- [x] **Lien Google Maps** sur les adresses des bâtiments. *(Décision 19/03/2026)*
- [x] **Modale "modifications non sauvegardées"** : si l'utilisateur quitte une fiche en mode édition, modale avec "Enregistrer et quitter" / "Quitter sans sauvegarder". Sur toutes les fiches détail. *(Décision 19/03/2026)*
- [x] **Adresses en format carte** (pas de colonnes séparées) — autocomplete Google Places fournit l'adresse en un bloc. *(Décision 19/03/2026)*

## Dashboard Admin *(spécifié dans *[*US-815*](https://www.notion.so/3271d95b2f8a8126918bf313cb103cae)*)*
- [x] Double calendrier : semaine (gauche) + mini-cal mensuel (droite)
- [x] Drawer latéral pour consultation + résolution des actions
- [x] Bloc "Actions en attente" (assignation + invitation technicien + RDV)
- [x] Bouton "+" (Mission ou Indisponibilité)
- [x] ~~Badges d'alerte~~ supprimés — redondants avec stat card + bloc Actions en attente *(Décision 19/03/2026)*
- [x] Gestion des indisponibilités technicien : toggle journée entière + créneaux horaires + récurrence + popup au clic (cf [US-823](https://www.notion.so/3271d95b2f8a812bb154e6592687d050))
- [x] Cartes mission en couleur de fond pastel par statut
- [x] Date/heure modifiables depuis le drawer avec revalidation
- [x] Formulaire nouvelle mission en **modal** avec record pickers enrichis + section locataire(s) + **radio type de bail** (Individuel/Collectif si 2+ locataires) pour coloc
- [x] Création lot/bâtiment à la volée depuis le formulaire mission
- [x] **Filtres rapides en dropdown compact** sur toutes les vues (tableau, Kanban, carte, calendrier) — pattern UX transversal *(Décision 20/03/2026)*

## Missions
- [x] Vue Kanban (statuts : Planifiée → Assignée → Terminée → Annulée) **sans drag & drop**. *(Décision 20/03/2026)*
- [ ] Vue carte / map (Mapbox) — spécifiée (US-813)
- [x] Stat cards révisées : Total / Missions du jour / **Actions en attente** / À venir. *(Mise à jour 20/03/2026)*
- [ ] Page détail mission : édition + infos EDL remontées + revalidation au changement date/heure
- [x] Accepter / refuser missions côté technicien (statut_invitation sur MissionTechnicien)
- [x] Coloc : **type de bail** dans le formulaire (Individuel = N EDL / Collectif = 1 EDL + N locataires). *(Décision 20/03/2026)*
- [x] **Auto-terminaison** : mission → `terminee` quand tous les EDL signés. *(Décision 20/03/2026)*
- [x] **Verrouillage mission terminée** + **annulation bloquée** (cf US-825). *(Décision 20/03/2026)*
- [x] **Pas d'édition inline** dans le tableau. *(Décision 20/03/2026)*
- [x] **Duplication EDL** réservée à l'app tablette (EPIC 5), pas au back-office. *(Décision 20/03/2026)*
- [ ] Signature séparée ou commune EDL/inventaire (à clarifier)

## Tiers
- [ ] Onglets par type + "Tous" discret
- [ ] Colonnes dynamiques par type de tiers
- [ ] Enrichissement fiches : locataire (lots, missions, documents), propriétaire (lots + missions), mandataire (lots en gestion + missions)
- [ ] Liste de représentants pour personnes morales
- [ ] Masquage conditionnel Mandataire (type workspace)

## Bâtiments & Lots
- [ ] Suppression onglet Lots
- [ ] Icônes par type de lot
- [ ] Champ référence libre
- [ ] Page détail lot : navigation tabulaire (infos / missions / tiers), édition
- [ ] Page détail bâtiment : édition, colonnes revues
- [x] **Pas de bouton "Nouveau bâtiment"** sur la page Parc immobilier — la création se fait exclusivement via les record pickers (formulaire lot ou mission). Le raccourci "Nouvelle maison" est intégré au choix de type dans le formulaire. *(Décision 19/03/2026)*

## Technicien *(app mobile uniquement — EPIC 5, *[*US-816*](https://www.notion.so/3271d95b2f8a8144a9adee462fed816b)*)*
- [ ] Dashboard simplifié avec stats + calendrier
- [x] Gestion des clés V1 : entrée (documentaire, statut `remise`) + sortie (workflow `a_deposer → deposee`). FK `edl_id`. Photos. Admin modifiable webapp. (cf [US-822](https://www.notion.so/3271d95b2f8a810cb29cf28899dba1de)) *(Mise à jour 20/03/2026)*
- [ ] Accepter / refuser les missions assignées (statut_invitation)
- [ ] Module Contrôle Qualité (review interne + review locataire + notation type Uber)
- [ ] Menu réduit : Dashboard + Missions + Contrôle Qualité

## Menu & Navigation
- [ ] Réorganisation : Opérationnel / Référentiel / Administration
- [ ] Renommage "Parc immobilier"
- [ ] Bouton réduire le menu : remplacer par un système flottant discret
- [ ] Page **Paramètres** : pièces/items, infos workspace, utilisateurs/rôles, invitations

---


# 11. Documents PDF & Vérification d'authenticité

## QR code de vérification dans le PDF
**Proposition** : intégrer un **QR code** dans chaque PDF généré (EDL + inventaire) qui renvoie vers une **page web publique de vérification d'authenticité**.
**Benchmark** : Nockee fait exactement ça — un encadré en haut du PDF avec QR code + mention « Ce document est protégé contre la fraude ». Le scan renvoie vers une page minimaliste (type de document, date, adresse, bouton télécharger, badge scellé électronique).
**Fonctionnement technique** :
- À la signature, un `verification_token` (hash unique du contenu signé) est généré
- Une `url_verification` publique est créée (ex : [app.immochecker.fr/verify/{token}](http://app.immochecker.fr/verify/%7Btoken%7D))
- Le QR code est généré dynamiquement dans le PDF (pas stocké en base)
- La page web permet de vérifier que le document n'a pas été altéré post-signature

## Décisions
- [x] QR code + page de vérification : **validé côté Alfred** — US créée, attributs ajoutés au data model

## Questions à poser à FC
- [ ] **Version standard vs légale du rapport PDF** : le data model prévoit actuellement 4 URLs par document (`url_pdf` + `url_web` pour la version complète/travail, `url_pdf_legal` + `url_web_legal` pour la version contractuelle annexée au bail). Faut-il 2 versions distinctes du rapport ou un seul format qui sert les deux usages ? Si un seul format → on simplifie à 2 URLs. Benchmark : Immopad fait la distinction.
- [ ] **Contenu de la page de vérification** : la page publique de vérification doit-elle afficher uniquement les infos minimales (type, date, adresse, télécharger) ou aussi un aperçu du document ?
- [ ] **Logo sur la page de vérification** : logo ImmoChecker systématique ou logo personnalisé du workspace (marque blanche) ?

---


# 12. Décisions meeting client 18/03/2026

## Paramétrage critères
- [x] **Approche à 2 niveaux validée** : ConfigCritereCategorie + overrides item
- [x] **Observation retiré du paramétrage** → toujours optionnel, colonne supprimée de la DB Items. 8 critères paramétrables.
- [x] **Quantité côté EDL** : gardée (fenêtres, prises, radiateurs, portes). Masqué par défaut pour les autres items EDL.
- [x] **Couleur** : gardée paramétrable (les agences peuvent vouloir l'obliger)
- [x] **Onglets EDL | Inventaire** dans le détail pièce pour séparation visuelle forte
- [x] **Profils de rigueur** (simple/rigoureux/ultra) → reporté V2 backlog

## Missions & Statuts
- [x] **3 données distinctes** : statut_mission (planifiée|assignée|terminée|annulée) + statut_invitation technicien (en_attente|accepté|refusé) + statut_rdv (a_confirmer|confirmé|reporté)
- [x] **Indisponibilités technicien** : confirmé, déjà dans le data model
- [x] **EDL sans mission** (bailleur direct) : la mission se crée auto en arrière-plan
- [x] **Suppression onglet Documents** : confirmé, tout passe par les missions

## Contrôle Qualité
- [x] **Review admin** = optionnelle/aléatoire, pas systématique. Prise de notes interne.
- [x] **Review locataire** (avenants) → reporté V2. Sujet complexe.
- [x] **Focus V2** : rating locataire du technicien (type Uber)

## Technique & Design
- [x] **Technicien = app mobile uniquement** (pas d'interface desktop)
- [x] **Branding workspace** : logo + couleur primaire personnalisables. Ajouté au data model.
- [x] **DA** : FC fournit charte graphique (logo, couleurs, police). Alfred intègre via moodboards.
- [x] **Dégradations** : enrichir les valeurs par item avec plus de granularité (léger/important/partiel)

## Positionement produit
- [x] **B2B confirmé** : agences et sociétés EDL. Particuliers = secondaire.
- [x] **Pas de gestion locative** en V1 (confirmé précédemment)

## Backlog V2+
- Profils de rigueur (mission-level)
- Review locataire interactive / avenants
- Sync calendrier externe (Google Calendar, Outlook)
- Analytics prédictif (turnover, vétusté)
- Marketplace techniciens (type Malt)
- Data analyse pour enrichir référentiels

---


# 13. Prochaines étapes
- [ ] **Réunion avec Flat Checker** pour valider les décisions et traiter les questions ouvertes (notamment contrôle qualité et gestion des clés)
- [ ] **Spec détaillée** des colonnes par défaut par type de tiers
- [ ] **Choix techno** recherche globale
- [ ] **Maquettage** des nouveaux composants (calendrier interactif, Kanban, filtres dynamiques, module QA)
- [ ] Mise à jour du data model si nécessaire (gestion des clés, contrôle qualité, indisponibilités technicien)