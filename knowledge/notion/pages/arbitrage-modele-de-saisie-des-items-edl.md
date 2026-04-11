---
notion_id: "3141d95b-2f8a-8117-9e82-ddd60a07dc27"
notion_url: "https://www.notion.so/Arbitrage-Mod-le-de-saisie-des-items-EDL-3141d95b2f8a81179e82ddd60a07dc27"
last_synced: "2026-03-26T12:52:13.308Z"
created: "2026-02-27T09:34:00.000Z"
last_edited: "2026-03-18T09:17:00.000Z"
properties:
  title: "🎛️ Arbitrage — Modèle de saisie des items EDL"
---

# 🎛️ Arbitrage — Modèle de saisie des items EDL

| Propriete | Valeur |
|-----------|--------|

**Contexte** : Lors de la réalisation d'un état des lieux, chaque élément inspecté (sol, mur, porte, lavabo…) doit être caractérisé et décrit. La question est : **quel niveau de structure et de paramétrage mettons-nous en place sur ImmoChecker ?**
Ce document présente deux approches existantes sur le marché, leurs limites, et la solution que nous recommandons.

---


# 🔍 Les deux extrêmes du marché

## Option A — Le modèle "nomenclature" (ex : Immopad)
Chaque élément inspecté dispose d'une **fiche de caractéristiques entièrement configurable** depuis le back-office. L'administrateur définit à l'avance, pour chaque type d'élément, la liste exacte des champs à remplir, leur ordre, leurs valeurs possibles et leur caractère obligatoire.
> **Exemple sur une Porte :**
> - Description → Pleine / Vitrée / Coulissante
> - Fonctionnement → Fonctionne / Voilée / Ne ferme pas
> - Aspect → Éclat(s) / Trace(s) / Noirci / …
> - Complément(s) → texte libre
**✅ Ce qui est bien** : les données sont très structurées, cohérentes entre agents, exploitables pour des statistiques. Les rapports sont précis et uniformes.
**❌ Ce qui pose problème** :
- La configuration initiale est longue et complexe — il faut paramétrer chaque élément avant de pouvoir faire le moindre EDL
- Si la configuration change, tous les templates existants sont impactés
- L'agent sur le terrain est prisonnier de la structure : si son cas ne rentre pas dans les cases, il est bloqué
- **Incompatible avec la saisie vocale** : un agent ne dicte pas "Description : Pleine. Fonctionnement : Fonctionne. Aspect : Traces." — il parle naturellement

---


## Option B — Le modèle "tags libres" (ex : Nockee)
Chaque élément dispose de **tags prédéfinis** sélectionnables en un tap, organisés par catégorie (matériaux, dégradations, propreté). L'agent peut aussi créer des tags à la volée s'il ne trouve pas ce qu'il cherche.
> **Exemple sur un Sol :**
> - Matériau → [Parquet] [Carrelage] [Vinyle] [Moquette] … + Autre
> - Dégradations → [Rayure(s)] [Tache(s)] [Éclat(s)] [Fissure(s)] … + Autre
> - Propreté → [Propre] [À nettoyer] [Sale]
**✅ Ce qui est bien** : très rapide à utiliser sur le terrain, aucune configuration nécessaire, l'agent est guidé sans être bloqué.
**❌ Ce qui pose problème** :
- Les données sont **moins exploitables** : deux agents peuvent décrire la même chose avec des tags différents
- Les **comparatifs entrée/sortie** sont difficiles à automatiser — si les tags ne sont pas identiques entre deux EDL, la comparaison se fait à la main
- Peu de cohérence entre workspaces si chacun crée ses propres tags

---


# 💡 Notre recommandation — Le modèle "référentiel structuré + tags"
Nous proposons une **troisième voie** qui combine la structure d'Immopad et la fluidité de Nockee, en séparant ce qui est fixe de ce qui est flexible.

