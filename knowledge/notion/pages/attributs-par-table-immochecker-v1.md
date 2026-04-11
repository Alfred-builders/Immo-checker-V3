---
notion_id: "3131d95b-2f8a-8164-9209-fa1f42bf2275"
notion_url: "https://www.notion.so/Attributs-par-Table-ImmoChecker-V1-3131d95b2f8a81649209fa1f42bf2275"
last_synced: "2026-03-26T12:51:58.261Z"
created: "2026-02-26T15:32:00.000Z"
last_edited: "2026-03-18T09:19:00.000Z"
properties:
  title: "📝 Attributs par Table — ImmoChecker V1"
---

# 📝 Attributs par Table — ImmoChecker V1

| Propriete | Valeur |
|-----------|--------|

Ce document liste les attributs de chaque table principale du modèle de données ImmoChecker V1.

## 🗃️ Database des attributs

---


## 🔍 Comment utiliser cette database
**Vue "Revue client"** — à créer pour partager avec Flat Checker :
- Filtrer `Technique = false` ET `Pivot = false`
- Grouper par `Table`
- Masquer les colonnes `Technique`, `Pivot`, `Notes_client`
**Vue "Complète (interne)"** — vue par défaut pour l'équipe :
- Toutes les entrées visibles
- Grouper par `Table`
- Colonnes `Technique` et `Pivot` visibles

---


## 📌 Légende des flags
| Flag | Signification |
| **Technique** ☑ | Champ interne (IDs, clés étrangères, metadata système) — pas besoin de validation client |
| **Pivot** ☑ | Attribut d'une table de liaison (WorkspaceUser, TiersOrganisation) — contexte technique |

---


## 📋 Tables couvertes
28 tables modélisées :
**Couche Auth** : Workspace, Utilisateur, WorkspaceUser *(pivot)*
**Couche Tiers** : Tiers, TiersOrganisation *(pivot)*, LotProprietaire *(pivot)*, EDLLocataire *(pivot)*
**Couche Patrimoine** : Batiment, AdresseBatiment, Lot, AccesLot, CompteurLot, ReleveCompteur, ValeurReleveCompteur
**Couche Opérationnelle** : Mission, MissionTechnicien *(pivot)*, CleMission, IndisponibiliteTechnicien, EDL_Inventaire, PieceEDL, EvaluationItem, Photo
**Couche Catalogue** : TypePiece, CatalogueItem, ValeurReferentiel, ConfigCritereCategorie, ConfigCritereItem, TemplatePieceItem *(pivot)*
**Couche Préférences** : UserPreference
📊 **Sous-database:** 🗃️ Attributs par Table — ImmoChecker V1