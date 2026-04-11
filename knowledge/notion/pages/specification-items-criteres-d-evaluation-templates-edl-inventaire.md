---
notion_id: "3251d95b-2f8a-81d9-b0be-fe4d40f7fb68"
notion_url: "https://www.notion.so/Sp-cification-Items-Crit-res-d-valuation-Templates-EDL-Inventaire-3251d95b2f8a81d9b0befe4d40f7fb68"
last_synced: "2026-03-26T12:52:05.882Z"
created: "2026-03-16T09:46:00.000Z"
last_edited: "2026-03-25T09:31:00.000Z"
properties:
  title: "📋 Spécification — Items, Critères d'évaluation & Templates EDL/Inventaire"
---

# 📋 Spécification — Items, Critères d'évaluation & Templates EDL/Inventaire

| Propriete | Valeur |
|-----------|--------|

**Statut** : Draft — En attente de validation
**Contexte** : Ce document formalise le modèle de saisie des items lors d'un état des lieux ou inventaire sur ImmoChecker. Il fait suite à la page d'arbitrage sur le modèle de saisie des items EDL et intègre les retours client.
**Pages liées** : 
- [🎛️ Arbitrage — Modèle de saisie des items EDL](https://www.notion.so/3141d95b2f8a81179e82ddd60a07dc27) 
- [📝 Attributs par Table — ImmoChecker V1](https://www.notion.so/3131d95b2f8a81649209fa1f42bf2275) 

---


# 1. Architecture des Templates

## Principe retenu
**Templates par type de pièce**, pas par type de bien (T2, T4, studio…).
Le système propose un catalogue de types de pièces. À la création d'un EDL ou d'un inventaire, l'utilisateur sélectionne les pièces à inclure et leur quantité (ex : 2× Chambre, 1× Cuisine, 1× SDB). Cela évite la combinatoire explosive des templates par type d'appartement.

## Un seul template par type de pièce en base de données
Chaque type de pièce a **un seul template en base** contenant l'ensemble des items possibles. Chaque item porte un flag indiquant son contexte d'utilisation :
- `EDL` — l'item n'apparaît que lors d'un état des lieux
- `Inventaire` — l'item n'apparaît que lors d'un inventaire
**La séparation EDL vs Inventaire est gérée côté front-end** : l'interface filtre et n'affiche que les items pertinents selon le type de mission en cours. Côté back-end, une seule source de vérité à maintenir par type de pièce.
> 💡 *Avantage : pas de désynchronisation si Flat Checker ajoute un item à la Cuisine — la mise à jour est automatiquement disponible dans les deux contextes.*

## Pas de kits / presets de composition en V1
On raisonne par pièce, pas par type d'appartement. L'utilisateur compose son EDL pièce par pièce. Si le besoin de raccourcis de composition se fait sentir (ex : "T2 standard"), ce sera envisagé en V2.

---


# 2. Catalogue d'items

## Catalogue centralisé
Un **catalogue d'items au niveau plateforme** est définit  : son nom, sa catégorie, ses critères d'évaluation applicables, ses sous-items possibles et son contexte (EDL / Inventaire / Les deux).
**Trois niveaux de gestion du catalogue :**
- **Niveau plateforme (Flat Checker)** : items socle disponibles sur tous les workspaces. Maintenus et enrichis par Flat Checker.
- **Niveau workspace** : chaque workspace peut ajouter ses propres items, supprimer des items du socle qu'il n'utilise pas, et réorganiser la hiérarchie items/sous-items selon ses besoins.
- **Niveau terrain** : le technicien peut créer un item à la volée si nécessaire (ne remonte pas automatiquement dans le référentiel workspace en V1 — à envisager en V2).

## Items et sous-items
Un item peut contenir des **sous-items** (ex : WC → Cuvette, Lunette, Chasse d'eau, Réservoir). Chaque sous-item a **sa propre configuration de critères d'évaluation** : on ne demandera pas les mêmes critères pour le bac d'un évier (état, propreté, matériau) que pour le robinet (état, propreté, fonctionnement).
Les sous-items sont définis au niveau du catalogue, pas créés à la volée.
> 💡 *Profondeur maximale : 2 niveaux (item → sous-item). Pas de sous-sous-items.*

## Localisation spatiale dans la pièce
Les éléments multiples dans une pièce (Mur 1, Mur 2, Fenêtre 1, Fenêtre 2) sont des **items distincts**, pas des sous-items de "Mur" ou "Fenêtre". Chaque mur peut avoir un état, un matériau et des dégradations différentes.
Le technicien peut **dupliquer un item** dans la saisie ("+ Ajouter un mur") pour créer une nouvelle instance avec la même structure de critères. Chaque instance est évaluée indépendamment.
**Labels par défaut pour les murs** (retour client) : Mur d'accès · Mur gauche · Mur droit · Mur de face. Convention : on commence toujours par le mur par lequel on entre dans la pièce. Le technicien peut renommer librement.

### Comportement UX du label personnalisé (`EvaluationItem.label`)
**Auto-numérotation** : quand le technicien ajoute un item déjà présent dans la pièce (ex : 2ème "Mur"), le système auto-numérote :
- 1er ajout : "Mur" (label = null, affiche CatalogueItem.nom)
- 2ème ajout : le 1er est renommé "Mur 1" et le nouveau "Mur 2"
- 3ème ajout : "Mur 3", etc.
**Renommage libre** : le technicien peut taper sur le label pour le renommer librement ("Mur de face", "Mur côté fenêtre", "Fenêtre salon", etc.). Le champ `label` sur `EvaluationItem` stocke ce libellé personnalisé.
**Règle d'affichage** : si `label` est renseigné → affiche `label`. Sinon → affiche `CatalogueItem.nom` (+ numéro si doublon). Le label personnalisé apparaît dans le rapport PDF et la version web.
**Cas des sous-items** : les sous-items héritent du nom CatalogueItem et ne sont généralement pas renommés (un Robinet reste un Robinet). Le label est disponible mais optionnel sur les sous-items.
**Items avec labels prédéfinis** : certains items ont une colonne "Qté par défaut" avec des labels prédéfinis (ex : Mur × 4 = Mur d'accès, Mur gauche, Mur droit, Mur de face). Le technicien peut toujours renommer ou ajouter/supprimer des instances.

---


# 3. Critères d'évaluation par item
Chaque item (et sous-item) est évalué selon un ensemble de **critères d'évaluation**. Certains sont universels (applicables par défaut), d'autres sont contextuels (activés selon le type d'item).

## Critères universels
Applicables par défaut à tous les items. Valeurs standard plateforme, non modifiables par les workspaces.
| **Critère** | **Type** | **Valeurs** | **Notes** |
| **État général** | Enum simple | Neuf · Bon état · État d'usage · Mauvais état · Dégradé | Support visuel couleur (vert → rouge). 5 niveaux validés avec le client : Neuf = zéro km, Bon état = petits détails mineurs, État d'usage = utilisé (traces, trous de cheville), Mauvais état = usure marquée (joints noircis, dégâts notables), Dégradé = moisissure, humidité, écaillé, éléments décrochés.
**Règle : quand un item a des sous-items, l'État général est automatiquement masqué au niveau parent** (l'évaluation se fait uniquement sur chaque sous-item). Raison : un Lavabo peut avoir un Bac neuf mais un Robinet en mauvais état — un état global serait incohérent. **Question ouverte** : la photo d'ensemble de l'item parent reste-t-elle pertinente (photo du lavabo complet) même si l'état est évalué au sous-item ? Ou le technicien prend une photo de chaque sous-item uniquement ? |
| **Propreté** | Enum simple | RAS · À nettoyer | Binaire et factuel. Évite la subjectivité de "propre" ou "sale". Valeurs fermées, non extensibles. *(Retour client : "sale" est trop subjectif — validé sur une approche binaire RAS / À nettoyer. À confirmer définitivement.)* |
| **Observation** | Texte libre | — | Précisions, détails non classifiables. Toujours disponible sur chaque item. **Non paramétrable** — toujours optionnel, pas besoin de le configurer par workspace (validé client 18/03/2026). |
| **Photo(s)** | Médias | — | Toujours disponible. Photos rattachées à l'item ou sous-item concerné. |
> ✅ **Décision (18/03/2026)** : Observation retiré des critères paramétrables. Toujours optionnel, jamais obligatoire. **8 critères paramétrables** (au lieu de 9) dans `ConfigCritereCategorie`.

## Critères contextuels
Activés selon le type d'item. Les valeurs sont propres à chaque type d'item et maintenues à 3 niveaux (plateforme → workspace → terrain).
| **Critère** | **Type** | **Valeurs** | **Exemples** |
| **Caractéristiques** | Multi-select (tags prédéfinis + création libre par le technicien) | Propres à chaque type d'item | Sol : Parquet, Carrelage, Vinyle, Moquette… · 

Fenêtre : Simple vitrage, Double vitrage, 2 ouvrants, Abattant… 

Électroménager : valeurs libres (marque, modèle…) |
| **Couleur** | Enum simple (palette standard + "Autre" texte libre) | Blanc, Beige, Gris, Noir, Bois naturel, Marron, Bleu, Vert, Rouge, Autre | Activable par type d'item (murs, portes, volets…). Optionnel par défaut. |
| **Dégradation(s)** | Multi-select (tags prédéfinis + création libre par le technicien) | Propres à chaque type d'item | Sol : Rayure, Tache, Éclat, Fissure, Trou… · 

Porte : Éclat, Trace, Griffure, Impact… |
| **Fonctionnement** | Enum simple | Fonctionne · Fonctionne difficilement · Hors service · Non testé · Non testable | Uniquement items mécaniques/électriques (robinet, fenêtre, volet, interrupteur, bonde…). Pas sur murs, sols, plafonds.
"Non testé" et "Non testable" sont deux valeurs distinctes (retour client). Les deux déclenchent la mention automatique **« sous réserve de bon fonctionnement »** dans le rapport généré. |
| **Quantité** | Nombre | — | Inventaire uniquement. Pour compter les objets mobiliers. |

## Les 3 niveaux de référentiel pour les valeurs contextuelles
**Niveau 1 — Plateforme (fixe)** : la structure des critères (quels critères existent, leurs types). Non modifiable.
**Niveau 2 — Flat Checker** : tags prédéfinis pour Caractéristiques et Dégradations par type d'item. Maintenus par Flat Checker, disponibles sur tous les workspaces.
**Niveau 3 — Workspace** : peut ajouter ses propres tags Caractéristiques et Dégradations. Ne peut pas modifier les tags socle Flat Checker mais peut en masquer.
**Terrain** : le technicien peut créer un tag à la volée s'il ne trouve pas ce qu'il cherche. En V1, le tag reste local à l'EDL et ne remonte pas automatiquement dans le référentiel workspace. Remontée automatique avec validation admin à envisager en V2.

---


# 4. Paramétrage des critères par item
Chaque workspace peut configurer, pour chaque type d'item (et sous-item), **quels critères sont affichés et leur niveau d'exigence** :
| **Niveau** | **Comportement** | **Visuel terrain** |
| **Masqué** | Le critère n'apparaît pas pour cet item | Invisible |
| **Optionnel** | Affiché, aucune alerte si non rempli | Affiché normalement |
| **Recommandé** | Affiché, voyant d'alerte visuel (couleur) si non rempli — non bloquant | Voyant orange si vide |
| **Obligatoire** | Affiché, bloquant — ne peut pas valider l'item sans le remplir | Voyant rouge si vide, validation bloquée |
**Modèle par défaut** : un paramétrage standard Flat Checker est pré-configuré sur l'application. Chaque workspace peut ensuite le modifier à sa guise.
Le système de **voyant d'alerte visuel** (couleur, pas texte) permet au technicien de voir d'un coup d'œil les éléments incomplets sans être bloqué dans sa progression.
> 💡 *V2 envisagée : profils de rigueur en bulk edit (Rapide / Standard / Complet) pour faciliter la configuration par template sans passer item par item.*

---


# 5. Types de pièces par défaut
Liste des types de pièces proposés par défaut sur la plateforme. Chaque workspace peut ajouter ses propres types.

## Pièces de vie
- Entrée / Hall
- Salon / Séjour
- Salle à manger
- Cuisine
- Cuisine américaine (ouverte)
- Chambre
- Bureau
- Mezzanine

## Pièces d'eau & sanitaires
- Salle de bain
- Salle d'eau (douche uniquement)
- WC / Toilettes
- Buanderie / Cellier

## Circulations & rangements
- Couloir / Dégagement
- Dressing
- Placard / Rangement

## Espaces extérieurs & annexes
- Balcon
- Terrasse
- Loggia
- Véranda
- Jardin / Cour
- Cave
- Garage
- Parking / Box
- Grenier / Combles
- Cabanon / Abri de jardin
- Local vélos / Poussettes

## Parties communes (si applicable)
- Escalier
- Palier
- Local poubelles

---


# 6. Modèle de données synthétique
```javascript
CatalogueItem (niveau plateforme + workspace)
├── nom: "Sol"
├── catégorie: "Revêtements"
├── contexte: EDL | Inventaire | Les deux
├── critères_applicables:
│   ├── état_général: true (universel)
│   ├── propreté: true (universel)
│   ├── caractéristiques: true → [Parquet, Carrelage, Vinyle, Moquette, Béton ciré...]
│   ├── couleur: true
│   ├── dégradations: true → [Rayure, Tache, Éclat, Fissure, Trou...]
│   ├── fonctionnement: false
│   ├── quantité: false (sauf inventaire)
│   ├── observation: true (universel)
│   └── photos: true (universel)
├── sous_items: []
└── source: plateforme | workspace

TemplatePiece (niveau workspace, modèle par défaut Flat Checker)
├── type: "Cuisine"
├── items_par_défaut:
│   ├── Sol → config critères (masqué/optionnel/recommandé/obligatoire)
│   ├── Mur → config critères
│   ├── Plafond → config critères
│   ├── Porte → config critères
│   ├── Fenêtre → config critères
│   ├── Évier → config critères
│   │   └── sous-items: Robinet, Bac, Bonde, Siphon (chacun avec sa propre config)
│   ├── Plan de travail → config critères
│   └── Prises → config critères
└── source: flat_checker | workspace

EDL_Instance
├── type_mission: EDL | Inventaire
├── pièces:
│   └── Cuisine
│       ├── items:
│       │   ├── Sol (instance)
│       │   │   ├── caractéristiques: ["Carrelage"]
│       │   │   ├── état: "État d'usage"
│       │   │   ├── dégradations: ["Rayure"]
│       │   │   ├── propreté: "RAS"
│       │   │   ├── couleur: "Gris"
│       │   │   ├── observation: "Rayure légère angle droit"
│       │   │   └── photos: [...]
│       │   ├── Mur 1 (instance)
│       │   ├── Mur 2 (instance)
│       │   └── Évier (instance)
│       │       └── sous-items:
│       │           ├── Robinet → fonctionnement: "Fonctionne", état: "Bon état"
│       │           │   └── NB : pas d'état général sur Évier (parent avec sous-items)
│       │           └── Bac → état: "État d'usage", propreté: "RAS"
│       └── commentaire_pièce: "RAS"
```

---


# 7. Points restants à traiter
| **Sujet** | **Statut** | **Détail** |
| Liste des items et sous-items par type de pièce | ✅ Fait | ~140 items actifs dans la DB Notion, avec sous-items liés (plomberie, menuiseries, sanitaires). Chaque item est relié aux pièces concernées via la relation Pièces. Cross-check vs nomenclature Immopad effectué. |
| Valeurs de Caractéristiques et Dégradations par item | ✅ Fait | Tags prédéfinis renseignés pour chaque item (Valeurs Caractéristiques + Valeurs Dégradations). Audit qualité effectué — pas de valeur vide quand le critère est actif. |
| Setup par défaut des niveaux d'exigence | ✅ Fait | Paramétrage par défaut renseigné pour chaque item × critère. Voir DB Items pour le détail. |
| Linking items → pièces (templates par défaut) | ✅ Fait | Chaque item est relié aux pièces où il apparaît par défaut. Colonne "Qté par défaut" ajoutée (ex: Mur = 4). Pièces transverses créées : Éq. généraux, Extérieur/Bâti, Espaces verts. |
| Arbitrage : critères par catégorie vs par item | ⚠️ À valider client | Proposition : configurer les niveaux d'exigence **par catégorie** (profil par défaut Revêtements, Plomberie, etc.) avec overrides ponctuels au niveau item. Réduit massivement la complexité de maintenance vs le modèle actuel item par item. Voir section 8. |
| Architecture pivot instances (runtime) | ⚠️ À spécifier | Le modèle de données applicatif nécessite une table pivot EvaluationItem pour gérer les instances multiples (4 murs, 2 fenêtres). Documenté en section 9. À intégrer dans le data model Notion existant. |
| Remontée des tags créés par le technicien | 📌 V2 | En V1, les tags créés à la volée restent locaux à l'EDL. En V2, envisager une remontée avec validation admin dans le référentiel workspace. |
| Profils de rigueur en bulk edit | 📌 V2 | Permettre de configurer rapidement les niveaux d'exigence via des profils (Rapide / Standard / Complet) plutôt qu'item par item. |
| Version standard vs légale du rapport PDF | ❓ À valider client | Le data model prévoit 4 URLs sur EDL_Inventaire : `url_pdf`, `url_web` (version complète, document de travail) + `url_pdf_legal`, `url_web_legal` (version contractuelle, annexée au bail). **À valider avec FC** : faut-il 2 versions distinctes du rapport (standard + légal) ou un seul format qui sert les deux usages ? Si un seul format, on simplifie à 2 URLs. Benchmark : Immopad fait la distinction. |
| QR code de vérification d'authenticité | ✅ Specé | US créée : QR code intégré au PDF renvoyant vers une page publique de vérification (type Nockee). Champs `verification_token` et `url_verification` ajoutés sur `EDL_Inventaire`. Benchmark : [app.nockee.fr/verify](http://app.nockee.fr/verify). |

---


# 8. ⚠️ Arbitrage : Critères par catégorie vs par item
**Problème** : le modèle actuel configure 9 critères × ~140 items = ~1 260 paramètres à maintenir. C'est fonctionnel pour la spec mais sera coûteux à maintenir côté admin workspace.
**Proposition** : configurer les niveaux d'exigence (Masqué/Optionnel/Recommandé/Obligatoire) **au niveau de la catégorie** (Revêtements, Plomberie, Cuisine, etc.) plutôt que par item.
Chaque catégorie définit un **profil par défaut** qui s'applique à tous ses items. Exemples :
- **Revêtements** : État=Recommandé, Caractéristiques=Recommandé, Couleur=Optionnel, Dégradations=Recommandé, Fonctionnement=Masqué
- **Plomberie** : État=Recommandé, Caractéristiques=Optionnel, Dégradations=Recommandé, Fonctionnement=Masqué (sauf overrides)
- **Électricité** : État=Optionnel, Fonctionnement=Recommandé, le reste Masqué
Des **overrides au niveau item** sont possibles quand le défaut catégorie ne convient pas (ex : Robinet → Fonctionnement=Obligatoire alors que Plomberie a Fonctionnement=Masqué par défaut).
**Avantages** :
- Maintenance divisée par ~10 (17 catégories vs 140 items)
- Plus intuitif pour l'admin workspace : "je veux que toute la Plomberie soit plus exigeante" = un seul changement
- Reste flexible grâce aux overrides ponctuels
> 📣 **À valider avec Flat Checker** : est-ce que cette approche par catégorie convient, ou préfèrent-ils garder le contrôle item par item ?

---


# 9. Architecture pivot : instances d'items au runtime
Le linking Items → Pièces dans Notion définit les **templates** (quels items apparaissent par défaut dans quel type de pièce). Au runtime dans l'application, chaque EDL concret crée des **instances** d'items qui sont évaluées indépendamment.
**Modèle applicatif** (table pivot) :
```javascript
PieceEDL (instance d'une pièce dans un EDL concret)
  → edl_id, type_piece, nom_personnalisé ("Chambre 1", "Cuisine")

EvaluationItem (pivot = une instance d'item évaluée)
  → piece_edl_id, item_catalogue_id
  → position / label ("Mur face", "Mur gauche", "Fenêtre 1")
  → état_général, propreté, caractéristiques, couleur,
     dégradations, fonctionnement, quantité, observation
  → photos[]

EvaluationSousItem (sous-évaluation liée)
  → evaluation_item_id, sous_item_catalogue_id
  → mêmes critères que EvaluationItem
```

---


# 10. Pattern UX App mobile : Items pré-sélectionnés vs disponibles
Le linking Items → Pièces dans le template définit les items **pré-sélectionnés** (présents par défaut quand on crée une pièce de ce type). Mais certains items sont pertinents dans une pièce sans y être systématiques (ex : Cheminée dans un Salon, Cendrier sur un Balcon, Climatisation dans un Bureau).
**Comportement proposé :**
1. **À la création d'une pièce**, le technicien voit la liste des items pré-sélectionnés (= ceux liés au template) avec des **cases cochées par défaut**.
1. Il peut **décocher** des items qu'il ne voit pas dans la pièce (ex : décocher Fenêtre dans un couloir aveugle).
1. Il peut **ajouter** des items depuis le catalogue complet via un bouton "+" avec recherche/auto-complétion. L'éligibilité est large : tout item de la même catégorie est proposé, plus les items transverses.
1. Les items ajoutés manuellement sont **des ajouts ponctuels** pour cet EDL, pas une modification du template.
Ce pattern permet d'avoir des templates **légers** (seulement les items courants pré-cochés) tout en restant **complètement flexible** (n'importe quel item du catalogue peut être ajouté à la volée).
> 💡 *Conséquence : le linking Items → Pièces dans Notion représente l'"expected default" — pas l'exhaustivité de ce qui est possible.*

---


---


# 11. Aides contextuelles par item
*(Retour client : possibilité d'ajouter des conseils / tips non bloquants par item)*
Chaque item (ou catégorie) peut porter un **texte d'aide contextuelle** affiché sous forme de petit icône info (ℹ️) cliquable. Ce n'est pas un 5ème niveau de critère mais un système de guidage à part.
Exemples : "Prenez 2 photos (vue d'ensemble + détail)", "Vérifiez le débit d'eau chaude et froide", "Testez chaque prise avec un chargeur".
Ces aides sont définies au niveau plateforme (Flat Checker) et optionnellement personnalisables par workspace en V2.

---

**Colonne "Qté par défaut"** dans le catalogue : indique le nombre d'instances à pré-créer dans le template (Mur = 4, Fenêtre = 1). Le technicien peut ajouter/supprimer des instances sur le terrain ("+ Ajouter un mur").
**Colonne "Labels par défaut"** (`labels_defaut`, JSON array sur `TemplatePieceItem`) : quand la qté > 1, l'admin peut définir des labels prédéfinis qui seront utilisés pour pré-remplir `EvaluationItem.label` à la création de la pièce. Ex : Mur ×4 → ["Mur d'accès","Mur gauche","Mur droit","Mur de face"]. Si aucun label n'est défini, auto-numérotation. Cf [US-833](https://www.notion.so/3271d95b2f8a815187dff7eac418165f).
**Note** : Ce modèle pivot est un sujet d'architecture applicative, pas de spécification Notion. Il sera intégré dans le data model de la base de données Notion existante (table Attributs Modèle de Données).

---


# 12. Prototype
Voici un prototype pour illustrer le paramétrage des pièces, items, critères d’évaluation etc.


<details><summary>Code du prototype en HTML</summary>
```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ImmoChecker — Admin Workspace Prototype</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',system-ui,-apple-system,sans-serif;overflow:hidden;background:#f8fafc}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}
button{font-family:inherit;cursor:pointer}input,select{font-family:inherit}
.fade{animation:fd .18s ease}@keyframes fd{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.si{animation:sli .22s ease}@keyframes sli{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.rh:hover{background:#f9fafb!important}
#root{height:100vh}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const {useState,useCallback,useRef,useEffect}=React;

// SVG Icons
const Ic=({paths,size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,...style}}>{paths.map((p,i)=><path key={i} d={p}/>)}</svg>;
const Icon=({d,size=16,...p})=><Ic size={size} paths={[d]} {...p}/>;
const Search=p=><Ic paths={["M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0","M21 21l-4.35-4.35"]} {...p}/>;
const ChevronRight=p=><Icon d="M9 18l6-6-6-6" {...p}/>;
const Plus=p=><Ic paths={["M12 5v14","M5 12h14"]} {...p}/>;
const X=p=><Ic paths={["M18 6L6 18","M6 6l12 12"]} {...p}/>;
const Home=p=><Ic paths={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]} {...p}/>;
const LayoutGrid=p=><Ic paths={["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"]} {...p}/>;
const Eye=p=><Ic paths={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"]} {...p}/>;
const EyeOff=p=><Ic paths={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94","M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19","M1 1l22 22"]} {...p}/>;
const AlertTriangle=p=><Ic paths={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"]} {...p}/>;
const CheckCircle2=p=><Ic paths={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M9 12l2 2 4-4"]} {...p}/>;
const Check=p=><Icon d="M20 6L9 17l-5-5" {...p}/>;
const Trash2=p=><Ic paths={["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2","M10 11v6","M14 11v6"]} {...p}/>;
const Building2=p=><Ic paths={["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18","M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2","M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2","M10 6h4","M10 10h4","M10 14h4","M10 18h4"]} {...p}/>;
const CornerDownRight=p=><Ic paths={["M15 10l5 5-5 5","M4 4v7a4 4 0 0 0 4 4h12"]} {...p}/>;
const ClipboardList=p=><Ic paths={["M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2","M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z","M12 11h4","M12 16h4","M8 11h.01","M8 16h.01"]} {...p}/>;
const Package=p=><Ic paths={["M16.5 9.4l-9-5.19","M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z","M3.27 6.96L12 12.01l8.73-5.05","M12 22.08V12"]} {...p}/>;
const ArrowLeft=p=><Ic paths={["M19 12H5","M12 19l-7-7 7-7"]} {...p}/>;
const RotateCcw=p=><Ic paths={["M1 4v6h6","M3.51 15a9 9 0 1 0 2.13-9.36L1 10"]} {...p}/>;
const Layers=p=><Ic paths={["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"]} {...p}/>;
const Sliders=p=><Ic paths={["M4 21v-7","M4 10V3","M12 21v-9","M12 8V3","M20 21v-5","M20 12V3","M1 14h6","M9 8h6","M17 16h6"]} {...p}/>;

// DATA
const CRITERES=[{id:"etat",label:"État général",short:"État"},{id:"proprete",label:"Propreté",short:"Propr."},{id:"observation",label:"Observation",short:"Obs."},{id:"photos",label:"Photo(s)",short:"Photos"},{id:"caracteristiques",label:"Caractéristiques",short:"Carac."},{id:"couleur",label:"Couleur",short:"Coul."},{id:"degradations",label:"Dégradation(s)",short:"Dégr."},{id:"fonctionnement",label:"Fonctionnement",short:"Fonct."},{id:"quantite",label:"Quantité",short:"Qté"}];
const NIVEAUX=[{id:"masque",label:"Masqué",short:"Mas.",color:"#94a3b8",bg:"#f8fafc",border:"#e2e8f0"},{id:"optionnel",label:"Optionnel",short:"Opt.",color:"#64748b",bg:"#f1f5f9",border:"#cbd5e1"},{id:"recommande",label:"Recommandé",short:"Rec.",color:"#d97706",bg:"#fffbeb",border:"#fcd34d"},{id:"obligatoire",label:"Obligatoire",short:"Obl.",color:"#dc2626",bg:"#fef2f2",border:"#fca5a5"}];
const defCrit=o=>({etat:"recommande",proprete:"recommande",observation:"optionnel",photos:"recommande",caracteristiques:"masque",couleur:"masque",degradations:"masque",fonctionnement:"masque",quantite:"masque",...o});
const mkI=(id,nom,cat,ctx,cr,dg,su,co)=>({id,nom,categorie:cat,contexte:ctx,source:"plateforme",overrides:{},caracteristiques_values:cr||[],degradations_values:dg||[],sousItems:su||[],_co:co||{}});
const mkS=(id,nom,co,cv,dv)=>({id,nom,criteres:defCrit({etat:"optionnel",proprete:"masque",photos:"optionnel",...co}),overrides:{},caracteristiques_values:cv||[],degradations_values:dv||[]});

const CAT_PROFILES={
  "Revêtements":defCrit({caracteristiques:"recommande",couleur:"optionnel",degradations:"recommande"}),
  "Menuiseries":defCrit({caracteristiques:"recommande",degradations:"recommande",fonctionnement:"recommande"}),
  "Plomberie":defCrit({caracteristiques:"optionnel",degradations:"recommande",proprete:"recommande"}),
  "Cuisine":defCrit({caracteristiques:"optionnel",degradations:"recommande",couleur:"optionnel"}),
  "Sanitaires":defCrit({caracteristiques:"masque",degradations:"recommande",proprete:"recommande"}),
  "Électricité":defCrit({etat:"optionnel",proprete:"masque",fonctionnement:"recommande",photos:"optionnel"}),
  "Chauffage":defCrit({caracteristiques:"recommande",fonctionnement:"recommande",degradations:"recommande"}),
  "Équipements généraux":defCrit({caracteristiques:"recommande",fonctionnement:"recommande",degradations:"optionnel"}),
  "Escalier":defCrit({caracteristiques:"recommande",degradations:"recommande"}),
  "Extérieur":defCrit({caracteristiques:"recommande",degradations:"recommande",photos:"recommande"}),
  "Literie":defCrit({quantite:"recommande",proprete:"masque",photos:"masque",etat:"recommande",degradations:"optionnel"}),
  "Mobilier":defCrit({quantite:"recommande",fonctionnement:"recommande",degradations:"optionnel",photos:"optionnel"}),
  "Électroménager":defCrit({quantite:"recommande",fonctionnement:"obligatoire",degradations:"recommande"}),
  "Vaisselle & couverts":defCrit({quantite:"obligatoire",etat:"masque",proprete:"masque",photos:"masque",degradations:"optionnel"}),
  "Linge":defCrit({quantite:"obligatoire",etat:"optionnel",proprete:"masque",photos:"masque",degradations:"optionnel",couleur:"recommande"}),
  "Entretien":defCrit({quantite:"recommande",etat:"masque",proprete:"masque",photos:"masque",fonctionnement:"recommande"}),
};
const CAT_ICONS={"Revêtements":"🧱","Menuiseries":"🚪","Plomberie":"🔧","Cuisine":"🍳","Sanitaires":"🚽","Électricité":"⚡","Chauffage":"🔥","Équipements généraux":"🛠️","Literie":"🛏️","Mobilier":"🪑","Électroménager":"📺","Vaisselle & couverts":"🍽️","Linge":"🧺","Entretien":"🧹","Escalier":"📐","Extérieur":"🏡"};
const CAT_COLORS={"Revêtements":"#78716c","Menuiseries":"#92400e","Plomberie":"#2563eb","Cuisine":"#ea580c","Sanitaires":"#7c3aed","Électricité":"#ca8a04","Chauffage":"#dc2626","Équipements généraux":"#475569","Literie":"#db2777","Mobilier":"#16a34a","Électroménager":"#dc2626","Vaisselle & couverts":"#ea580c","Linge":"#db2777","Entretien":"#92400e","Escalier":"#64748b","Extérieur":"#16a34a"};

// FULL ITEM CATALOG from Notion DB
const INIT_ITEMS=[
  // === REVÊTEMENTS ===
  mkI("sol","Sol","Revêtements","edl",["Parquet","Carrelage","Vinyle","Moquette","Béton ciré","Lino"],["Rayure(s)","Tache(s)","Éclat(s)","Fissure(s)","Trou(s)"]),
  mkI("mur","Mur","Revêtements","edl",["Peinture","Papier peint","Toile de verre","Crépi","Lambris"],["Tache(s)","Éclat(s)","Fissure(s)","Trou(s)","Moisissure"]),
  mkI("plafond","Plafond","Revêtements","edl",["Peinture","Crépi","Lambris","Placo","Faux plafond"],["Tache(s)","Fissure(s)","Décollement","Moisissure"]),
  mkI("plinthe","Plinthe","Revêtements","edl",["Bois","PVC","Carrelage"],["Éclat(s)","Décollée","Manquante"]),
  mkI("alaise","Alaise / Moulure","Revêtements","edl",["Bois","Plâtre","Polystyrène"],["Éclat(s)","Décollée","Cassée"]),
  // === MENUISERIES ===
  mkI("porte","Porte","Menuiseries","edl",["Pleine","Vitrée","Coulissante","Battante","Bois","PVC"],["Éclat(s)","Rayure(s)","Griffure(s)","Voilée"],[mkS("poignee_porte","Poignée",{fonctionnement:"recommande"}),mkS("serrure_porte","Serrure",{fonctionnement:"recommande"})]),
  mkI("fenetre","Fenêtre","Menuiseries","edl",["Simple vitrage","Double vitrage","Oscillo-battant","PVC","Alu","Velux"],["Fissure(s)","Éclat(s)","Joint défaillant"],[mkS("poignee_fen","Poignée",{fonctionnement:"recommande"}),mkS("volet","Volet / Store",{etat:"recommande",fonctionnement:"recommande"},["Volet roulant","Store vénitien"],["Cassé","Bloqué"]),mkS("gardecorps","Garde-corps",{}),mkS("vitrerie_fen","Vitrerie",{degradations:"recommande"})]),
  mkI("placards","Placards / Rangements","Menuiseries","edl",["Bois","Mélaminé","Coulissant","Battant"],["Éclat(s)","Rail cassé","Porte voilée"]),
  // === PLOMBERIE ===
  mkI("evier","Évier","Plomberie","edl",["Inox","Résine","Céramique","1 bac","2 bacs"],["Rayure(s)","Éclat(s)","Calcaire"],[mkS("robinet_evier","Robinet",{fonctionnement:"obligatoire"},["Mitigeur","Mélangeur"],["Fuite","Calcaire","Grippé"]),mkS("bonde_evier","Bonde",{fonctionnement:"recommande"}),mkS("siphon_evier","Siphon",{fonctionnement:"recommande"}),mkS("joints_evier","Joints",{degradations:"recommande"})]),
  mkI("lavabo","Lavabo","Plomberie","edl",["Céramique","Résine","Suspendu"],["Éclat(s)","Fissure(s)","Calcaire"],[mkS("robinet_lavabo","Robinet",{fonctionnement:"obligatoire"}),mkS("bonde_lavabo","Bonde",{fonctionnement:"recommande"}),mkS("siphon_lavabo","Siphon",{fonctionnement:"recommande"}),mkS("joints_lavabo","Joints",{degradations:"recommande"})]),
  mkI("baignoire","Baignoire","Plomberie","edl",["Acrylique","Fonte","Résine","Encastrée","Sur pieds"],["Éclat(s)","Rayure(s)","Calcaire"],[mkS("robinetterie_baig","Robinetterie",{fonctionnement:"obligatoire"}),mkS("bonde_baig","Bonde",{fonctionnement:"recommande"}),mkS("flexible_baig","Flexible / Pommeau",{fonctionnement:"recommande"}),mkS("parebaig","Pare-baignoire",{})]),
  mkI("douche","Douche","Plomberie","edl",["Italienne","Bac receveur","Cabine"],["Éclat(s)","Calcaire","Moisissure"],[mkS("robinetterie_douche","Robinetterie",{fonctionnement:"obligatoire"}),mkS("flexible_douche","Flexible / Pommeau",{fonctionnement:"recommande"}),mkS("paroi_douche","Paroi / Rideau",{}),mkS("bonde_douche","Bonde",{fonctionnement:"recommande"})]),
  // === CUISINE ===
  mkI("plan_travail","Plan de travail","Cuisine","edl",["Stratifié","Bois massif","Granit","Quartz","Inox"],["Rayure(s)","Tache(s)","Brûlure(s)"]),
  mkI("credence","Crédence","Cuisine","edl",["Carrelage","Verre","Inox","Résine"],["Éclat(s)","Tache(s)","Joint manquant"]),
  mkI("elements_bas","Éléments bas","Cuisine","edl",["Bois","Mélaminé","Laqué"],["Éclat(s)","Porte voilée","Charnière cassée"]),
  mkI("elements_hauts","Éléments hauts","Cuisine","edl",["Bois","Mélaminé","Laqué"],["Éclat(s)","Porte voilée","Charnière cassée"]),
  mkI("meuble_ss_evier","Meuble sous évier","Cuisine","edl",[],["Trace d'humidité","Gonflement","Moisissure"]),
  mkI("plan_bar","Plan bar / Comptoir","Cuisine","edl",["Bois","Granit","Stratifié"],["Rayure(s)","Tache(s)"]),
  mkI("poubelle_enc","Poubelle encastrée","Cuisine","edl",[],["Cassée","Manquante"]),
  mkI("barre_credence","Barre de crédence","Cuisine","edl",[],["Décollée","Rouillée"]),
  mkI("egouttoir","Égouttoir","Cuisine","edl",[],["Rouillé","Manquant"]),
  mkI("porte_couteaux","Porte-couteaux magnétique","Cuisine","edl",[],["Décollé","Démagnétisé"]),
  // === SANITAIRES ===
  mkI("wc","WC","Sanitaires","edl",["Suspendu","Sur pied"],["Fissure(s)","Éclat(s)","Calcaire"],[mkS("cuvette","Cuvette",{proprete:"recommande"}),mkS("lunette","Lunette",{proprete:"recommande"}),mkS("chasse_eau","Chasse d'eau",{fonctionnement:"obligatoire"}),mkS("reservoir","Réservoir",{}),mkS("devidoir","Dévidoir",{})]),
  mkI("bidet","Bidet","Sanitaires","edl",["Céramique","Sur pied","Suspendu"],["Éclat(s)","Fissure(s)","Calcaire"],[mkS("robinet_bidet","Robinet",{fonctionnement:"obligatoire"}),mkS("joints_bidet","Joints",{degradations:"recommande"}),mkS("siphon_bidet","Siphon",{fonctionnement:"recommande"}),mkS("bonde_bidet","Bonde",{fonctionnement:"recommande"})]),
  mkI("lave_mains","Lave-mains","Sanitaires","edl",["Céramique","Résine"],["Éclat(s)","Calcaire"],[mkS("robinet_lm","Robinet",{fonctionnement:"obligatoire"},["Mitigeur","Mélangeur","Temporisé"])]),
  mkI("meuble_ss_lavabo","Meuble sous lavabo","Sanitaires","edl",[],["Gonflé","Trace humidité"]),
  mkI("armoire_pharma","Armoire / Pharmacie","Sanitaires","edl",[],["Miroir cassé","Charnière"]),
  mkI("plan_vasque","Plan vasque","Sanitaires","edl",["Céramique","Résine","Pierre"],["Éclat(s)","Fissure(s)"]),
  // === ÉLECTRICITÉ ===
  mkI("prises","Prises électriques","Électricité","edl",["Standard","USB","Double","Étanche"],["Cassée","Noircie","Fondue"]),
  mkI("interrupteur","Interrupteur(s)","Électricité","edl",["Simple","Double","Variateur","Va-et-vient"],["Cassé","Noirci"]),
  mkI("eclairage","Éclairage","Électricité","edl",["Plafonnier","Spot","Applique","Réglette"],["HS","Scintille","Manquant"]),
  // === CHAUFFAGE ===
  mkI("radiateur","Radiateur","Chauffage","edl",["Électrique","Gaz","Fonte","Alu","Sèche-serviettes"],["Fuite","Oxydation","Noirci"]),
  mkI("cheminee","Cheminée","Chauffage","edl",["Foyer ouvert","Insert","Poêle à bois","Poêle à granulés"],["Fissure","Noirci","Conduit obstrué"]),
  mkI("climatisation","Climatisation","Chauffage","edl",["Split","Réversible","Gainable","Mobile"],["Fuite","Bruit","Filtre encrassé"]),
  mkI("chauffe_eau","Chauffe-eau / Ballon ECS","Chauffage","edl",["Électrique","Gaz","Thermodynamique","Solaire"],["Fuite","Rouille","Calcaire"]),
  mkI("chaudiere","Chaudière / Fuel","Chauffage","edl",["Gaz","Fuel/Fioul","Électrique","Bois","Granulés","PAC","Condensation"],["Fuite","Bruit anormal","Rouille","Pression instable"]),
  mkI("cuve_fuel","Cuve fuel / Citerne","Chauffage","edl",["Enterrée","Aérienne","Plastique","Métal","500L","1000L","2000L"],["Fuite","Rouille","Jauge HS"]),
  mkI("chauffage_co","Chauffage collectif","Chauffage","edl",["Gaz","Électrique","Fuel","Réseau de chaleur"],[]),
  // === ÉQUIPEMENTS GÉNÉRAUX ===
  mkI("porte_paliere","Porte palière","Équipements généraux","edl",["Blindée","Bois","PVC","Coupe-feu"],["Éclat(s)","Rayure(s)","Voilée"],[mkS("poignee_pp","Poignée",{fonctionnement:"recommande"}),mkS("serrure_pp","Serrure",{fonctionnement:"obligatoire"},["3 points","5 points","A2P","Cylindre européen"])]),
  mkI("interphone","Interphone / Visiophone","Équipements généraux","edl",["Audio","Vidéo","Connecté"],["HS","Écran cassé","Grésillement"]),
  mkI("sonnette","Sonnette","Équipements généraux","edl",["Filaire","Sans fil"],["HS","Pile morte"]),
  mkI("judas","Judas","Équipements généraux","edl",[],["Opaque","Manquant"]),
  mkI("detecteur","Détecteur de fumée","Équipements généraux","edl",[],["HS","Pile faible","Manquant"]),
  mkI("bal","Boîte aux lettres","Équipements généraux","edl",[],["Serrure cassée","Porte manquante"]),
  mkI("digicode","Digicode","Équipements généraux","edl",[],["HS","Touche(s) effacée(s)"]),
  mkI("alarme","Alarme","Équipements généraux","edl",["Filaire","Sans fil","Connectée"],["HS","Capteur défaillant"]),
  mkI("verrous","Verrou(s)","Équipements généraux","edl",["Chaîne","Targette","Verrou à bouton"],["Grippé","Cassé"]),
  mkI("ventilation","Ventilation","Équipements généraux","edl",["VMC","Grille","Extracteur","Aération haute","Aération basse"],["Encrassée","HS","Bruyante"]),
  // === ESCALIER ===
  mkI("escalier_int","Escalier intérieur","Escalier","edl",["Bois","Béton","Métal","Pierre","Hélicoïdal"],["Marche(s) cassée(s)","Nez de marche usé(s)","Rampe branlante"]),
  // === EXTÉRIEUR ===
  mkI("rambarde","Rambarde / Garde-corps","Extérieur","edl",["Métal","Bois","Verre","Inox"],["Rouille","Branlant","Manquant"]),
  mkI("store_banne","Store banne","Extérieur","edl",["Manuel","Motorisé"],["Toile déchirée","Mécanisme grippé","Bras cassé"]),
  mkI("portail","Portail / Portillon","Extérieur","edl",["Bois","Métal","PVC","Motorisé"],["Rouille","Voilé","Moteur HS"]),
  mkI("cloture","Clôture / Haie","Extérieur","edl",["Grillage","Bois","PVC","Haie végétale"],["Cassée","Déformée","Non entretenue"]),
  mkI("porte_garage","Porte de garage","Extérieur","edl",["Basculante","Sectionnelle","Enroulable","Battante"],["Voilée","Rouille","Moteur HS"]),
  mkI("toiture","Toiture","Extérieur","edl",["Tuiles","Ardoises","Zinc","Tôle","Bac acier"],["Tuile(s) cassée(s)","Mousse","Infiltration","Faîtage abîmé"]),
  mkI("facade","Façade","Extérieur","edl",["Enduit","Crépi","Pierre","Brique","Bardage bois"],["Fissure(s)","Écaillement","Mousse","Noircissement"]),
  mkI("gouttieres","Gouttières / Descentes EP","Extérieur","edl",["Zinc","PVC","Alu","Cuivre"],["Percé(e)","Bouché(e)","Décroché(e)"]),
  mkI("pelouse","Pelouse","Extérieur","edl",[],["Jaunie","Dégarnie","Mauvaises herbes","Mousse"]),
  mkI("arbres","Arbres / Arbustes","Extérieur","edl",[],["Mort","Malade","Non taillé","Branches cassées"]),
  mkI("massifs","Massifs / Plantations","Extérieur","edl",[],["Non entretenu(s)","Dégarni(s)","Mort(s)"]),
  mkI("allees","Allées / Circulation","Extérieur","edl",["Gravier","Pavé","Béton","Dalle","Enrobé"],["Fissure(s)","Affaissement","Nid-de-poule"]),
  mkI("escalier_ext","Escalier extérieur","Extérieur","edl",["Béton","Pierre","Bois","Métal"],["Marche(s) cassée(s)","Mousse","Rampe branlante"]),
  mkI("porche","Porche / Véranda / Loggia","Extérieur","edl",["Alu","PVC","Bois","Vitrage simple","Vitrage double"],["Vitrage fêlé","Infiltration","Moisissure"]),
  // === LITERIE (Inventaire) ===
  mkI("lit","Lit","Literie","inventaire",["Simple","Double","Superposé","Mezzanine"],["Tache(s)","Cassé"],[mkS("matelas","Matelas",{etat:"recommande",proprete:"recommande"})]),
  mkI("sommier","Sommier","Literie","inventaire",["À lattes","Tapissier","Électrique"],["Latte(s) cassée(s)","Affaissé"]),
  mkI("couette","Couette(s)","Literie","inventaire",[],["Tache(s)","Déchirure"]),
  mkI("oreiller","Oreiller(s)","Literie","inventaire",[],["Tache(s)","Aplati"]),
  mkI("traversin","Traversin","Literie","inventaire",[],["Tache(s)"]),
  mkI("edredon","Édredon / Couvre-lit","Literie","inventaire",[],["Tache(s)","Déchirure"]),
  // === MOBILIER (Inventaire) ===
  mkI("table","Table","Mobilier","inventaire",["Bois","Verre","Métal","Extensible"],["Rayure(s)","Tache(s)","Branlante"]),
  mkI("chaise","Chaise","Mobilier","inventaire",["Bois","Métal","Tissu","Plastique"],["Rayure(s)","Déchirure"]),
  mkI("canape","Canapé","Mobilier","inventaire",["Tissu","Cuir","Convertible","D'angle"],["Tache(s)","Déchirure","Affaissement"]),
  mkI("fauteuil","Fauteuil","Mobilier","inventaire",["Tissu","Cuir","Rotin"],["Tache(s)","Déchirure"]),
  mkI("armoire","Armoire","Mobilier","inventaire",["Bois","Mélaminé","Métal"],["Rayure(s)","Porte cassée"]),
  mkI("commode","Commode","Mobilier","inventaire",["Bois","Mélaminé"],["Rayure(s)","Tiroir bloqué"]),
  mkI("bureau_meuble","Bureau","Mobilier","inventaire",["Bois","Métal","Verre"],["Rayure(s)","Branlant"]),
  mkI("table_nuit","Table de nuit","Mobilier","inventaire",["Bois","Métal"],["Rayure(s)"]),
  mkI("table_basse","Table basse","Mobilier","inventaire",["Bois","Verre","Métal"],["Rayure(s)","Fissure(s)"]),
  mkI("meuble_tv","Meuble TV","Mobilier","inventaire",["Bois","Mélaminé","Métal"],["Rayure(s)"]),
  mkI("etagere","Étagère","Mobilier","inventaire",["Bois","Métal","Verre"],["Branlante","Tablette cassée"]),
  mkI("luminaire","Luminaire","Mobilier","inventaire",["Suspension","Lampe de table","Lampadaire"],["HS","Abat-jour cassé"]),
  mkI("tapis","Tapis","Mobilier","inventaire",[],["Tache(s)","Usé","Décoloré"]),
  mkI("miroir","Miroir","Mobilier","inventaire",["Mural","Sur pied"],["Fêlé","Piqué"]),
  // === MOBILIER EXTÉRIEUR ===
  mkI("table_ext","Table extérieure","Mobilier","inventaire",["Bois","Métal","Résine"],["Rayure(s)","Rouille"]),
  mkI("chaise_ext","Chaise de jardin","Mobilier","inventaire",["Bois","Métal","Résine","Textilène"],["Rouille","Déchirure"]),
  mkI("parasol","Parasol","Mobilier","inventaire",["Déporté","Droit"],["Toile déchirée","Mât cassé"]),
  mkI("barbecue","Barbecue","Mobilier","inventaire",["Gaz","Charbon","Électrique","Pierre"],["Rouille","Grille abîmée"]),
  // === ÉLECTROMÉNAGER (Inventaire) ===
  mkI("frigo","Réfrigérateur","Électroménager","inventaire",[],["Rayure(s)","Bosse","Rouille"]),
  mkI("lavelinge","Lave-linge","Électroménager","inventaire",[],["Rayure(s)","Bosse","Fuite"]),
  mkI("lavevaisselle","Lave-vaisselle","Électroménager","inventaire",[],["Rayure(s)","Fuite"]),
  mkI("four","Four","Électroménager","inventaire",[],["Rayure(s)","Rouille","Vitre cassée"]),
  mkI("microondes","Micro-ondes","Électroménager","inventaire",[],["Rayure(s)","Rouille"]),
  mkI("plaque","Plaque de cuisson","Électroménager","inventaire",["Gaz","Induction","Vitrocéramique","Mixte"],["Rayure(s)","Brûleur HS"]),
  mkI("hotte","Hotte aspirante","Électroménager","inventaire",["Décorative","Casquette","Encastrable"],["Filtre encrassé","Éclairage HS","Moteur bruyant"]),
  mkI("sechelinge","Sèche-linge","Électroménager","inventaire",[],["Rayure(s)","Bosse"]),
  mkI("congelateur","Congélateur","Électroménager","inventaire",[],["Rayure(s)","Givre excessif"]),
  mkI("bouilloire","Bouilloire","Électroménager","inventaire",[],["Calcaire","Couvercle cassé"]),
  mkI("cafetiere","Cafetière","Électroménager","inventaire",["Filtre","Expresso","Nespresso","Dosettes"],["Calcaire","Fuite"]),
  mkI("tv","Télévision","Électroménager","inventaire",[],["Pixel(s) mort(s)","Télécommande manquante"]),
  mkI("aspirateur","Aspirateur","Électroménager","inventaire",["Traîneau","Balai","Robot"],["Aspiration faible","Accessoire manquant"]),
  mkI("box_internet","Box Internet","Électroménager","inventaire",[],["HS","Câble manquant"]),
  mkI("videoprojecteur","Vidéoprojecteur","Électroménager","inventaire",["LED","Laser","Full HD","4K"],["Lampe HS","Pixel(s) mort(s)"]),
  // === VAISSELLE & COUVERTS (Inventaire) ===
  mkI("assiettes","Assiettes","Vaisselle & couverts","inventaire",[],["Ébréché(s)","Fissure(s)"]),
  mkI("bols","Bols / Tasses / Mugs","Vaisselle & couverts","inventaire",[],["Ébréché(s)","Fissure(s)"]),
  mkI("verres","Verres","Vaisselle & couverts","inventaire",[],["Ébréché(s)","Fissure(s)"]),
  mkI("couteaux","Couteaux","Vaisselle & couverts","inventaire",[],["Oxydé(s)","Lame émoussée"]),
  mkI("fourchettes","Fourchettes","Vaisselle & couverts","inventaire",[],["Oxydé(s)","Tordu(s)"]),
  mkI("cuilleres","Cuillères","Vaisselle & couverts","inventaire",[],["Oxydé(s)"]),
  mkI("casserole","Casserole(s)","Vaisselle & couverts","inventaire",[],["Rayure(s)","Fond brûlé","Revêtement abîmé"]),
  mkI("poele","Poêle(s)","Vaisselle & couverts","inventaire",[],["Rayure(s)","Revêtement abîmé"]),
  mkI("spatules","Spatules / Louches","Vaisselle & couverts","inventaire",[],["Fondue","Cassée"]),
  mkI("plat","Plat(s) / Saladier(s)","Vaisselle & couverts","inventaire",[],["Ébréché","Fissure(s)"]),
  mkI("cocotte","Cocotte","Vaisselle & couverts","inventaire",[],["Éclat émail","Rouille"]),
  mkI("passoire","Passoire / Ouvre-boîte","Vaisselle & couverts","inventaire",[],["Rouille","Cassé"]),
  mkI("plateau","Plateau","Vaisselle & couverts","inventaire",[],["Rayure(s)"]),
  // === LINGE (Inventaire) ===
  mkI("draps","Draps","Linge","inventaire",[],["Tache(s)","Déchirure"]),
  mkI("housse_couette","Housse de couette","Linge","inventaire",[],["Tache(s)","Déchirure"]),
  mkI("serviettes_bain","Serviettes de bain","Linge","inventaire",[],["Tache(s)","Usé(s)"]),
  mkI("torchons","Torchons","Linge","inventaire",[],["Tache(s)","Usé(s)"]),
  mkI("rideaux","Rideaux","Linge","inventaire",["Occultant","Voilage","Double rideau","Lin","Coton"],["Tache(s)","Déchirure","Décoloré"]),
  mkI("coussin","Coussin(s)","Linge","inventaire",[],["Tache(s)","Aplati"]),
  mkI("nappe","Nappe / Sets de table","Linge","inventaire",[],["Tache(s)","Déchirure"]),
  mkI("couverture","Couverture / Plaid","Linge","inventaire",[],["Tache(s)","Bouloché"]),
  mkI("peignoir","Peignoir","Linge","inventaire",[],["Tache(s)","Usé"]),
  mkI("gants_toilette","Gants de toilette","Linge","inventaire",[],["Usé(s)"]),
  // === ENTRETIEN (Inventaire) ===
  mkI("brosse_wc","Brosse WC","Entretien","inventaire",[],["Usée"]),
  mkI("balai","Balai / Serpillière","Entretien","inventaire",[],["Usé"]),
  mkI("tondeuse","Tondeuse à gazon","Entretien","inventaire",["Électrique","Thermique","Robot"],["Lame émoussée","HS"]),
  mkI("tuyau_arrosage","Tuyau d'arrosage","Entretien","inventaire",[],["Percé","Raccord cassé"]),
];

const INIT_PIECES=[
  {id:"entree",nom:"Entrée / Hall",cat:"Pièces de vie",emoji:"🚪",items:["sol","mur","plafond","porte","plinthe","interrupteur","prises","eclairage"]},
  {id:"salon",nom:"Salon / Séjour",cat:"Pièces de vie",emoji:"🛋️",items:["sol","mur","plafond","porte","fenetre","plinthe","prises","interrupteur","eclairage","radiateur","table","canape","fauteuil","table_basse","meuble_tv","luminaire","tapis","rideaux","tv"]},
  {id:"cuisine",nom:"Cuisine",cat:"Pièces de vie",emoji:"🍳",items:["sol","mur","plafond","porte","fenetre","evier","plan_travail","credence","elements_bas","elements_hauts","meuble_ss_evier","plinthe","prises","interrupteur","eclairage","frigo","lavevaisselle","four","microondes","plaque","hotte","assiettes","bols","verres","couteaux","fourchettes","cuilleres","casserole","poele","torchons"]},
  {id:"chambre",nom:"Chambre",cat:"Pièces de vie",emoji:"🛏️",items:["sol","mur","plafond","porte","fenetre","plinthe","prises","interrupteur","eclairage","radiateur","lit","armoire","commode","table_nuit","luminaire","rideaux","draps","housse_couette"]},
  {id:"sdb",nom:"Salle de bain",cat:"Eau & Sanitaires",emoji:"🛁",items:["sol","mur","plafond","porte","lavabo","baignoire","douche","prises","interrupteur","eclairage","radiateur","ventilation","lavelinge","serviettes_bain","peignoir"]},
  {id:"wc_piece",nom:"WC / Toilettes",cat:"Eau & Sanitaires",emoji:"🚽",items:["sol","mur","plafond","porte","wc","lave_mains","plinthe","prises","interrupteur","eclairage","ventilation","brosse_wc"]},
  {id:"couloir",nom:"Couloir",cat:"Circulations",emoji:"↔️",items:["sol","mur","plafond","porte","plinthe","prises","interrupteur","eclairage"]},
  {id:"balcon",nom:"Balcon",cat:"Extérieurs",emoji:"🌿",items:["sol","mur","eclairage","prises","rambarde"]},
  {id:"cave",nom:"Cave",cat:"Annexes",emoji:"📦",items:["sol","mur","plafond","porte","prises","interrupteur","eclairage"]},
];

const PCATS=["Pièces de vie","Eau & Sanitaires","Circulations","Extérieurs","Annexes"];

// UI COMPONENTS
function NivIcon({id,size}){const s=size||11;if(id==="masque")return <EyeOff size={s}/>;if(id==="optionnel")return <Eye size={s}/>;if(id==="recommande")return <AlertTriangle size={s}/>;if(id==="obligatoire")return <CheckCircle2 size={s}/>;return null;}
function Badge({text,color,bg,s}){return <span style={{display:"inline-flex",alignItems:"center",padding:s?"1px 6px":"2px 8px",borderRadius:4,fontSize:s?10:11,fontWeight:600,color:color||"#64748b",background:bg||"#f1f5f9",whiteSpace:"nowrap"}}>{text}</span>;}
function Btn({children,primary,small,ghost,onClick,icon:IC,disabled}){return <button disabled={disabled} onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:6,padding:small?"5px 10px":"8px 16px",borderRadius:8,fontSize:small?12:13,fontWeight:600,color:primary?"#fff":ghost?"#64748b":"#475569",background:primary?"#0f172a":ghost?"transparent":"#fff",border:primary?"none":ghost?"none":"1px solid #e2e8f0",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1}}>{IC&&<IC size={small?12:14}/>}{children}</button>;}

// FIXED dropdown: uses position:fixed + portal to avoid overflow crop
function NivPick({value,onChange,compact}){
  const[open,setOpen]=useState(false);
  const n=NIVEAUX.find(x=>x.id===value)||NIVEAUX[0];
  const btnRef=useRef(null);
  const menuRef=useRef(null);
  const[pos,setPos]=useState({top:0,left:0});

  useEffect(()=>{
    if(!open)return;
    const h=e=>{if(menuRef.current&&!menuRef.current.contains(e.target)&&btnRef.current&&!btnRef.current.contains(e.target))setOpen(false)};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);

  const handleOpen=e=>{
    e.stopPropagation();
    if(!open&&btnRef.current){
      const r=btnRef.current.getBoundingClientRect();
      const menuH=160;
      const spaceBelow=window.innerHeight-r.bottom-8;
      setPos({
        top:spaceBelow>=menuH?r.bottom+4:r.top-menuH-4,
        left:Math.min(r.left,window.innerWidth-180)
      });
    }
    setOpen(!open);
  };

  return <>
    <button ref={btnRef} onClick={handleOpen} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:3,padding:compact?"2px 6px":"4px 10px",borderRadius:6,fontSize:compact?10:11,fontWeight:700,color:n.color,background:n.bg,border:`1.5px solid ${n.border}`,cursor:"pointer",minWidth:compact?44:60,transition:"all .1s"}}><NivIcon id={n.id} size={compact?9:11}/>{compact?n.short:n.label}</button>
    {open&&ReactDOM.createPortal(
      <div ref={menuRef} style={{position:"fixed",top:pos.top,left:pos.left,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,.15)",zIndex:9999,minWidth:160,padding:4}}>
        {NIVEAUX.map(nv=><button key={nv.id} onClick={e=>{e.stopPropagation();onChange(nv.id);setOpen(false)}} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 10px",border:"none",background:nv.id===value?nv.bg:"transparent",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600,color:nv.color}}><NivIcon id={nv.id} size={12}/>{nv.label}{nv.id===value&&<Check size={11} style={{marginLeft:"auto"}}/>}</button>)}
      </div>,
      document.body
    )}
  </>;
}

function DrawerPanel({open,onClose,title,sub,width,children}){
  if(!open)return null;
  return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"flex-end"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(15,23,42,.3)"}}/>
    <div className="si" style={{position:"relative",width:width||680,maxWidth:"94vw",height:"100vh",background:"#fff",boxShadow:"-8px 0 30px rgba(0,0,0,.1)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div><div style={{fontSize:16,fontWeight:700,color:"#0f172a"}}>{title}</div>{sub&&<div style={{fontSize:12,color:"#94a3b8",marginTop:1}}>{sub}</div>}</div>
        <button onClick={onClose} style={{border:"none",background:"#f1f5f9",borderRadius:6,padding:6,cursor:"pointer",display:"flex"}}><X size={16} style={{color:"#64748b"}}/></button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>{children}</div>
    </div>
  </div>;
}
function ModalBox({open,onClose,title,w,children}){
  if(!open)return null;
  return <div style={{position:"fixed",inset:0,zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(15,23,42,.4)"}}/>
    <div className="fade" style={{position:"relative",background:"#fff",borderRadius:14,width:w||520,maxWidth:"90vw",maxHeight:"85vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.15)",padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h3 style={{fontSize:16,fontWeight:700,color:"#0f172a"}}>{title}</h3><button onClick={onClose} style={{border:"none",background:"#f1f5f9",borderRadius:6,padding:4,cursor:"pointer",display:"flex"}}><X size={16} style={{color:"#64748b"}}/></button></div>
      {children}
    </div>
  </div>;
}
function TagPill({text,color}){const c=color||"#3b82f6";return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,fontSize:12,fontWeight:500,color:c,background:c+"12",border:`1px solid ${c}25`}}>{text}</span>;}
function tagSection(label,color,values){
  if(!values||!values.length)return null;
  return <div style={{marginTop:6}}><div style={{fontSize:10,fontWeight:700,color,marginBottom:3}}>{label}</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{values.map(v=><TagPill key={v} text={v} color={color}/>)}</div></div>;
}
function critGrid(criteres,onChange){
  return <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4}}>{CRITERES.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",borderRadius:6,background:"#f8fafc",border:"1px solid #f1f5f9"}}><span style={{fontSize:11,fontWeight:500,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:75}}>{c.label}</span><NivPick value={criteres[c.id]} onChange={v=>onChange(c.id,v)} compact/></div>)}</div>;
}
function groupBy(arr,key){const g={};arr.forEach(i=>{const k=typeof key==="function"?key(i):i[key];if(!g[k])g[k]=[];g[k].push(i)});return g;}

// MAIN APP
function App(){
  const[view,setView]=useState("parametrage");
  const[items,setItems]=useState(INIT_ITEMS);
  const[pieces,setPieces]=useState(INIT_PIECES);
  const[catProfiles,setCatProfiles]=useState(CAT_PROFILES);
  const[dPiece,setDPiece]=useState(null);
  const[dItem,setDItem]=useState(null);
  const[dSub,setDSub]=useState(null);
  const[dCat,setDCat]=useState(null);
  const[catTab,setCatTab]=useState("edl");
  const[searchQ,setSearchQ]=useState("");
  const[pCtx,setPCtx]=useState("edl");
  const[showAddItems,setShowAddItems]=useState(false);
  const[showNewSub,setShowNewSub]=useState(false);
  const[addIS,setAddIS]=useState("");
  const[nsN,setNsN]=useState("");

  const gi=useCallback(id=>items.find(i=>i.id===id),[items]);
  const allCats=[...new Set(items.map(i=>i.categorie))];

  const getEffective=useCallback((item,critId)=>{
    if(item.overrides&&item.overrides[critId])return item.overrides[critId];
    const cp=catProfiles[item.categorie];return cp?cp[critId]:"recommande";
  },[catProfiles]);
  const hasOv=useCallback(item=>item.overrides&&Object.keys(item.overrides).length>0,[]);
  const countOv=useCallback(cat=>items.filter(i=>i.categorie===cat&&hasOv(i)).length,[items,hasOv]);
  const updateCatProfile=useCallback((cat,critId,val)=>setCatProfiles(p=>({...p,[cat]:{...p[cat],[critId]:val}})),[]);
  const setItemOverride=useCallback((itemId,critId,val)=>{
    setItems(p=>p.map(it=>{
      if(it.id!==itemId)return it;
      const cp=catProfiles[it.categorie];
      if(cp&&cp[critId]===val){const o={...it.overrides};delete o[critId];return{...it,overrides:o};}
      return{...it,overrides:{...it.overrides,[critId]:val}};
    }));
  },[catProfiles]);
  const clearOv=useCallback(id=>setItems(p=>p.map(it=>it.id!==id?it:{...it,overrides:{}})),[]);
  const ucSub=useCallback((iid,sid,cid,v)=>setItems(p=>p.map(it=>{if(it.id!==iid)return it;return{...it,sousItems:it.sousItems.map(si=>si.id===sid?{...si,criteres:{...si.criteres,[cid]:v}}:si)};})),[]);

  const pc=dPiece?pieces.find(p=>p.id===dPiece):null;
  const curItem=dItem?items.find(i=>i.id===dItem):null;
  const curSub=dSub&&curItem?curItem.sousItems.find(s=>s.id===dSub):null;

  return <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",height:"100vh",background:"#f8fafc",display:"flex",overflow:"hidden"}}>
    {/* SIDEBAR */}
    <div style={{width:220,height:"100vh",background:"#0f172a",padding:"16px 8px",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px",marginBottom:24}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center"}}><Building2 size={14} style={{color:"#fff"}}/></div>
        <div><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>ImmoChecker</div><div style={{fontSize:10,color:"#64748b"}}>Admin Workspace</div></div>
      </div>
      {[{id:"pieces",l:"Pièces & Templates",ic:Home},{id:"catalogue",l:"Catalogue Items",ic:LayoutGrid},{id:"parametrage",l:"Paramétrage Critères",ic:Sliders}].map(n=>{const IC=n.ic;const a=view===n.id;return <button key={n.id} onClick={()=>{setView(n.id);setDItem(null);setDSub(null);setDPiece(null);setDCat(null)}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:8,border:"none",background:a?"#1e293b":"transparent",color:a?"#fff":"#94a3b8",fontSize:12,fontWeight:a?600:500,textAlign:"left",marginBottom:2,width:"100%"}}><IC size={15}/>{n.l}</button>})}
      <div style={{marginTop:"auto",padding:"10px 8px",borderTop:"1px solid #1e293b"}}><div style={{fontSize:10,color:"#475569"}}>Workspace</div><div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginTop:1}}>Flat Checker SAS</div></div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"20px 28px",height:"100vh"}}>

    {/* PIECES */}
    {view==="pieces"&&<div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
        <div><h2 style={{fontSize:20,fontWeight:700,color:"#0f172a",margin:0}}>Pièces & Templates</h2><p style={{fontSize:13,color:"#94a3b8",margin:"3px 0 0"}}>Cliquez sur une pièce pour configurer ses items</p></div>
      </div>
      {Object.entries(groupBy(pieces,"cat")).map(([cat,pcs])=><div key={cat} style={{marginBottom:24}}>
        <h3 style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"#94a3b8",margin:"0 0 8px"}}>{cat}</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:8}}>
          {pcs.map(p=><div key={p.id} onClick={()=>{setDPiece(p.id);setDItem(null);setDSub(null)}} className="rh" style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,cursor:"pointer"}}><span style={{fontSize:18,width:28,textAlign:"center"}}>{p.emoji}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{p.nom}</div><div style={{fontSize:12,color:"#94a3b8"}}>{p.items.length} items</div></div><ChevronRight size={14} style={{color:"#cbd5e1"}}/></div>)}
        </div>
      </div>)}
    </div>}

    {/* CATALOGUE */}
    {view==="catalogue"&&<div className="fade">
      <div style={{marginBottom:16}}><h2 style={{fontSize:20,fontWeight:700,color:"#0f172a",margin:0}}>Catalogue Items</h2><p style={{fontSize:13,color:"#94a3b8",margin:"3px 0 0"}}>{items.length} items · {items.filter(i=>i.sousItems.length>0).reduce((a,i)=>a+i.sousItems.length,0)} sous-items</p></div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <div style={{display:"flex",background:"#f1f5f9",borderRadius:8,padding:3,gap:2}}>{[{id:"edl",l:"EDL",c:"#2563eb"},{id:"inventaire",l:"Inventaire",c:"#7c3aed"}].map(o=><button key={o.id} onClick={()=>setCatTab(o.id)} style={{padding:"6px 14px",borderRadius:6,border:"none",fontSize:13,fontWeight:600,background:catTab===o.id?"#fff":"transparent",color:catTab===o.id?o.c:"#64748b",boxShadow:catTab===o.id?"0 1px 3px rgba(0,0,0,.06)":"none",cursor:"pointer"}}>{o.l}</button>)}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,flex:1,maxWidth:300}}><Search size={14} style={{color:"#94a3b8"}}/><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher…" style={{border:"none",background:"transparent",outline:"none",fontSize:13,flex:1,color:"#0f172a"}}/></div>
      </div>
      {Object.entries(groupBy(items.filter(i=>i.contexte===catTab&&(!searchQ||i.nom.toLowerCase().includes(searchQ.toLowerCase()))),"categorie")).map(([cat,list])=><div key={cat} style={{marginBottom:20}}>
        <h3 style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"#94a3b8",margin:"0 0 6px"}}>{CAT_ICONS[cat]||"📦"} {cat} <span style={{fontWeight:500}}>({list.length})</span></h3>
        {list.map(it=><div key={it.id} onClick={()=>{setDItem(it.id);setDSub(null)}} className="rh" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,cursor:"pointer",marginBottom:3}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{it.nom}</span>{hasOv(it)&&<Badge text={Object.keys(it.overrides).length+" ov."} color="#d97706" bg="#fffbeb" s/>}</div>{it.sousItems.length>0&&<div style={{fontSize:12,color:"#94a3b8",marginTop:1}}>┗ {it.sousItems.map(s=>s.nom).join(", ")}</div>}</div>
          <ChevronRight size={14} style={{color:"#cbd5e1"}}/>
        </div>)}
      </div>)}
    </div>}

    {/* PARAMETRAGE — LIST */}
    {view==="parametrage"&&!dCat&&<div className="fade">
      <div style={{marginBottom:6}}><h2 style={{fontSize:20,fontWeight:700,color:"#0f172a",margin:0}}>Paramétrage des critères</h2><p style={{fontSize:13,color:"#94a3b8",margin:"3px 0 0"}}>Profils par défaut par catégorie — cliquez pour ajuster les items</p></div>
      <div style={{display:"flex",gap:8,marginBottom:16}}><div style={{display:"flex",background:"#f1f5f9",borderRadius:8,padding:3,gap:2}}>{[{id:"edl",l:"EDL",c:"#2563eb"},{id:"inventaire",l:"Inventaire",c:"#7c3aed"}].map(o=><button key={o.id} onClick={()=>setPCtx(o.id)} style={{padding:"6px 14px",borderRadius:6,border:"none",fontSize:13,fontWeight:600,background:pCtx===o.id?"#fff":"transparent",color:pCtx===o.id?o.c:"#64748b",boxShadow:pCtx===o.id?"0 1px 3px rgba(0,0,0,.06)":"none",cursor:"pointer"}}>{o.l}</button>)}</div></div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0"}}>
        <div style={{display:"grid",gridTemplateColumns:"260px repeat(9,1fr)",background:"#f8fafc",borderBottom:"2px solid #e2e8f0",padding:"10px 0",borderRadius:"12px 12px 0 0"}}>
          <div style={{padding:"0 16px",fontSize:12,fontWeight:700,color:"#475569"}}>Catégorie</div>
          {CRITERES.map(c=><div key={c.id} style={{textAlign:"center",fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".04em"}}>{c.short}</div>)}
        </div>
        {allCats.filter(cat=>items.some(i=>i.categorie===cat&&i.contexte===pCtx)).map(cat=>{
          const n=items.filter(i=>i.categorie===cat&&i.contexte===pCtx).length;
          const ov=countOv(cat);const profile=catProfiles[cat]||defCrit();
          return <div key={cat} onClick={()=>setDCat(cat)} className="rh" style={{display:"grid",gridTemplateColumns:"260px repeat(9,1fr)",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f1f5f9",cursor:"pointer"}}>
            <div style={{padding:"0 16px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16,width:24,textAlign:"center"}}>{CAT_ICONS[cat]||"📦"}</span>
              <div><div style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{cat}</div><div style={{fontSize:11,color:"#94a3b8"}}>{n} items{ov>0&&<span style={{color:"#d97706",fontWeight:600}}> · {ov} override{ov>1?"s":""}</span>}</div></div>
            </div>
            {CRITERES.map(c=><div key={c.id} style={{display:"flex",justifyContent:"center"}} onClick={e=>e.stopPropagation()}>
              <NivPick value={profile[c.id]} onChange={v=>updateCatProfile(cat,c.id,v)} compact/>
            </div>)}
          </div>;
        })}
      </div>
      <div style={{marginTop:16,padding:"12px 16px",background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:10,fontSize:13,color:"#92400e"}}><strong>💡</strong> Chaque catégorie définit le profil par défaut. Cliquez sur une catégorie pour voir les items et ajuster les exceptions (overrides).</div>
    </div>}

    {/* PARAMETRAGE — CATEGORY DETAIL */}
    {view==="parametrage"&&dCat&&<div className="fade">
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setDCat(null)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#475569"}}><ArrowLeft size={14}/>Retour</button>
        <span style={{fontSize:22}}>{CAT_ICONS[dCat]||"📦"}</span>
        <div><h2 style={{fontSize:20,fontWeight:700,color:"#0f172a",margin:0}}>{dCat}</h2><p style={{fontSize:13,color:"#94a3b8",margin:0}}>{items.filter(i=>i.categorie===dCat&&i.contexte===pCtx).length} items · {countOv(dCat)} override(s)</p></div>
      </div>
      {/* Category profile */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><Layers size={16} style={{color:CAT_COLORS[dCat]||"#475569"}}/><span style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>Profil par défaut</span><span style={{fontSize:12,color:"#94a3b8"}}>— hérité par tous les items</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {CRITERES.map(c=>{const profile=catProfiles[dCat]||defCrit();return <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"#f8fafc",border:"1px solid #f1f5f9"}}>
            <span style={{fontSize:12,fontWeight:600,color:"#475569"}}>{c.label}</span>
            <NivPick value={profile[c.id]} onChange={v=>updateCatProfile(dCat,c.id,v)} compact/>
          </div>;})}
        </div>
      </div>
      {/* Items table */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>Items</span><span style={{fontSize:12,color:"#94a3b8"}}>{countOv(dCat)} override(s) sur {items.filter(i=>i.categorie===dCat&&i.contexte===pCtx).length}</span></div>
        <div style={{display:"grid",gridTemplateColumns:"200px repeat(9,1fr) 40px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",padding:"8px 0"}}>
          <div style={{padding:"0 16px",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>Item</div>
          {CRITERES.map(c=><div key={c.id} style={{textAlign:"center",fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>{c.short}</div>)}
          <div></div>
        </div>
        {items.filter(i=>i.categorie===dCat&&i.contexte===pCtx).map(it=>{
          const ho=hasOv(it);
          return <div key={it.id}>
            <div style={{display:"grid",gridTemplateColumns:"200px repeat(9,1fr) 40px",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9",background:ho?"#fffbeb":"#fff"}}>
              <div style={{padding:"0 16px",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13,fontWeight:600,color:"#0f172a",cursor:"pointer"}} onClick={()=>{setDItem(it.id);setDSub(null)}}>{it.nom}</span>
                {ho&&<Badge text="ov." color="#d97706" bg="#fef3c7" s/>}
              </div>
              {CRITERES.map(c=>{
                const eff=getEffective(it,c.id);const isOv=it.overrides&&it.overrides[c.id];
                return <div key={c.id} style={{display:"flex",justifyContent:"center",position:"relative"}}>
                  <NivPick value={eff} onChange={v=>setItemOverride(it.id,c.id,v)} compact/>
                  {isOv&&<div style={{position:"absolute",top:-2,right:4,width:6,height:6,borderRadius:3,background:"#d97706"}}/>}
                </div>;
              })}
              <div style={{display:"flex",justifyContent:"center"}}>{ho&&<button onClick={()=>clearOv(it.id)} title="Réinitialiser" style={{border:"none",background:"none",cursor:"pointer",color:"#fbbf24",display:"flex"}}><RotateCcw size={12}/></button>}</div>
            </div>
            {it.sousItems.map(si=><div key={si.id} style={{display:"grid",gridTemplateColumns:"200px repeat(9,1fr) 40px",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f8fafc",background:"#fafbfd"}}>
              <div style={{padding:"0 16px 0 32px",display:"flex",alignItems:"center",gap:4}}><CornerDownRight size={10} style={{color:"#c4b5fd"}}/><span style={{fontSize:12,fontWeight:500,color:"#64748b"}}>{si.nom}</span></div>
              {CRITERES.map(c=><div key={c.id} style={{display:"flex",justifyContent:"center"}}><NivPick value={si.criteres[c.id]} onChange={v=>ucSub(it.id,si.id,c.id,v)} compact/></div>)}
              <div/>
            </div>)}
          </div>;
        })}
      </div>
    </div>}

    </div>

    {/* PIECE DRAWER */}
    {pc&&!dItem&&<DrawerPanel open={true} onClose={()=>setDPiece(null)} title={pc.emoji+" "+pc.nom} sub={pc.cat+" · "+pc.items.length+" items"} width={520}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:600,color:"#475569"}}>Items de la pièce</span><Btn small icon={Plus} onClick={()=>{setShowAddItems(true);setAddIS("")}}>Ajouter</Btn></div>
      {[{ctx:"edl",label:"Items EDL",color:"#2563eb",bg:"#eff6ff",border:"#bfdbfe",ic:ClipboardList},{ctx:"inventaire",label:"Items Inventaire",color:"#7c3aed",bg:"#f5f3ff",border:"#c4b5fd",ic:Package}].map(sec=>{
        const sI=pc.items.map(id=>gi(id)).filter(Boolean).filter(i=>i.contexte===sec.ctx);
        const g=groupBy(sI,"categorie");const IC=sec.ic;
        return <div key={sec.ctx} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"6px 10px",background:sec.bg,borderRadius:8,border:`1px solid ${sec.border}`}}><IC size={14} style={{color:sec.color}}/><span style={{fontSize:13,fontWeight:700,color:sec.color}}>{sec.label}</span><span style={{fontSize:11,color:sec.color+"99",marginLeft:"auto"}}>{sI.length}</span></div>
          {sI.length===0?<div style={{padding:12,textAlign:"center",color:"#cbd5e1",fontSize:13,background:"#f8fafc",borderRadius:8,border:"1px dashed #e2e8f0"}}>Aucun item</div>:Object.entries(g).map(([cat,list])=><div key={cat} style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"#94a3b8",marginBottom:4}}>{cat}</div>{list.map(item=><div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"1px solid #f1f5f9",background:"#fff",marginBottom:3}}><span onClick={()=>{setDItem(item.id);setDSub(null)}} style={{flex:1,fontSize:13,fontWeight:600,color:"#0f172a",cursor:"pointer"}}>{item.nom}</span>{item.sousItems.length>0&&<Badge text={item.sousItems.length+" sous"} color="#7c3aed" bg="#f5f3ff" s/>}<button onClick={()=>setPieces(p=>p.map(x=>x.id!==pc.id?x:{...x,items:x.items.filter(i=>i!==item.id)}))} style={{border:"none",background:"none",cursor:"pointer",color:"#cbd5e1",padding:2}}><Trash2 size={12}/></button></div>)}</div>)}
        </div>;
      })}
      <ModalBox open={showAddItems} onClose={()=>setShowAddItems(false)} title="Ajouter des items">
        <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8}}><Search size={14} style={{color:"#94a3b8"}}/><input value={addIS} onChange={e=>setAddIS(e.target.value)} placeholder="Rechercher…" style={{border:"none",background:"transparent",outline:"none",fontSize:13,flex:1,color:"#0f172a"}}/></div>
        <div style={{maxHeight:340,overflowY:"auto"}}>{items.filter(i=>!pc.items.includes(i.id)&&(!addIS||i.nom.toLowerCase().includes(addIS.toLowerCase()))).map(i=><div key={i.id} onClick={()=>setPieces(p=>p.map(x=>x.id!==pc.id?x:{...x,items:[...x.items,i.id]}))} className="rh" style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,cursor:"pointer"}}><Plus size={13} style={{color:"#3b82f6"}}/><span style={{flex:1,fontSize:13,fontWeight:500,color:"#334155"}}>{i.nom}</span><Badge text={i.contexte==="edl"?"EDL":"Inv."} color={i.contexte==="edl"?"#2563eb":"#7c3aed"} bg={i.contexte==="edl"?"#eff6ff":"#f5f3ff"} s/></div>)}</div>
      </ModalBox>
    </DrawerPanel>}

    {/* ITEM DRAWER */}
    {curItem&&!curSub&&<DrawerPanel open={true} onClose={()=>{setDItem(null);setDSub(null)}} title={curItem.nom} sub={curItem.categorie+" · "+(curItem.contexte==="edl"?"EDL":"Inventaire")} width={680}>
      <div style={{display:"flex",gap:8,marginBottom:14}}><Badge text={curItem.contexte==="edl"?"EDL":"Inventaire"} color={curItem.contexte==="edl"?"#2563eb":"#7c3aed"} bg={curItem.contexte==="edl"?"#eff6ff":"#f5f3ff"}/><Badge text="Flat Checker" color="#0d9488" bg="#f0fdfa"/>{hasOv(curItem)&&<Badge text={Object.keys(curItem.overrides).length+" override(s)"} color="#d97706" bg="#fffbeb"/>}</div>
      <div style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:6}}>Critères <span style={{fontWeight:400,color:"#94a3b8"}}>(hérité de « {curItem.categorie} » sauf overrides)</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:10}}>
        {CRITERES.map(c=>{
          const eff=getEffective(curItem,c.id);const isOv=curItem.overrides&&curItem.overrides[c.id];
          return <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",borderRadius:6,background:isOv?"#fffbeb":"#f8fafc",border:isOv?"1.5px solid #fcd34d":"1px solid #f1f5f9"}}>
            <span style={{fontSize:11,fontWeight:500,color:isOv?"#92400e":"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:75}}>{c.label}{isOv?" ✎":""}</span>
            <NivPick value={eff} onChange={v=>setItemOverride(curItem.id,c.id,v)} compact/>
          </div>;
        })}
      </div>
      {hasOv(curItem)&&<div style={{marginBottom:12}}><Btn small ghost icon={RotateCcw} onClick={()=>clearOv(curItem.id)}>Supprimer les overrides</Btn></div>}
      {tagSection("Caractéristiques","#3b82f6",curItem.caracteristiques_values)}
      {tagSection("Dégradations","#dc2626",curItem.degradations_values)}
      {curItem.sousItems.length>0&&<>
        <div style={{fontSize:12,fontWeight:700,color:"#475569",marginTop:18,marginBottom:8}}>Sous-items ({curItem.sousItems.length})</div>
        {curItem.sousItems.map(si=><div key={si.id} style={{marginBottom:6,padding:"10px 12px",borderRadius:8,border:"1px solid #f1f5f9",background:"#fafbfd"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><CornerDownRight size={12} style={{color:"#c4b5fd"}}/><span style={{fontSize:13,fontWeight:700,color:"#475569"}}>{si.nom}</span></div>
          {critGrid(si.criteres,(cid,v)=>ucSub(curItem.id,si.id,cid,v))}
          {tagSection("Caractéristiques","#3b82f6",si.caracteristiques_values)}
          {tagSection("Dégradations","#dc2626",si.degradations_values)}
        </div>)}
      </>}
    </DrawerPanel>}

  </div>;
}

ReactDOM.render(<App/>,document.getElementById('root'));
</script>
</body>
</html>

```
</details>


[file](https://prod-files-secure.s3.us-west-2.amazonaws.com/2adc5933-e1ea-40af-98c4-16357de5311a/c6e1b2b7-55c1-4203-be24-0bf20bc69c5e/immochecker-prototype-v6_%281%29.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466XIX6Z2VT%2F20260326%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260326T125202Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIDtOaJCnSw84LXYSgJQHOsbGvkRzOLvPyAu8%2Bj20NmcoAiAdGMpxcjiG4KltzchurmVByJeuzI3L0PpyTgPHZFctNyqIBAjF%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMDqrRq40bSTGKk9JdKtwDqYJU%2BK5gvUf9qo%2Bc6IzeoSQZEjlQu6DigHgezds1ez%2F8lOawwJGJnOnLfrO7wGqniT2ZRw6XTIOyCvnz8rRTkOpoAFnmoL6OXGit8FJ%2FMcrKR%2BgIgbR9dzRl2DcEgcsRn%2BZejRRpL1SIuav9xoc3GYi6Wp5V1ZLyr%2FZPVnNaEQFAwPvxvHVyEmvEjIwzMSw6QZ%2F%2F9VJr7RoUa1LVLgLQqtTwTtCCt7aegY%2B7IjTE20EdukYMFtoE6NaPtxLRCRcrGSWGoX3gdR7zJ80acRsy4yUIrVBkX4HxUwbW2lCNVkxI2WKhTNxW2qMaNKdN0Q0tsyXpHK8zs%2Boiw8nwqcRfz3uVrilHP1H1dAS8yfq181Lb3PgaZJwTIWGsING%2BB7eehK8p27GHuAm%2Fe561TDdc7nqea8KfguEgayfRysJB2T%2FV9kFhTe4dEj62HgZddD6uOrR0acnN6LjetzsJbqACcRo0KzG%2ByF%2FZ273aTzDFCYsqu2Tvbp57jNsj6xVdFuD%2F5CL%2BitxTCxDfplCaBvCid7%2BgA%2BuIQSnWUBAy3ls%2FGPwRo0UwzW%2BilmryDTe%2FT5yKYxuvofMvIYxfD%2FzOv6qElAM8rrOAoNmqgfBaEmzX5w1ikTsQG4ppPRbz3yMwk7SUzgY6pgEmdhq%2BwByLdsdFgRaZFFtHKMKAiD%2BBkaJTC6dEQhHof%2F4XOU4fF59Ay5N21j2a%2F1%2Fgvik1WvbxL%2FIgNWEjWm1xgABo%2BZigS80r9Xrunl%2FopTDAMNXgtBYVxwJWrl5veUBTEdFV9CskvCKd6hEA%2FUwDVBJ7fgLRqDf9qmLb6V69YDj4c5pRArZBJmB8nt%2F3UW4MfR7PNU8PaSa7T7h8B5Utyr3IQS5i&X-Amz-Signature=3712e18eda7486663fabb792e6ad08060688e9f13a0e6fd219841646ca6041e2&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

---

📊 **Sous-database:** 🏠 Pièces
📊 **Sous-database:** 📦 Items EDL & Inventaire