## Le principe en 3 niveaux
**Niveau 1 — Structure fixe (invisible pour l'agent)**
Tout élément inspecté a toujours les mêmes dimensions : `Matériau`, `État général`, `Dégradations`, `Propreté`, `Commentaire`. C'est la colonne vertébrale du comparatif entrée/sortie. Elle ne change pas selon les workspaces.
**Niveau 2 — Tags prédéfinis par Flat Checker**
Pour chaque dimension, une liste de tags issus de votre expertise terrain (les référentiels de l'EPIC 6). Ces tags sont disponibles dans tous les workspaces clients et enrichis par Flat Checker depuis l'admin.
**Niveau 3 — Extension par workspace**
Chaque agence cliente peut ajouter ses propres tags dans le référentiel (ex : un matériau spécifique qu'elle rencontre souvent). Elle ne peut pas modifier la structure ni supprimer les tags socle.

---


## 📱 Ce que voit l'agent sur la tablette
L'agent arrive sur l'élément **"Sol — Cuisine"** :
| Dimension | Ce que l'agent voit | Action |
| **Matériau** | Parquet · Carrelage · Vinyle · Moquette · Béton ciré · … | 1 tap pour sélectionner |
| **État général** | Bon état · Usure normale · Dégradé | 1 tap pour sélectionner |
| **Dégradations** | Rayure(s) · Tache(s) · Éclat(s) · Fissure(s) · Trou(s) · … | Multi-sélection possible |
| **Propreté** | Propre · À nettoyer · Sale | 1 tap pour sélectionner |
| **Commentaire** | Champ texte libre | Optionnel, pour les précisions |
**Résultat** : un élément complet se saisit en 4 taps, sans aucune configuration préalable.

---


## 🎙️ Compatibilité avec la saisie vocale IA
C'est l'argument le plus fort pour ce modèle.
Avec une structure en tags prédéfinis, le travail de l'IA est simple et fiable : elle écoute une phrase naturelle et la **classe dans des cases connues à l'avance**.
> **L'agent dit :**
> *"Sol cuisine, carrelage gris, une rayure sur le côté droit, globalement propre"*
> 
> **L'IA mappe automatiquement :**
> - Matériau → **Carrelage** ✓
> - État général → **Bon état** ✓ *(inféré)*
> - Dégradations → **Rayure(s)** ✓
> - Propreté → **Propre** ✓
> - Commentaire → *"côté droit, gris"* ✓ *(précisions non classifiables)*
Avec le modèle Immopad, l'IA aurait un problème : les champs sont trop rigides et nombreux pour être remplis naturellement à la voix. Avec le modèle Nockee pur, les données seraient trop libres pour être comparées automatiquement d'un EDL à l'autre.

---


## 🔄 Ce que ça change pour les comparatifs entrée/sortie
Parce que la structure est fixe et les tags sont partagés, le système peut **aligner automatiquement** les données entre un EDL d'entrée et un EDL de sortie :
| Dimension | EDL Entrée (jan. 2024) | EDL Sortie (jan. 2025) | Évolution |
| Matériau | Carrelage | Carrelage | — |
| État général | Bon état | Usure normale | ⚠️ Dégradé |
| Dégradations | Aucune | Rayure(s), Tache(s) | 🔴 Nouveau |
| Propreté | Propre | À nettoyer | ⚠️ Dégradé |
Ce tableau de comparatif se génère **automatiquement** dans le rapport PDF — sans travail manuel de l'opérateur.

---


# ❓ Les points à arbitrer

## Question 1 — Les dimensions sont-elles les bonnes ?
Nous proposons : `Matériau`, `État général`, `Dégradations`, `Propreté`, `Commentaire`.
Y a-t-il des dimensions manquantes selon votre pratique terrain ? Certaines à supprimer ou renommer ?
> 💬 *Exemple : faut-il ajouter une dimension "Quantité" pour les inventaires ? Une dimension "Couleur" systématique ?*

## Question 2 — Qui enrichit le référentiel socle ?
Dans notre proposition, c'est **Flat Checker** qui maintient le référentiel de tags commun à tous les workspaces. Est-ce que vous souhaitez garder cette maîtrise, ou préférez-vous que chaque workspace soit totalement autonome ?
> 💬 *Note : laisser chaque workspace totalement libre risque de créer des incohérences si vous commercialisez en SaaS — deux clients pourraient appeler la même chose différemment, rendant les benchmarks impossibles.*

## Question 3 — Niveau de guidage sur le terrain
Les dimensions doivent-elles être **obligatoires** (l'agent ne peut pas passer à l'élément suivant sans les remplir) ou **facultatives** avec un guidage visuel non bloquant ?
> 💬 *Notre recommandation : non bloquant, mais avec un indicateur visuel de complétion par élément — l'agent sait ce qu'il a rempli ou non sans être forcé.*

## Question 4 — Faut-il permettre à chaque workspace de rendre certains éléments obligatoires ?
Dans notre modèle, les dimensions (Matériau, État, Dégradations…) sont proposées à l'agent mais non bloquantes par défaut. La question est : doit-on permettre à chaque workspace de **configurer ses propres règles d'obligation** ?
Deux cas concrets où ça fait une différence :
**Sur les dimensions :**
> Une société EDL professionnelle comme Flat Checker pourrait vouloir que **l'état général soit toujours renseigné** sur chaque élément — car c'est la base du rapport. Un bailleur particulier qui fait ses propres EDL pourrait préférer plus de souplesse.
**Sur les photos :**
> Certains workspaces pourraient exiger **une photo minimum par élément dégradé** (pour sécuriser juridiquement le rapport), d'autres laisser les photos entièrement optionnelles pour aller plus vite sur des biens en bon état.
**Les options possibles :**
- **Option A — Standard Flat Checker pour tous** : Flat Checker définit une fois les règles qui s'appliquent à tous les workspaces clients. Simple à développer, cohérent sur la plateforme. Si le besoin de personnalisation se fait sentir lors de la commercialisation, on rend ça paramétrable dans un second temps. *(Approche recommandée pour la V1)*
- **Option B — Paramétrable par template** : les règles d'obligation sont définies au niveau du template EDL. Un template "EDL meublé premium" peut exiger plus de rigueur qu'un template "EDL nu standard". Plus flexible mais plus complexe à développer.
- **Option C — Pas de règles d'obligation** : tout est toujours optionnel, le guidage visuel suffit. L'agent voit ce qui est incomplet mais n'est jamais bloqué.
**Une approche intermédiaire : le voyant d'alerte**
Entre "obligatoire bloquant" et "optionnel silencieux", il existe une troisième voie très efficace sur le terrain : un **indicateur visuel de complétion fortement recommandée**. L'agent n'est pas bloqué, mais un voyant orange visible lui signale qu'un élément important est manquant (ex : aucune photo sur un élément marqué dégradé, état général non renseigné).
> 💬 *Avantage : ça préserve la fluidité de saisie tout en guidant vers la qualité. L'agent expérimenté avance vite, le novice est alerté sans être frustré. Cette approche est compatible avec toutes les options ci-dessus.*
> 💬 *Notre recommandation : partir sur l'Option A (standard Flat Checker pour tous) combinée avec le système de voyants d'alerte. C'est le bon équilibre pour la V1 — simple à développer, efficace terrain, et on réserve la personnalisation par workspace pour une V2 si la commercialisation le justifie.*

---


# 📌 Résumé de la recommandation
| Critère | Immopad | Nockee | **Notre recommandation** |
| Vitesse sur le terrain | 🔴 Lente | 🟢 Très rapide | 🟢 Très rapide |
| Configuration initiale | 🔴 Lourde | 🟢 Aucune | 🟢 Aucune pour l'agent |
| Cohérence des données | 🟢 Très élevée | 🟡 Moyenne | 🟢 Élevée |
| Comparatifs automatiques | 🟢 Oui | 🔴 Difficile | 🟢 Oui |
| Compatible saisie vocale IA | 🔴 Non | 🟡 Partiellement | 🟢 Oui, nativement |
| Flexibilité par workspace | 🟢 Totale | 🟢 Totale | 🟡 Extension uniquement |