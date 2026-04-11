---
notion_id: "5a6d90f0-b7ea-4106-95e6-f5094176bdc0"
notion_url: "https://www.notion.so/5a6d90f0b7ea410695e6f5094176bdc0"
type: database
entries: 211
last_synced: "2026-03-26T12:50:12.801Z"
---

# 📊 📦 Items EDL & Inventaire

> 211 entrees | [Ouvrir dans Notion](https://www.notion.so/5a6d90f0b7ea410695e6f5094176bdc0)

## Schema

| Propriete | Type | Options |
|-----------|------|---------|
| Qté par défaut | number |  |
| Catégorie | select | Revêtements, Menuiseries, Plomberie, Cuisine, Sanitaires, Électricité, Chauffage, Équipements généraux, Literie, Mobilier, Électroménager, Vaisselle & couverts, Linge, Entretien, Escalier, Extérieur, Compteurs |
| Valeurs Dégradations | rich_text |  |
| ⚙️ Couleur | select | Masqué, Optionnel, Recommandé, Obligatoire |
| ⚙️ Photos | select | Masqué, Optionnel, Recommandé, Obligatoire |
| Sous-items | relation |  |
| Source | select | Plateforme, Workspace |
| ⚙️ Dégradations | select | Masqué, Optionnel, Recommandé, Obligatoire |
| ⚙️ Propreté | select | Masqué, Optionnel, Recommandé, Obligatoire |
| ⚙️ Fonctionnement | select | Masqué, Optionnel, Recommandé, Obligatoire |
| Contexte | select | EDL, Inventaire |
| ⚙️ Caractéristiques | select | Masqué, Optionnel, Recommandé, Obligatoire |
| Valeurs Caractéristiques | rich_text |  |
| ⚙️ Quantité | select | Masqué, Optionnel, Recommandé, Obligatoire |
| Item parent | relation |  |
| Pièces | relation |  |
| ⚙️ État général | select | Masqué, Optionnel, Recommandé, Obligatoire |
| Nom | title |  |

## Donnees

| # | Nom | Qté par défaut | Catégorie | Valeurs Dégradations | ⚙️ Couleur | ⚙️ Photos | Sous-items |
|---|---|---|---|---|---|---|---|
| 1 | Chaudière / Fuel |  | Chauffage | Fuite, Bruit anormal, Rouille, Odeur, Pression instable, Pur | Masqué | Recommandé |  |
| 2 | Barbecue / Plancha |  | Mobilier | Rouille, Grille abîmée, Brûleur HS, Peinture écaillée | Masqué | Recommandé |  |
| 3 | Poignée (porte) |  | Menuiseries | Cassée, Branlante, Mal fixée | Masqué | Optionnel |  |
| 4 | Cuve fuel / Citerne |  | Chauffage | Fuite, Rouille, Jauge HS, Odeur, Bac de rétention défaillant | Masqué | Recommandé |  |
| 5 | Alarme |  | Équipements généraux | Défaillante, Sirène HS | Masqué | Optionnel |  |
| 6 | Crédence |  | Cuisine | Éclat(s), Tache(s), Fissure(s), Décollement | Masqué | Optionnel |  |
| 7 | Miroir |  | Mobilier | Fêlé, Cassé, Tache(s), Désilvré | Masqué | Optionnel |  |
| 8 | Verseuse(s) |  | Vaisselle & couverts | Fissure(s), Couvercle manquant | Masqué | Masqué |  |
| 9 | Gant(s) de toilette |  | Linge |  | Optionnel | Masqué |  |
| 10 | Lave-vaisselle |  | Électroménager | Rayure(s), Bosse, Rouille, Joint usé | Masqué | Optionnel |  |
| 11 | Plinthe |  | Revêtements | Éclat(s), Décollée, Manquante, Tache(s) | Optionnel | Optionnel |  |
| 12 | Couvert(s) à salade |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 13 | Lavabo / Vasque |  | Plomberie | Éclat(s), Fissure(s), Tache(s), Calcaire, Rayure(s) | Masqué | Recommandé | 3251d95b-2f8a-8189-91d7-cae23ff0b5d9, 3251d95b-2f8a-81ca-80f |
| 14 | Couette(s) |  | Literie | Tache(s), Déchirure, Usure | Optionnel | Masqué |  |
| 15 | WC |  | Sanitaires | Fissure(s), Éclat(s), Tache(s), Calcaire | Masqué | Recommandé | 3251d95b-2f8a-81a9-9b85-ced1fe2fa986, 3251d95b-2f8a-8198-94a |
| 16 | Flexible / Pommeau (douche) |  | Plomberie | Fuite, Calcaire, Percé | Masqué | Optionnel |  |
| 17 | Fauteuil(s) de jardin |  | Mobilier | Rouille, Cassé, Décoloré, Tressage défait | Masqué | Optionnel |  |
| 18 | Serviettes de bain |  | Linge | Tache(s), Déchirure, Usure, Décoloré(es) | Optionnel | Masqué |  |
| 19 | Cuillères |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 20 | Porte de garage |  | Extérieur | Bosse, Oxydation, Bloquée, Peinture écaillée | Masqué | Recommandé |  |
| 21 | Douche |  | Plomberie | Éclat(s), Fissure(s), Calcaire, Joint défaillant, Moisissure | Masqué | Recommandé | 3251d95b-2f8a-8115-9c4b-ec4d97b293bd, 3251d95b-2f8a-81d4-919 |
| 22 | Fourchettes |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 23 | Boîte aux lettres |  | Équipements généraux | Serrure HS, Bosse, Rouille, Porte cassée | Masqué | Optionnel |  |
| 24 | Tuyau d'arrosage |  | Entretien | Percé, Déformé, Raccord cassé | Masqué | Masqué |  |
| 25 | Baignoire |  | Plomberie | Éclat(s), Rayure(s), Tache(s), Calcaire, Jaunissement, Joint | Masqué | Recommandé | 3251d95b-2f8a-817a-a059-f07a51b1b7fd, 3251d95b-2f8a-812d-996 |
| 26 | Tableau de fusibles |  | Équipements généraux |  | Masqué | Recommandé |  |
| 27 | Poignée (fenêtre) |  | Menuiseries | Cassée, Branlante, Grippée | Masqué | Optionnel |  |
| 28 | Robinet (bidet) |  | Sanitaires | Fuite, Calcaire, Grippé | Masqué | Optionnel |  |
| 29 | Éclairage(s) |  | Électricité | Cassé, Noirci, Ampoule manquante | Masqué | Optionnel |  |
| 30 | Plat(s) |  | Vaisselle & couverts | Ébréché(s), Fissure(s), Tache(s) | Masqué | Masqué |  |
| 31 | Trappe de visite (douche) |  | Plomberie | Cassée, Manquante, Mal fixée | Masqué | Optionnel |  |
| 32 | Joints (baignoire) |  | Plomberie | Défaillant(s), Moisi(s), Noirci(s), Absent(s) | Masqué | Masqué |  |
| 33 | Bonde (douche) |  | Plomberie | Grippée, Bouchée, Fuite, Calcaire | Masqué | Masqué |  |
| 34 | Buffet / Vaisselier |  | Mobilier | Rayure(s), Éclat(s), Porte cassée, Charnière HS | Optionnel | Recommandé |  |
| 35 | Portail / Portillon |  | Extérieur | Oxydation, Voilé, Bloqué, Peinture écaillée | Masqué | Recommandé |  |
| 36 | Bonde (baignoire) |  | Plomberie | Grippée, Bouchée, Fuite, Calcaire | Masqué | Masqué |  |
| 37 | Micro-ondes |  | Électroménager | Porte cassée, Plateau manquant, Rouille intérieure | Masqué | Optionnel |  |
| 38 | Robinet (lave-mains) |  | Sanitaires | Fuite, Calcaire, Grippé | Masqué | Optionnel |  |
| 39 | Meuble sous lavabo |  | Sanitaires | Trace(s) d'humidité, Gonflement, Moisissure, Porte cassée, C | Masqué | Optionnel |  |
| 40 | Pare-baignoire / Pare-douche |  | Plomberie | Fissure(s), Calcaire, Moisissure, Joint défaillant | Masqué | Optionnel |  |
| 41 | Robinetterie (douche) |  | Plomberie | Fuite, Calcaire, Grippé | Masqué | Optionnel |  |
| 42 | Sommier |  | Literie | Latte(s) cassée(s), Affaissement, Grincement | Masqué | Optionnel |  |
| 43 | Siphon (bidet) |  | Sanitaires | Fuite, Bouché, Oxydé | Masqué | Masqué |  |
| 44 | Housse(s) de canapé |  | Linge | Tache(s), Déchirure, Décoloré(e) | Optionnel | Masqué |  |
| 45 | Habillage (baignoire) |  | Plomberie | Décollé, Fissuré, Moisissure, Tache(s) | Masqué | Optionnel |  |
| 46 | Tondeuse à gazon |  | Entretien | Lame émoussée, HS, Bac manquant | Masqué | Optionnel |  |
| 47 | Aspirateur |  | Électroménager | Cassé, Aspiration faible, Accessoire manquant | Masqué | Masqué |  |
| 48 | Passoire(s) |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 49 | Joints (bidet) |  | Sanitaires | Défaillant(s), Moisi(s), Noirci(s), Absent(s) | Masqué | Masqué |  |
| 50 | Draps |  | Linge | Tache(s), Déchirure, Usure, Élastique détendu | Optionnel | Masqué |  |
| 51 | Détecteur de fumée |  | Équipements généraux | HS, Pile morte, Manquant | Masqué | Optionnel |  |
| 52 | Théière / Carafe |  | Vaisselle & couverts | Ébréché(e), Fissure(s) | Masqué | Masqué |  |
| 53 | Cocotte(s) / Autocuiseur |  | Vaisselle & couverts | Rayure(s), Revêtement abîmé, Joint usé | Masqué | Masqué |  |
| 54 | Joints (lavabo) |  | Plomberie | Défaillant(s), Moisi(s), Noirci(s), Absent(s) | Masqué | Masqué |  |
| 55 | Plateau(x) |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 56 | Lave-mains |  | Sanitaires | Éclat(s), Fissure(s), Calcaire | Masqué | Optionnel | 3251d95b-2f8a-812d-b40b-d475e8f0b37d |
| 57 | Cafetière / Machine à café |  | Électroménager |  | Masqué | Masqué |  |
| 58 | Tabouret(s) |  | Mobilier | Rayure(s), Branlant, Assise déchirée | Optionnel | Masqué |  |
| 59 | Bouilloire |  | Électroménager | Calcaire, Couvercle cassé, Fuite | Masqué | Masqué |  |
| 60 | Bocal(aux) |  | Vaisselle & couverts | Ébréché(s), Fissure(s), Couvercle manquant | Masqué | Masqué |  |
| 61 | Fauteuil(s) |  | Mobilier | Tache(s), Déchirure, Affaissement | Optionnel | Optionnel |  |
| 62 | Torchons |  | Linge | Tache(s), Usure, Déchirure | Masqué | Masqué |  |
| 63 | Sonnette |  | Équipements généraux | HS, Bouton cassé | Masqué | Masqué |  |
| 64 | Chasse d'eau |  | Sanitaires |  | Masqué | Optionnel |  |
| 65 | Sol |  | Revêtements | Rayure(s), Tache(s), Éclat(s), Fissure(s), Trou(s), Décollem | Optionnel | Recommandé |  |
| 66 | Dessous de plat(s) |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 67 | Gant(s) de four / Manique(s) |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 68 | Escalier extérieur |  | Extérieur | Marche(s) cassée(s), Mousse, Fissure(s), Rampe branlante, Ne | Masqué | Optionnel |  |
| 69 | Siphon (lavabo) |  | Plomberie | Fuite, Bouché, Oxydé | Masqué | Masqué |  |
| 70 | Plan bar |  | Cuisine | Rayure(s), Tache(s), Éclat(s) | Masqué | Optionnel |  |
| 71 | Trappe de visite (baignoire) |  | Plomberie | Cassée, Manquante, Mal fixée | Masqué | Optionnel |  |
| 72 | Serviette(s) de table |  | Linge |  | Optionnel | Masqué |  |
| 73 | Fer à repasser |  | Électroménager | Semelle rayée, Fuite, HS | Masqué | Masqué |  |
| 74 | Arbres / Arbustes |  | Extérieur | Mort, Malade, Non taillé, Envahissant, Branches cassées | Masqué | Recommandé |  |
| 75 | Bannette(s) / Caisson(s) |  | Mobilier | Cassé, Bosse, Roulette(s) HS | Masqué | Masqué |  |
| 76 | Table |  | Mobilier | Rayure(s), Tache(s), Éclat(s), Branlante | Optionnel | Recommandé |  |
| 77 | Vitrerie (porte) |  | Menuiseries | Fêlé, Cassé, Rayure(s) | Masqué | Optionnel |  |
| 78 | Porte palière |  | Équipements généraux | Éclat(s), Rayure(s), Griffure(s), Voilée, Ne ferme pas | Masqué | Recommandé | 3251d95b-2f8a-819c-8a14-ff259fe639c7, 3251d95b-2f8a-81da-9dd |
| 79 | Convertible / Clic-clac / BZ |  | Mobilier | Tache(s), Déchirure, Affaissement, Mécanisme HS | Optionnel | Recommandé |  |
| 80 | Sèche-linge |  | Électroménager | Bruyant, Rouille, Joint usé | Masqué | Optionnel |  |
| 81 | Poubelle encastrée |  | Cuisine | Cassée, Pédale HS, Couvercle manquant, Odeur | Masqué | Optionnel |  |
| 82 | Mur | 4 | Revêtements | Trace(s) diffuse(s), Légères traces, Traces importantes, Imp | Recommandé | Recommandé |  |
| 83 | Traversin(s) |  | Literie | Tache(s), Affaissement | Masqué | Masqué |  |
| 84 | Coquetier(s) |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 85 | Habillage (douche) |  | Plomberie | Décollé, Fissuré, Moisissure, Tache(s), Joint défaillant | Masqué | Optionnel |  |
| 86 | Matelas |  | Literie | Tache(s), Affaissement, Déchirure | Masqué | Optionnel |  |
| 87 | Canapé |  | Mobilier | Tache(s), Déchirure, Affaissement, Griffure(s) | Recommandé | Recommandé |  |
| 88 | Interphone / Visiophone |  | Équipements généraux | Cassé, Grésillement, Écran HS | Masqué | Optionnel |  |
| 89 | Égouttoir |  | Cuisine | Oxydé, Cassé | Masqué | Masqué |  |
| 90 | Multiprise(s) |  | Électroménager | Câble endommagé, Prise fondue, Interrupteur HS | Masqué | Masqué |  |
| 91 | Fenêtre |  | Menuiseries | Fissure(s), Éclat(s), Rayure(s), Joint défaillant, Condensat | Masqué | Recommandé | 3251d95b-2f8a-8121-81c1-d649450f0878, 3251d95b-2f8a-81e0-b89 |
| 92 | Spatule(s) / Louche(s) |  | Vaisselle & couverts | Cassé(e), Fondu(e), Déformé(e) | Masqué | Masqué |  |
| 93 | Peignoir(s) |  | Linge |  | Optionnel | Masqué |  |
| 94 | Ramequin(s) / Coupelle(s) |  | Vaisselle & couverts | Ébréché(s), Fissure(s) | Masqué | Masqué |  |
| 95 | Bonde (évier) |  | Plomberie | Grippée, Bouchée, Fuite, Calcaire | Masqué | Masqué |  |
| 96 | Meuble sous évier |  | Cuisine | Trace(s) d'humidité, Gonflement, Moisissure, Porte cassée, C | Masqué | Optionnel |  |
| 97 | Alaise / Moulure |  | Revêtements | Éclat(s), Décollée, Manquante, Fissurée, Cassée | Optionnel | Optionnel |  |
| 98 | Robinetterie (baignoire) |  | Plomberie | Fuite, Calcaire, Grippé | Masqué | Optionnel |  |
| 99 | Judas optique |  | Équipements généraux | Opacifié, Cassé, Manquant | Masqué | Masqué |  |
| 100 | Placards / Rangements |  | Menuiseries | Éclat(s), Rayure(s), Porte cassée, Charnière HS, Rail cassé | Masqué | Recommandé |  |
| 101 | Soucoupe(s) |  | Vaisselle & couverts | Ébréché(es), Fissure(s) | Masqué | Masqué |  |
| 102 | Bonde (bidet) |  | Sanitaires | Grippée, Bouchée, Fuite, Calcaire | Masqué | Masqué |  |
| 103 | Bureau |  | Mobilier | Rayure(s), Tache(s), Éclat(s) | Optionnel | Optionnel |  |
| 104 | Ventilation |  | Équipements généraux | Encrassée, HS, Bruyante, Grille cassée, Filtre manquant | Masqué | Optionnel |  |
| 105 | Banc extérieur |  | Mobilier | Rouille, Cassé, Latte(s) abîmée(s) | Masqué | Optionnel |  |
| 106 | Table à repasser |  | Électroménager | Instable, Housse usée, Pieds cassés | Masqué | Masqué |  |
| 107 | Chaîne Hi-fi / Enceinte |  | Électroménager | Rayure(s), HS, Télécommande manquante | Masqué | Optionnel |  |
| 108 | Étagère(s) de rangement |  | Mobilier | Rayure(s), Branlante, Éclat(s), Tordue | Masqué | Optionnel |  |
| 109 | Balai / Serpillière |  | Entretien |  | Masqué | Masqué |  |
| 110 | Meuble TV / Multimédia |  | Mobilier | Rayure(s), Éclat(s), Porte cassée | Optionnel | Optionnel |  |
| 111 | Robinet (lavabo) |  | Plomberie | Fuite, Calcaire, Grippé | Masqué | Optionnel |  |
| 112 | Couteaux |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 113 | Dévidoir WC |  | Sanitaires |  | Masqué | Masqué |  |
| 114 | Armoire à pharmacie / Miroir SDB |  | Sanitaires | Éclat(s), Miroir fêlé, Charnière HS, Rouille | Masqué | Optionnel |  |
| 115 | Bols / Tasses / Mugs |  | Vaisselle & couverts | Ébréché(s), Fissure(s), Tache(s) | Masqué | Masqué |  |
| 116 | Table de nuit |  | Mobilier | Rayure(s), Éclat(s), Tache(s), Tiroir cassé | Optionnel | Optionnel |  |
| 117 | Massifs de fleurs / Plantations |  | Extérieur | Non entretenu(s), Dégarni(s), Envahi(s) mauvaises herbes, Mo | Masqué | Optionnel |  |
| 118 | Éléments bas cuisine |  | Cuisine | Éclat(s), Rayure(s), Porte cassée, Charnière HS, Gonflement | Masqué | Recommandé |  |
| 119 | Réfrigérateur |  | Électroménager | Rayure(s), Bosse, Rouille, Joint usé | Masqué | Recommandé |  |
| 120 | Pelouse |  | Extérieur | Jaunie, Dégarnie, Envahie mauvaises herbes, Trous, Mousse, N | Masqué | Recommandé |  |
| 121 | Éléments hauts cuisine |  | Cuisine | Éclat(s), Rayure(s), Porte cassée, Charnière HS, Gonflement | Masqué | Recommandé |  |
| 122 | Radiateur / Chauffage |  | Chauffage | Fuite, Oxydation, Noirci, Mal fixé | Masqué | Optionnel |  |
| 123 | Armoire |  | Mobilier | Rayure(s), Éclat(s), Porte cassée, Charnière HS, Rail cassé, | Optionnel | Recommandé |  |
| 124 | Lunette / Abattant |  | Sanitaires | Cassée, Fissurée, Jaunissement | Masqué | Optionnel |  |
| 125 | Casserole(s) |  | Vaisselle & couverts | Rayure(s), Revêtement abîmé, Déformée, Poignée cassée | Masqué | Masqué |  |
| 126 | Entretien chaudière |  | Chauffage |  | Masqué | Optionnel |  |
| 127 | Vitrerie (fenêtre) |  | Menuiseries | Fêlé, Cassé, Rayure(s), Condensation entre vitrages, Joint d | Masqué | Optionnel |  |
| 128 | Poignée (porte palière) |  | Équipements généraux | Cassée, Branlante, Mal fixée | Masqué | Optionnel |  |
| 129 | Cendrier(s) |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 130 | Interrupteur(s) |  | Électricité | Cassé, Noirci, Mal fixé | Masqué | Optionnel |  |
| 131 | Lave-linge |  | Électroménager | Rayure(s), Bosse, Rouille, Joint usé, Vibre anormalement | Masqué | Recommandé |  |
| 132 | Brosse WC |  | Entretien |  | Masqué | Masqué |  |
| 133 | Store banne |  | Extérieur | Toile déchirée, Bras cassé, Manivelle HS | Masqué | Optionnel |  |
| 134 | Commode |  | Mobilier | Rayure(s), Éclat(s), Tiroir cassé, Poignée cassée, Gonflemen | Optionnel | Optionnel |  |
| 135 | Housse(s) de couette |  | Linge | Tache(s), Déchirure, Usure, Décoloré(e) | Optionnel | Masqué |  |
| 136 | Rideaux |  | Linge | Tache(s), Déchirure, Décoloré | Recommandé | Optionnel |  |
| 137 | Grille-pain |  | Électroménager | Noirci, Bloque, Levier cassé | Masqué | Masqué |  |
| 138 | Cheminée |  | Chauffage | Noirci, Fissure(s), Éclat(s) | Masqué | Recommandé |  |
| 139 | Cuvette |  | Sanitaires | Éclat(s), Fissure(s), Calcaire, Tache(s) | Masqué | Optionnel |  |
| 140 | Vidéoprojecteur |  | Électroménager | Lampe HS, Pixel(s) mort(s), Télécommande manquante, Ventilat | Masqué | Optionnel |  |
| 141 | Garde-corps (fenêtre) |  | Menuiseries | Oxydation, Branlant, Mal fixé, Manquant | Masqué | Optionnel |  |
| 142 | Escabeau |  | Mobilier |  | Masqué | Masqué |  |
| 143 | Clôture / Haie |  | Extérieur | Oxydation, Cassée, Manquante, Déformée | Masqué | Optionnel |  |
| 144 | Rambarde / Garde-corps |  | Extérieur | Oxydation, Branlante, Manquante | Masqué | Optionnel |  |
| 145 | Pot(s) de fleur(s) |  | Mobilier |  | Masqué | Masqué |  |
| 146 | Cuisinière |  | Électroménager | Rayure(s), Brûlure, Éclat(s), Rouille, Porte défaillante | Masqué | Recommandé |  |
| 147 | Digicode / Badge |  | Équipements généraux | HS, Touches usées, Écran HS | Masqué | Masqué |  |
| 148 | Climatisation |  | Chauffage | Fuite réfrigérant, Bruit anormal, Télécommande manquante, Fi | Masqué | Optionnel |  |
| 149 | Tupperware / Boîte(s) de rangement |  | Vaisselle & couverts | Couvercle manquant, Déformé(e), Taché(e) | Masqué | Masqué |  |
| 150 | Chauffe-eau / Ballon ECS |  | Chauffage | Fuite, Oxydation, Calcaire, Groupe de sécurité défaillant, T | Masqué | Optionnel |  |
| 151 | Ouvre-boîte / Décapsuleur / Tire-bouchon |  | Vaisselle & couverts |  | Masqué | Masqué |  |
| 152 | Table basse |  | Mobilier | Rayure(s), Tache(s), Éclat(s) | Optionnel | Optionnel |  |
| 153 | Bidet |  | Sanitaires | Éclat(s), Fissure(s), Calcaire | Masqué | Optionnel | 3251d95b-2f8a-8121-bda1-c054b89f0148, 3251d95b-2f8a-8136-9cf |
| 154 | Luminaire(s) |  | Mobilier | Cassé, Ampoule manquante | Masqué | Optionnel |  |
| 155 | Serrure (porte) |  | Menuiseries | Grippée, Cassée, Difficile, Clé coincée | Masqué | Optionnel |  |
| 156 | Toiture |  | Extérieur | Tuile(s) cassée(s), Tuile(s) manquante(s), Mousse, Infiltrat | Masqué | Recommandé |  |
| 157 | Porte-couteaux / Bloc couteaux |  | Cuisine | Cassé, Magnétique défaillant | Masqué | Masqué |  |
| 158 | Allées / Circulation extérieure |  | Extérieur | Fissure(s), Affaissement, Décollement, Mousse, Mauvaises her | Masqué | Optionnel |  |
| 159 | Lit / Couchage |  | Literie | Tache(s), Déchirure, Cassé, Affaissement | Masqué | Recommandé |  |
| 160 | Parasol |  | Mobilier | Toile déchirée, Décoloré, Mât cassé, Manivelle HS | Masqué | Optionnel |  |
| 161 | Escalier intérieur |  | Escalier | Marche(s) abîmée(s), Rampe branlante, Nez de marche usé(s),  | Masqué | Recommandé |  |
| 162 | Barre de crédence / Crémaillère |  | Cuisine | Mal fixée, Oxydée, Crochet(s) manquant(s) | Masqué | Masqué |  |
| 163 | Poêle(s) |  | Vaisselle & couverts | Rayure(s), Revêtement abîmé, Déformée, Poignée cassée | Masqué | Masqué |  |
| 164 | Saladier(s) |  | Vaisselle & couverts | Ébréché(s), Fissure(s), Rayure(s) | Masqué | Masqué |  |
| 165 | Dressing / Penderie |  | Mobilier | Rayure(s), Porte cassée, Charnière HS, Rail cassé | Optionnel | Recommandé |  |
| 166 | Télévision |  | Électroménager | Rayure(s), Pixel mort, Télécommande manquante, Écran fêlé | Masqué | Optionnel |  |
| 167 | Plan vasque |  | Sanitaires | Éclat(s), Tache(s), Fissure(s), Gonflement, Trace(s) d'humid | Masqué | Optionnel |  |
| 168 | Bonde (lavabo) |  | Plomberie | Grippée, Bouchée, Fuite, Calcaire | Masqué | Masqué |  |
| 169 | Porte |  | Menuiseries | Éclat(s), Rayure(s), Trace(s), Griffure(s), Impact(s), Voilé | Optionnel | Recommandé | 3251d95b-2f8a-8102-9793-e362c5cb336a, 3251d95b-2f8a-81b9-bb0 |
| 170 | Plaque de cuisson |  | Électroménager | Rayure(s), Brûlure, Éclat(s) | Masqué | Recommandé |  |
| 171 | Hotte |  | Électroménager | Filtre encrassé, Bruyante, Éclairage HS | Masqué | Optionnel |  |
| 172 | Joints (évier) |  | Plomberie | Défaillant(s), Moisi(s), Noirci(s), Absent(s) | Masqué | Masqué |  |
| 173 | Bain de soleil / Chaise longue |  | Mobilier | Rouille, Cassé, Décoloré, Toile déchirée | Masqué | Optionnel |  |
| 174 | Cadre(s) / Décoration |  | Mobilier | Cassé, Rayure(s), Verre fêlé | Masqué | Optionnel |  |
| 175 | Coussin(s) |  | Linge | Tache(s), Déchirure, Déformé | Optionnel | Masqué |  |
| 176 | Plan de travail |  | Cuisine | Rayure(s), Tache(s), Éclat(s), Brûlure(s), Décollement, Gonf | Optionnel | Recommandé |  |
| 177 | Siphon (baignoire) |  | Plomberie | Fuite, Bouché, Oxydé | Masqué | Masqué |  |
| 178 | Paroi / Rideau (douche) |  | Plomberie | Fissure(s), Calcaire, Moisissure | Masqué | Optionnel |  |
| 179 | Couverture(s) / Plaid(s) |  | Linge | Tache(s), Déchirure, Usure | Optionnel | Masqué |  |
| 180 | Porche / Véranda / Loggia |  | Extérieur | Vitrage fêlé, Infiltration, Condensation, Fissure(s), Joint( | Masqué | Recommandé |  |
| 181 | Inverseur (baignoire) |  | Plomberie | Grippé, Fuite, Cassé | Masqué | Masqué |  |
| 182 | Édredon(s) / Couvre-lit |  | Literie | Tache(s), Déchirure, Décoloré | Optionnel | Masqué |  |
| 183 | Serrure (porte palière) |  | Équipements généraux | Grippée, Cassée, Difficile, Clé coincée | Masqué | Optionnel |  |
| 184 | Assiettes |  | Vaisselle & couverts | Ébréché(es), Fissure(s) | Masqué | Masqué |  |
| 185 | Tapis |  | Mobilier | Tache(s), Usure, Décoloré | Optionnel | Optionnel |  |
| 186 | Box Internet |  | Électroménager | Cassée, Câble endommagé | Masqué | Optionnel |  |
| 187 | Siphon (douche) |  | Plomberie | Fuite, Bouché, Oxydé | Masqué | Masqué |  |
| 188 | Table extérieure |  | Mobilier | Rouille, Cassée, Tache(s), Décolorée, Branlante | Masqué | Recommandé |  |
| 189 | Nappe(s) / Sets de table |  | Linge |  | Optionnel | Masqué |  |
| 190 | Siphon (évier) |  | Plomberie | Fuite, Bouché, Oxydé | Masqué | Masqué |  |
| 191 | Joints (douche) |  | Plomberie | Défaillant(s), Moisi(s), Noirci(s), Absent(s) | Masqué | Masqué |  |
| 192 | Volet / Store |  | Menuiseries | Cassé, Bloqué, Lame(s) abîmée(s), Manivelle HS | Masqué | Optionnel |  |
| 193 | Oreiller(s) |  | Literie | Tache(s), Affaissement, Déchirure | Masqué | Masqué |  |
| 194 | Évier |  | Plomberie | Rayure(s), Tache(s), Éclat(s), Calcaire, Fissure(s) | Masqué | Recommandé | 3251d95b-2f8a-81e9-a4dc-dce93997307f, 3251d95b-2f8a-8176-a6d |
| 195 | Verres |  | Vaisselle & couverts | Ébréché(s), Fissure(s) | Masqué | Masqué |  |
| 196 | Chaise(s) de jardin |  | Mobilier | Rouille, Cassée, Décolorée, Branlante | Masqué | Optionnel |  |
| 197 | Réservoir WC |  | Sanitaires | Fissure(s), Fuite, Calcaire | Masqué | Optionnel |  |
| 198 | Façade |  | Extérieur | Fissure(s), Écaillement, Décollement enduit, Mousse, Trace(s | Optionnel | Recommandé |  |
| 199 | Robinet (évier) |  | Plomberie | Fuite, Calcaire, Grippé | Masqué | Optionnel |  |
| 200 | Flexible / Pommeau (baignoire) |  | Plomberie | Fuite, Calcaire, Percé | Masqué | Optionnel |  |
| 201 | Verrou(s) |  | Équipements généraux | Grippé, Cassé, Difficile, Mal fixé | Masqué | Masqué |  |
| 202 | Gouttières / Descentes EP |  | Extérieur | Percé(e), Bouché(e), Décroché(e), Oxydation, Fuite, Débord | Masqué | Optionnel |  |
| 203 | Congélateur |  | Électroménager | Givre excessif, Rouille, Joint usé, Bosse | Masqué | Optionnel |  |
| 204 | Meuble à chaussures |  | Mobilier | Rayure(s), Éclat(s), Porte cassée | Optionnel | Optionnel |  |
| 205 | Prises électriques |  | Électricité | Cassée, Noircie, Mal fixée, Fondue | Masqué | Optionnel |  |
| 206 | Soupière(s) |  | Vaisselle & couverts | Ébréché(e), Fissure(s) | Masqué | Masqué |  |
| 207 | Four |  | Électroménager |  | Masqué | Optionnel |  |
| 208 | Chaise(s) |  | Mobilier | Rayure(s), Déchirure, Branlante | Optionnel | Optionnel |  |
| 209 | Étendoir / Tancarville |  | Mobilier |  | Masqué | Masqué |  |
| 210 | Porte-manteaux |  | Mobilier | Cassé, Mal fixé, Branlant | Masqué | Masqué |  |
| 211 | Plafond |  | Revêtements | Tache(s), Fissure(s), Décollement, Trace(s) d'humidité, Mois | Optionnel | Optionnel |  |

---

## Details par entree

### Chaudière / Fuel

> [Notion](https://www.notion.so/Chaudi-re-Fuel-3251d95b2f8a8100ab94dca769aac8b4) | ID: `3251d95b-2f8a-8100-ab94-dca769aac8b4`

- **Catégorie** : Chauffage
- **Valeurs Dégradations** : Fuite, Bruit anormal, Rouille, Odeur, Pression instable, Purge nécessaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Gaz, Fuel/Fioul, Électrique, Bois, Granulés, Pompe à chaleur, Condensation, Basse température
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Recommandé

### Barbecue / Plancha

> [Notion](https://www.notion.so/Barbecue-Plancha-3251d95b2f8a8102904ad014b77c7fba) | ID: `3251d95b-2f8a-8102-904a-d014b77c7fba`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rouille, Grille abîmée, Brûleur HS, Peinture écaillée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Charbon, Gaz, Électrique, Plancha, Fixe, Mobile
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Recommandé

### Poignée (porte)

> [Notion](https://www.notion.so/Poign-e-porte-3251d95b2f8a81029793e362c5cb336a) | ID: `3251d95b-2f8a-8102-9793-e362c5cb336a`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Cassée, Branlante, Mal fixée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Rosace, Béquille, Bouton, Poignée plaque
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81ca-8aff-f5f3825c03ee
- **⚙️ État général** : Optionnel

### Cuve fuel / Citerne

> [Notion](https://www.notion.so/Cuve-fuel-Citerne-3251d95b2f8a81029fafde9adc87d6bb) | ID: `3251d95b-2f8a-8102-9faf-de9adc87d6bb`

- **Catégorie** : Chauffage
- **Valeurs Dégradations** : Fuite, Rouille, Jauge HS, Odeur, Bac de rétention défaillant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Enterrée, Aérienne, Plastique, Métal, 500L, 1000L, 1500L, 2000L
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Recommandé

### Alarme

> [Notion](https://www.notion.so/Alarme-3251d95b2f8a810483cac8f75222f150) | ID: `3251d95b-2f8a-8104-83ca-c8f75222f150`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Défaillante, Sirène HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Filaire, Sans fil, Vidéosurveillance
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Optionnel

### Crédence

> [Notion](https://www.notion.so/Cr-dence-3251d95b2f8a8104b165dc31231cb944) | ID: `3251d95b-2f8a-8104-b165-dc31231cb944`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Éclat(s), Tache(s), Fissure(s), Décollement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Carrelage, Verre, Inox, Stratifié, Crédence peinte
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Miroir

> [Notion](https://www.notion.so/Miroir-3251d95b2f8a8109acf5f771cd838746) | ID: `3251d95b-2f8a-8109-acf5-f771cd838746`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Fêlé, Cassé, Tache(s), Désilvré
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mural, Sur pied, Avec cadre, Sans cadre
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8126-b02e-c517f997672f
- **⚙️ État général** : Optionnel

### Verseuse(s)

> [Notion](https://www.notion.so/Verseuse-s-3251d95b2f8a810b8428ed8b202a268d) | ID: `3251d95b-2f8a-810b-8428-ed8b202a268d`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Fissure(s), Couvercle manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Gant(s) de toilette

> [Notion](https://www.notion.so/Gant-s-de-toilette-3251d95b2f8a810c8e50c0baa55daa10) | ID: `3251d95b-2f8a-810c-8e50-c0baa55daa10`

- **Catégorie** : Linge
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Masqué

### Lave-vaisselle

> [Notion](https://www.notion.so/Lave-vaisselle-3251d95b2f8a810daefae5fb678e4599) | ID: `3251d95b-2f8a-810d-aefa-e5fb678e4599`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Rayure(s), Bosse, Rouille, Joint usé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Pose libre, Encastrable, Compact, Intégrable
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Plinthe

> [Notion](https://www.notion.so/Plinthe-3251d95b2f8a810e9088c3badcabf137) | ID: `3251d95b-2f8a-810e-9088-c3badcabf137`

- **Catégorie** : Revêtements
- **Valeurs Dégradations** : Éclat(s), Décollée, Manquante, Tache(s)
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, PVC, Carrelage, Alu, MDF
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f
- **⚙️ État général** : Optionnel

### Couvert(s) à salade

> [Notion](https://www.notion.so/Couvert-s-salade-3251d95b2f8a810eb5abf697cd2384ea) | ID: `3251d95b-2f8a-810e-b5ab-f697cd2384ea`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Lavabo / Vasque

> [Notion](https://www.notion.so/Lavabo-Vasque-3251d95b2f8a8110a320c1cb3ddadfad) | ID: `3251d95b-2f8a-8110-a320-c1cb3ddadfad`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Éclat(s), Fissure(s), Tache(s), Calcaire, Rayure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-8189-91d7-cae23ff0b5d9, 3251d95b-2f8a-81ca-80f2-cf3cee598f3c, 3251d95b-2f8a-813c-9ed9-e30a72312254, 3251d95b-2f8a-814f-ae8b-c9d80e5202ee
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Céramique, Résine, Verre, Pierre, Encastré, Sur pied, Suspendu
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Recommandé

### Couette(s)

> [Notion](https://www.notion.so/Couette-s-3251d95b2f8a81128939c18ec7805eb1) | ID: `3251d95b-2f8a-8112-8939-c18ec7805eb1`

- **Catégorie** : Literie
- **Valeurs Dégradations** : Tache(s), Déchirure, Usure
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Simple, Double, 140x200, 200x200, 240x220
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### WC

> [Notion](https://www.notion.so/WC-3251d95b2f8a811580ceede0625b7cc0) | ID: `3251d95b-2f8a-8115-80ce-ede0625b7cc0`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Fissure(s), Éclat(s), Tache(s), Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-81a9-9b85-ced1fe2fa986, 3251d95b-2f8a-8198-94a1-f1310e21f35e, 3251d95b-2f8a-8148-b69f-d3090e4807a4, 3251d95b-2f8a-818a-8789-d366b60ad795, 3251d95b-2f8a-81e8-8619-ee9a4c2c8e97
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Suspendu, Sur pied, Avec lave-mains intégré
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-8129-b1e0-c7289079e37d
- **⚙️ État général** : Recommandé

### Flexible / Pommeau (douche)

> [Notion](https://www.notion.so/Flexible-Pommeau-douche-3251d95b2f8a81159c4bec4d97b293bd) | ID: `3251d95b-2f8a-8115-9c4b-ec4d97b293bd`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Calcaire, Percé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Optionnel

### Fauteuil(s) de jardin

> [Notion](https://www.notion.so/Fauteuil-s-de-jardin-3251d95b2f8a81178ec5c17c95176295) | ID: `3251d95b-2f8a-8117-8ec5-c17c95176295`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rouille, Cassé, Décoloré, Tressage défait
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Résine tressée, Métal, Bois, Rotin, Avec coussin
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Optionnel

### Serviettes de bain

> [Notion](https://www.notion.so/Serviettes-de-bain-3251d95b2f8a81178f26f0cdffe73ba7) | ID: `3251d95b-2f8a-8117-8f26-f0cdffe73ba7`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Déchirure, Usure, Décoloré(es)
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Optionnel

### Cuillères

> [Notion](https://www.notion.so/Cuill-res-3251d95b2f8a8118aa16ff40989db3db) | ID: `3251d95b-2f8a-8118-aa16-ff40989db3db`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : À soupe, À café
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Porte de garage

> [Notion](https://www.notion.so/Porte-de-garage-3251d95b2f8a81199411c62f5d754245) | ID: `3251d95b-2f8a-8119-9411-c62f5d754245`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Bosse, Oxydation, Bloquée, Peinture écaillée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Basculante, Sectionnelle, Enroulable, Électrique, Manuelle
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Douche

> [Notion](https://www.notion.so/Douche-3251d95b2f8a811a86eadd155bbb6856) | ID: `3251d95b-2f8a-811a-86ea-dd155bbb6856`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Éclat(s), Fissure(s), Calcaire, Joint défaillant, Moisissure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-8115-9c4b-ec4d97b293bd, 3251d95b-2f8a-81d4-919c-e2439286dc1b, 3251d95b-2f8a-812b-9c65-c74f3c449480, 3251d95b-2f8a-812e-afd5-d82977077e3e, 3251d95b-2f8a-81e0-9073-c78c305af3f1, 3251d95b-2f8a-8162-b41b-c36f77ac7827, 3251d95b-2f8a-81dd-9479-d81e080cbd34, 3251d95b-2f8a-8127-8fcb-e40fa8216e60
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Italienne, Bac receveur, Cabine intégrale, Avec colonne
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Recommandé

### Fourchettes

> [Notion](https://www.notion.so/Fourchettes-3251d95b2f8a811aacfacac29221d3f2) | ID: `3251d95b-2f8a-811a-acfa-cac29221d3f2`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Boîte aux lettres

> [Notion](https://www.notion.so/Bo-te-aux-lettres-3251d95b2f8a811baf8dcd23a90e0f5b) | ID: `3251d95b-2f8a-811b-af8d-cd23a90e0f5b`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Serrure HS, Bosse, Rouille, Porte cassée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Optionnel

### Tuyau d'arrosage

> [Notion](https://www.notion.so/Tuyau-d-arrosage-3251d95b2f8a811ca517d1bba8afb4d6) | ID: `3251d95b-2f8a-811c-a517-d1bba8afb4d6`

- **Catégorie** : Entretien
- **Valeurs Dégradations** : Percé, Déformé, Raccord cassé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ac-921b-d8a5a5add6c4, 3251d95b-2f8a-815d-8267-c7de8c2a2c33
- **⚙️ État général** : Masqué

### Baignoire

> [Notion](https://www.notion.so/Baignoire-3251d95b2f8a811d9b8ec5b03b2e45aa) | ID: `3251d95b-2f8a-811d-9b8e-c5b03b2e45aa`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Éclat(s), Rayure(s), Tache(s), Calcaire, Jaunissement, Joint défaillant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-817a-a059-f07a51b1b7fd, 3251d95b-2f8a-812d-9963-fba0e3048b88, 3251d95b-2f8a-812e-a3cd-efe232c4f023, 3251d95b-2f8a-8128-bf2c-c1b8101429c7, 3251d95b-2f8a-81eb-bb54-e445766b0b30, 3251d95b-2f8a-8133-a21d-d57ff6b3d6c0, 3251d95b-2f8a-8151-8d20-ee4763eae1b9, 3251d95b-2f8a-81d6-9f2f-f0d5c3be57fe, 3251d95b-2f8a-81d0-a4eb-ce713c5a5577
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Acrylique, Fonte, Résine, D'angle, Îlot, Encastrée, Avec tablier
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d
- **⚙️ État général** : Recommandé

### Tableau de fusibles

> [Notion](https://www.notion.so/Tableau-de-fusibles-3251d95b2f8a81208ea4ce10cf1c71df) | ID: `3251d95b-2f8a-8120-8ea4-ce10cf1c71df`

- **Catégorie** : Équipements généraux
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Disjoncteur, Fusible, Différentiel
- **⚙️ Quantité** : Masqué
- **⚙️ État général** : Optionnel

### Poignée (fenêtre)

> [Notion](https://www.notion.so/Poign-e-fen-tre-3251d95b2f8a812181c1d649450f0878) | ID: `3251d95b-2f8a-8121-81c1-d649450f0878`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Cassée, Branlante, Grippée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-816b-ad7f-d830764c9dff
- **⚙️ État général** : Optionnel

### Robinet (bidet)

> [Notion](https://www.notion.so/Robinet-bidet-3251d95b2f8a8121bda1c054b89f0148) | ID: `3251d95b-2f8a-8121-bda1-c054b89f0148`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Fuite, Calcaire, Grippé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mitigeur, Mélangeur
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81b9-a4da-d0f9fa8b1bda
- **⚙️ État général** : Optionnel

### Éclairage(s)

> [Notion](https://www.notion.so/clairage-s-3251d95b2f8a8122a379cdf7944712fc) | ID: `3251d95b-2f8a-8122-a379-cdf7944712fc`

- **Catégorie** : Électricité
- **Valeurs Dégradations** : Cassé, Noirci, Ampoule manquante
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Plafonnier, Spot encastré, Applique, Réglette, Suspension
- **⚙️ Quantité** : Optionnel
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f, 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-815a-8913-c61426bcc7d4, 3251d95b-2f8a-81e4-9615-e6a6fe31fd74, 3251d95b-2f8a-812b-8a46-fba571b16456, 3251d95b-2f8a-81ca-9ab1-d080ee489e60, 3251d95b-2f8a-816f-93b7-ec1265786b6c, 3251d95b-2f8a-819a-92da-ec08dfc79bac, 3251d95b-2f8a-8186-afe7-c99df8b0c091
- **⚙️ État général** : Optionnel

### Plat(s)

> [Notion](https://www.notion.so/Plat-s-3251d95b2f8a8125b54ed11c3156d72c) | ID: `3251d95b-2f8a-8125-b54e-d11c3156d72c`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(s), Fissure(s), Tache(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Céramique, Verre, Terre cuite, À four, De service
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Trappe de visite (douche)

> [Notion](https://www.notion.so/Trappe-de-visite-douche-3251d95b2f8a81278fcbe40fa8216e60) | ID: `3251d95b-2f8a-8127-8fcb-e40fa8216e60`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Cassée, Manquante, Mal fixée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Optionnel

### Joints (baignoire)

> [Notion](https://www.notion.so/Joints-baignoire-3251d95b2f8a8128bf2cc1b8101429c7) | ID: `3251d95b-2f8a-8128-bf2c-c1b8101429c7`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Défaillant(s), Moisi(s), Noirci(s), Absent(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Silicone, Caoutchouc
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Optionnel

### Bonde (douche)

> [Notion](https://www.notion.so/Bonde-douche-3251d95b2f8a812b9c65c74f3c449480) | ID: `3251d95b-2f8a-812b-9c65-c74f3c449480`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Grippée, Bouchée, Fuite, Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Optionnel

### Buffet / Vaisselier

> [Notion](https://www.notion.so/Buffet-Vaisselier-3251d95b2f8a812cb1acdb7724198354) | ID: `3251d95b-2f8a-812c-b1ac-db7724198354`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Éclat(s), Porte cassée, Charnière HS
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Optionnel
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Mélaminé, Laqué, Vitré
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661
- **⚙️ État général** : Recommandé

### Portail / Portillon

> [Notion](https://www.notion.so/Portail-Portillon-3251d95b2f8a812d8856e475021433c8) | ID: `3251d95b-2f8a-812d-8856-e475021433c8`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Oxydation, Voilé, Bloqué, Peinture écaillée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Métal, Bois, PVC, Électrique, Manuel, Coulissant, Battant
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Bonde (baignoire)

> [Notion](https://www.notion.so/Bonde-baignoire-3251d95b2f8a812d9963fba0e3048b88) | ID: `3251d95b-2f8a-812d-9963-fba0e3048b88`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Grippée, Bouchée, Fuite, Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Optionnel

### Micro-ondes

> [Notion](https://www.notion.so/Micro-ondes-3251d95b2f8a812da717dd9bb44c283f) | ID: `3251d95b-2f8a-812d-a717-dd9bb44c283f`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Porte cassée, Plateau manquant, Rouille intérieure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Pose libre, Encastrable, Grill, Combiné
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Robinet (lave-mains)

> [Notion](https://www.notion.so/Robinet-lave-mains-3251d95b2f8a812db40bd475e8f0b37d) | ID: `3251d95b-2f8a-812d-b40b-d475e8f0b37d`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Fuite, Calcaire, Grippé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mitigeur, Mélangeur, Temporisé
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-813d-8155-d7fab5ae7ba0
- **⚙️ État général** : Optionnel

### Meuble sous lavabo

> [Notion](https://www.notion.so/Meuble-sous-lavabo-3251d95b2f8a812e8fe4cf6136e117c4) | ID: `3251d95b-2f8a-812e-8fe4-cf6136e117c4`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Trace(s) d'humidité, Gonflement, Moisissure, Porte cassée, Charnière HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Optionnel
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Mélaminé, Laqué, Stratifié, Avec miroir
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Recommandé

### Pare-baignoire / Pare-douche

> [Notion](https://www.notion.so/Pare-baignoire-Pare-douche-3251d95b2f8a812ea3cdefe232c4f023) | ID: `3251d95b-2f8a-812e-a3cd-efe232c4f023`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fissure(s), Calcaire, Moisissure, Joint défaillant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Verre fixe, Verre pivotant, Verre coulissant, Rideau
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Recommandé

### Robinetterie (douche)

> [Notion](https://www.notion.so/Robinetterie-douche-3251d95b2f8a812eafd5d82977077e3e) | ID: `3251d95b-2f8a-812e-afd5-d82977077e3e`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Calcaire, Grippé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mitigeur, Mélangeur, Thermostatique, Colonne
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Optionnel

### Sommier

> [Notion](https://www.notion.so/Sommier-3251d95b2f8a812eb738fefcfd4ced16) | ID: `3251d95b-2f8a-812e-b738-fefcfd4ced16`

- **Catégorie** : Literie
- **Valeurs Dégradations** : Latte(s) cassée(s), Affaissement, Grincement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Lattes, Tapissier, Plots
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### Siphon (bidet)

> [Notion](https://www.notion.so/Siphon-bidet-3251d95b2f8a81319ca3f9e37c301d12) | ID: `3251d95b-2f8a-8131-9ca3-f9e37c301d12`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Fuite, Bouché, Oxydé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81b9-a4da-d0f9fa8b1bda
- **⚙️ État général** : Optionnel

### Housse(s) de canapé

> [Notion](https://www.notion.so/Housse-s-de-canap-3251d95b2f8a81338a80dd1764212d81) | ID: `3251d95b-2f8a-8133-8a80-dd1764212d81`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Déchirure, Décoloré(e)
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : 2 places, 3 places, D'angle
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Optionnel

### Habillage (baignoire)

> [Notion](https://www.notion.so/Habillage-baignoire-3251d95b2f8a8133a21dd57ff6b3d6c0) | ID: `3251d95b-2f8a-8133-a21d-d57ff6b3d6c0`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Décollé, Fissuré, Moisissure, Tache(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Tablier PVC, Tablier carrelé, Coffrage bois
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Optionnel

### Tondeuse à gazon

> [Notion](https://www.notion.so/Tondeuse-gazon-3251d95b2f8a8134b4a3c53f143138da) | ID: `3251d95b-2f8a-8134-b4a3-c53f143138da`

- **Catégorie** : Entretien
- **Valeurs Dégradations** : Lame émoussée, HS, Bac manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Électrique, Thermique, Robot, Sans fil
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ac-921b-d8a5a5add6c4, 3251d95b-2f8a-815d-8267-c7de8c2a2c33
- **⚙️ État général** : Optionnel

### Aspirateur

> [Notion](https://www.notion.so/Aspirateur-3251d95b2f8a8135b4e0d3639b340b38) | ID: `3251d95b-2f8a-8135-b4e0-d3639b340b38`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Cassé, Aspiration faible, Accessoire manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Traîneau, Balai, Sans fil, Robot
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0
- **⚙️ État général** : Masqué

### Passoire(s)

> [Notion](https://www.notion.so/Passoire-s-3251d95b2f8a813685c2d8f5b0b315b2) | ID: `3251d95b-2f8a-8136-85c2-d8f5b0b315b2`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Joints (bidet)

> [Notion](https://www.notion.so/Joints-bidet-3251d95b2f8a81369cf8c7c9424aad5e) | ID: `3251d95b-2f8a-8136-9cf8-c7c9424aad5e`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Défaillant(s), Moisi(s), Noirci(s), Absent(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81b9-a4da-d0f9fa8b1bda
- **⚙️ État général** : Optionnel

### Draps

> [Notion](https://www.notion.so/Draps-3251d95b2f8a81379c6fd353dd6d5608) | ID: `3251d95b-2f8a-8137-9c6f-d353dd6d5608`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Déchirure, Usure, Élastique détendu
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : 1 place, 2 places, Drap-housse, Drap plat
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### Détecteur de fumée

> [Notion](https://www.notion.so/D-tecteur-de-fum-e-3251d95b2f8a8138826febab7609e73d) | ID: `3251d95b-2f8a-8138-826f-ebab7609e73d`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : HS, Pile morte, Manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Pile, Filaire
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Masqué

### Théière / Carafe

> [Notion](https://www.notion.so/Th-i-re-Carafe-3251d95b2f8a813990bddf2ea3f9f7f4) | ID: `3251d95b-2f8a-8139-90bd-df2ea3f9f7f4`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(e), Fissure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Cocotte(s) / Autocuiseur

> [Notion](https://www.notion.so/Cocotte-s-Autocuiseur-3251d95b2f8a813aa2a7e7f71093d650) | ID: `3251d95b-2f8a-813a-a2a7-e7f71093d650`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Rayure(s), Revêtement abîmé, Joint usé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Joints (lavabo)

> [Notion](https://www.notion.so/Joints-lavabo-3251d95b2f8a813c9ed9e30a72312254) | ID: `3251d95b-2f8a-813c-9ed9-e30a72312254`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Défaillant(s), Moisi(s), Noirci(s), Absent(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Silicone, Caoutchouc
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8110-a320-c1cb3ddadfad
- **⚙️ État général** : Optionnel

### Plateau(x)

> [Notion](https://www.notion.so/Plateau-x-3251d95b2f8a813cb4f9f963cd70ac04) | ID: `3251d95b-2f8a-813c-b4f9-f963cd70ac04`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Lave-mains

> [Notion](https://www.notion.so/Lave-mains-3251d95b2f8a813d8155d7fab5ae7ba0) | ID: `3251d95b-2f8a-813d-8155-d7fab5ae7ba0`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Éclat(s), Fissure(s), Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Sous-items** : 3251d95b-2f8a-812d-b40b-d475e8f0b37d
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Céramique, Résine, Suspendu, Avec meuble
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8174-8d23-e6ec37930817
- **⚙️ État général** : Recommandé

### Cafetière / Machine à café

> [Notion](https://www.notion.so/Cafeti-re-Machine-caf-3251d95b2f8a813f86d4f2ff2d2eedc3) | ID: `3251d95b-2f8a-813f-86d4-f2ff2d2eedc3`

- **Catégorie** : Électroménager
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Filtre, Capsules, Expresso, Italienne
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Tabouret(s)

> [Notion](https://www.notion.so/Tabouret-s-3251d95b2f8a813fa2a5f6cb650e568e) | ID: `3251d95b-2f8a-813f-a2a5-f6cb650e568e`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Branlant, Assise déchirée
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Métal, Plastique, Bar, Réglable, Pliant
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Bouilloire

> [Notion](https://www.notion.so/Bouilloire-3251d95b2f8a81408873f7866d52966c) | ID: `3251d95b-2f8a-8140-8873-f7866d52966c`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Calcaire, Couvercle cassé, Fuite
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Électrique, Inox, Plastique, Sans fil
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Bocal(aux)

> [Notion](https://www.notion.so/Bocal-aux-3251d95b2f8a81408a40c84233699ed9) | ID: `3251d95b-2f8a-8140-8a40-c84233699ed9`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(s), Fissure(s), Couvercle manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Fauteuil(s)

> [Notion](https://www.notion.so/Fauteuil-s-3251d95b2f8a814589eccc6d913cc852) | ID: `3251d95b-2f8a-8145-89ec-cc6d913cc852`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Tache(s), Déchirure, Affaissement
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Tissu, Cuir, Simili, Velours, Rotin, Bridge, Club, Relax
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Recommandé

### Torchons

> [Notion](https://www.notion.so/Torchons-3251d95b2f8a8145a738cd3d8c28d37f) | ID: `3251d95b-2f8a-8145-a738-cd3d8c28d37f`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Usure, Déchirure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Sonnette

> [Notion](https://www.notion.so/Sonnette-3251d95b2f8a8147b492e13337168c48) | ID: `3251d95b-2f8a-8147-b492-e13337168c48`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : HS, Bouton cassé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Filaire, Sans fil
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Masqué

### Chasse d'eau

> [Notion](https://www.notion.so/Chasse-d-eau-3251d95b2f8a8148b69fd3090e4807a4) | ID: `3251d95b-2f8a-8148-b69f-d3090e4807a4`

- **Catégorie** : Sanitaires
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Suspendue, Tirette, Double flux
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8115-80ce-ede0625b7cc0
- **⚙️ État général** : Optionnel

### Sol

> [Notion](https://www.notion.so/Sol-3251d95b2f8a814aa0cdc3642ec7485b) | ID: `3251d95b-2f8a-814a-a0cd-c3642ec7485b`

- **Catégorie** : Revêtements
- **Valeurs Dégradations** : Rayure(s), Tache(s), Éclat(s), Fissure(s), Trou(s), Décollement, Gondolement, Joint(s) défaillant(s)
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Parquet, Carrelage, Vinyle, Moquette, Béton ciré, Lino, Pierre, Jonc de mer, Terre cuite
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f, 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-815a-8913-c61426bcc7d4, 3251d95b-2f8a-81e4-9615-e6a6fe31fd74, 3251d95b-2f8a-812b-8a46-fba571b16456, 3251d95b-2f8a-81ca-9ab1-d080ee489e60, 3251d95b-2f8a-816f-93b7-ec1265786b6c, 3251d95b-2f8a-819a-92da-ec08dfc79bac
- **⚙️ État général** : Recommandé

### Dessous de plat(s)

> [Notion](https://www.notion.so/Dessous-de-plat-s-3251d95b2f8a814b9971fa6f0d2bb966) | ID: `3251d95b-2f8a-814b-9971-fa6f0d2bb966`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Gant(s) de four / Manique(s)

> [Notion](https://www.notion.so/Gant-s-de-four-Manique-s-3251d95b2f8a814d82eff574c5278cb4) | ID: `3251d95b-2f8a-814d-82ef-f574c5278cb4`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Escalier extérieur

> [Notion](https://www.notion.so/Escalier-ext-rieur-3251d95b2f8a814f94fec9a3d49d0947) | ID: `3251d95b-2f8a-814f-94fe-c9a3d49d0947`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Marche(s) cassée(s), Mousse, Fissure(s), Rampe branlante, Nez de marche usé(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Béton, Pierre, Bois, Métal, Carrelage
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Siphon (lavabo)

> [Notion](https://www.notion.so/Siphon-lavabo-3251d95b2f8a814fae8bc9d80e5202ee) | ID: `3251d95b-2f8a-814f-ae8b-c9d80e5202ee`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Bouché, Oxydé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8110-a320-c1cb3ddadfad
- **⚙️ État général** : Optionnel

### Plan bar

> [Notion](https://www.notion.so/Plan-bar-3251d95b2f8a8150ad91e5cf82633c87) | ID: `3251d95b-2f8a-8150-ad91-e5cf82633c87`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Rayure(s), Tache(s), Éclat(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Stratifié, Quartz, Béton ciré
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Trappe de visite (baignoire)

> [Notion](https://www.notion.so/Trappe-de-visite-baignoire-3251d95b2f8a81518d20ee4763eae1b9) | ID: `3251d95b-2f8a-8151-8d20-ee4763eae1b9`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Cassée, Manquante, Mal fixée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Optionnel

### Serviette(s) de table

> [Notion](https://www.notion.so/Serviette-s-de-table-3251d95b2f8a81519b12f40be46ed619) | ID: `3251d95b-2f8a-8151-9b12-f40be46ed619`

- **Catégorie** : Linge
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Fer à repasser

> [Notion](https://www.notion.so/Fer-repasser-3251d95b2f8a8151b2a2c568220d7514) | ID: `3251d95b-2f8a-8151-b2a2-c568220d7514`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Semelle rayée, Fuite, HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Vapeur, Centrale vapeur, Sec
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0
- **⚙️ État général** : Masqué

### Arbres / Arbustes

> [Notion](https://www.notion.so/Arbres-Arbustes-3251d95b2f8a81529286e5fad8b08169) | ID: `3251d95b-2f8a-8152-9286-e5fad8b08169`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Mort, Malade, Non taillé, Envahissant, Branches cassées
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-815d-8267-c7de8c2a2c33, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Recommandé

### Bannette(s) / Caisson(s)

> [Notion](https://www.notion.so/Bannette-s-Caisson-s-3251d95b2f8a81529d79cd5e303c072b) | ID: `3251d95b-2f8a-8152-9d79-cd5e303c072b`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Cassé, Bosse, Roulette(s) HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Métal, Bois, Plastique, À roulettes
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8145-834b-e262e2733c69
- **⚙️ État général** : Masqué

### Table

> [Notion](https://www.notion.so/Table-3251d95b2f8a81549773fde25a35534c) | ID: `3251d95b-2f8a-8154-9773-fde25a35534c`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Tache(s), Éclat(s), Branlante
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Verre, Métal, Plastique, Ronde, Rectangulaire, Extensible
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Vitrerie (porte)

> [Notion](https://www.notion.so/Vitrerie-porte-3251d95b2f8a81559488cfbd3c094579) | ID: `3251d95b-2f8a-8155-9488-cfbd3c094579`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Fêlé, Cassé, Rayure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81ca-8aff-f5f3825c03ee
- **⚙️ État général** : Optionnel

### Porte palière

> [Notion](https://www.notion.so/Porte-pali-re-3251d95b2f8a8158ab3bef697900521e) | ID: `3251d95b-2f8a-8158-ab3b-ef697900521e`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Éclat(s), Rayure(s), Griffure(s), Voilée, Ne ferme pas
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-819c-8a14-ff259fe639c7, 3251d95b-2f8a-81da-9dd2-e7054f34aaa3
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Blindée, Bois, PVC, Coupe-feu
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Recommandé

### Convertible / Clic-clac / BZ

> [Notion](https://www.notion.so/Convertible-Clic-clac-BZ-3251d95b2f8a8158afe2e40d8c3cbbfb) | ID: `3251d95b-2f8a-8158-afe2-e40d8c3cbbfb`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Tache(s), Déchirure, Affaissement, Mécanisme HS
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Tissu, Cuir, Simili, Clic-clac, BZ, Canapé-lit
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Recommandé

### Sèche-linge

> [Notion](https://www.notion.so/S-che-linge-3251d95b2f8a8159bd7edb5d5959ad70) | ID: `3251d95b-2f8a-8159-bd7e-db5d5959ad70`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Bruyant, Rouille, Joint usé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Condensation, Évacuation, Pompe à chaleur
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0
- **⚙️ État général** : Optionnel

### Poubelle encastrée

> [Notion](https://www.notion.so/Poubelle-encastr-e-3251d95b2f8a815ba085d3a571ef0d04) | ID: `3251d95b-2f8a-815b-a085-d3a571ef0d04`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Cassée, Pédale HS, Couvercle manquant, Odeur
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Simple, Tri sélectif, Coulissante, Sous évier
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Mur

> [Notion](https://www.notion.so/Mur-3251d95b2f8a815ea9bef8c199991870) | ID: `3251d95b-2f8a-815e-a9be-f8c199991870`

- **Qté par défaut** : 4
- **Catégorie** : Revêtements
- **Valeurs Dégradations** : Trace(s) diffuse(s), Légères traces, Traces importantes, Impact(s), Éclat(s), Trou(s) de cheville, Fissure(s), Écaillé (partiel), Écaillé (important), Noirci, Dégâts des eaux, Moisissure, Tache(s) diffuse(s), Tache(s) marquée(s), Trace(s) de frottement, Trace(s) de rebouchage, Trace(s) de peinture, Trace(s) de clous, Rayure(s), Adhésif / Scotch, Décollement (partiel), Décollement (important)
- **⚙️ Couleur** : Recommandé
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Peinture, Papier peint, Toile de verre, Crépi, Lambris, Carrelage, Pierre, Enduit
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f, 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-8186-afe7-c99df8b0c091, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-81e4-9615-e6a6fe31fd74, 3251d95b-2f8a-812b-8a46-fba571b16456, 3251d95b-2f8a-81ca-9ab1-d080ee489e60, 3251d95b-2f8a-816f-93b7-ec1265786b6c, 3251d95b-2f8a-819a-92da-ec08dfc79bac
- **⚙️ État général** : Recommandé

### Traversin(s)

> [Notion](https://www.notion.so/Traversin-s-3251d95b2f8a81619fc3c7c85ba5df70) | ID: `3251d95b-2f8a-8161-9fc3-c7c85ba5df70`

- **Catégorie** : Literie
- **Valeurs Dégradations** : Tache(s), Affaissement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### Coquetier(s)

> [Notion](https://www.notion.so/Coquetier-s-3251d95b2f8a81629af0e04ce765e6f7) | ID: `3251d95b-2f8a-8162-9af0-e04ce765e6f7`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Habillage (douche)

> [Notion](https://www.notion.so/Habillage-douche-3251d95b2f8a8162b41bc36f77ac7827) | ID: `3251d95b-2f8a-8162-b41b-c36f77ac7827`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Décollé, Fissuré, Moisissure, Tache(s), Joint défaillant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Carrelage, PVC, Pierre naturelle
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Optionnel

### Matelas

> [Notion](https://www.notion.so/Matelas-3251d95b2f8a81639bc8eb8edea4fad2) | ID: `3251d95b-2f8a-8163-9bc8-eb8edea4fad2`

- **Catégorie** : Literie
- **Valeurs Dégradations** : Tache(s), Affaissement, Déchirure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mousse, Ressorts, Latex, Mémoire de forme, 90x190, 140x190, 160x200, 180x200
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Recommandé

### Canapé

> [Notion](https://www.notion.so/Canap-3251d95b2f8a8163bdf6ccc23691cf6b) | ID: `3251d95b-2f8a-8163-bdf6-ccc23691cf6b`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Tache(s), Déchirure, Affaissement, Griffure(s)
- **⚙️ Couleur** : Recommandé
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Tissu, Cuir, Simili, Convertible, 2 places, 3 places, D'angle
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Recommandé

### Interphone / Visiophone

> [Notion](https://www.notion.so/Interphone-Visiophone-3251d95b2f8a8164abe4ee0eec282ee4) | ID: `3251d95b-2f8a-8164-abe4-ee0eec282ee4`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Cassé, Grésillement, Écran HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Audio, Vidéo, Sans fil
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Optionnel

### Égouttoir

> [Notion](https://www.notion.so/gouttoir-3251d95b2f8a8164ad28c6d7665998ab) | ID: `3251d95b-2f8a-8164-ad28-c6d7665998ab`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Oxydé, Cassé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Inox, Plastique, Encastré
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Multiprise(s)

> [Notion](https://www.notion.so/Multiprise-s-3251d95b2f8a81668fdee4505c8bb9a9) | ID: `3251d95b-2f8a-8166-8fde-e4505c8bb9a9`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Câble endommagé, Prise fondue, Interrupteur HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69
- **⚙️ État général** : Masqué

### Fenêtre

> [Notion](https://www.notion.so/Fen-tre-3251d95b2f8a816bad7fd830764c9dff) | ID: `3251d95b-2f8a-816b-ad7f-d830764c9dff`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Fissure(s), Éclat(s), Rayure(s), Joint défaillant, Condensation, Moisissure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-8121-81c1-d649450f0878, 3251d95b-2f8a-81e0-b896-cd29879b7f1a, 3251d95b-2f8a-81aa-b728-d0b30b586ff6, 3251d95b-2f8a-819b-affd-e38c3b797e9b
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Simple vitrage, Double vitrage, Triple vitrage, 1 ouvrant, 2 ouvrants, 3 ouvrants, Battant, Abattant, Oscillo-battant, Bois, PVC, Alu, Velux
- **⚙️ Quantité** : Optionnel
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-819a-92da-ec08dfc79bac
- **⚙️ État général** : Recommandé

### Spatule(s) / Louche(s)

> [Notion](https://www.notion.so/Spatule-s-Louche-s-3251d95b2f8a81709765d0c1f8722da8) | ID: `3251d95b-2f8a-8170-9765-d0c1f8722da8`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Cassé(e), Fondu(e), Déformé(e)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Silicone, Métal, Plastique
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Peignoir(s)

> [Notion](https://www.notion.so/Peignoir-s-3251d95b2f8a8170996cd9708b6bb9ec) | ID: `3251d95b-2f8a-8170-996c-d9708b6bb9ec`

- **Catégorie** : Linge
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Masqué

### Ramequin(s) / Coupelle(s)

> [Notion](https://www.notion.so/Ramequin-s-Coupelle-s-3251d95b2f8a8175920bf905dbfabdef) | ID: `3251d95b-2f8a-8175-920b-f905dbfabdef`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(s), Fissure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Bonde (évier)

> [Notion](https://www.notion.so/Bonde-vier-3251d95b2f8a8176a6def2b64d9e692c) | ID: `3251d95b-2f8a-8176-a6de-f2b64d9e692c`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Grippée, Bouchée, Fuite, Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81e6-8cae-c1ad1e98ea6e
- **⚙️ État général** : Optionnel

### Meuble sous évier

> [Notion](https://www.notion.so/Meuble-sous-vier-3251d95b2f8a8176aa01d71486935506) | ID: `3251d95b-2f8a-8176-aa01-d71486935506`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Trace(s) d'humidité, Gonflement, Moisissure, Porte cassée, Charnière HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Optionnel
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Mélaminé, Laqué, Stratifié, 1 porte, 2 portes
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Alaise / Moulure

> [Notion](https://www.notion.so/Alaise-Moulure-3251d95b2f8a8176b8e2e5f6643cbea1) | ID: `3251d95b-2f8a-8176-b8e2-e5f6643cbea1`

- **Catégorie** : Revêtements
- **Valeurs Dégradations** : Éclat(s), Décollée, Manquante, Fissurée, Cassée
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, PVC, Polystyrène, Plâtre, Quart de rond, Corniche, Cimaise
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f
- **⚙️ État général** : Optionnel

### Robinetterie (baignoire)

> [Notion](https://www.notion.so/Robinetterie-baignoire-3251d95b2f8a817aa059f07a51b1b7fd) | ID: `3251d95b-2f8a-817a-a059-f07a51b1b7fd`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Calcaire, Grippé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mitigeur, Mélangeur, Thermostatique
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Optionnel

### Judas optique

> [Notion](https://www.notion.so/Judas-optique-3251d95b2f8a817db401ded4c11e96e1) | ID: `3251d95b-2f8a-817d-b401-ded4c11e96e1`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Opacifié, Cassé, Manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Masqué

### Placards / Rangements

> [Notion](https://www.notion.so/Placards-Rangements-3251d95b2f8a817f927cfe193d3b5662) | ID: `3251d95b-2f8a-817f-927c-fe193d3b5662`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Éclat(s), Rayure(s), Porte cassée, Charnière HS, Rail cassé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Mélaminé, Coulissant, Battant, Avec étagères, Avec penderie
- **⚙️ Quantité** : Optionnel
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f
- **⚙️ État général** : Recommandé

### Soucoupe(s)

> [Notion](https://www.notion.so/Soucoupe-s-3251d95b2f8a81809004fe170a043f04) | ID: `3251d95b-2f8a-8180-9004-fe170a043f04`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(es), Fissure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Bonde (bidet)

> [Notion](https://www.notion.so/Bonde-bidet-3251d95b2f8a818098e3e456e19532c3) | ID: `3251d95b-2f8a-8180-98e3-e456e19532c3`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Grippée, Bouchée, Fuite, Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81b9-a4da-d0f9fa8b1bda
- **⚙️ État général** : Optionnel

### Bureau

> [Notion](https://www.notion.so/Bureau-3251d95b2f8a81809ad3efbb81d9e13e) | ID: `3251d95b-2f8a-8180-9ad3-efbb81d9e13e`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Tache(s), Éclat(s)
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Mélaminé, Verre, Métal, Avec tiroirs, Avec caisson, Angle
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69
- **⚙️ État général** : Recommandé

### Ventilation

> [Notion](https://www.notion.so/Ventilation-3251d95b2f8a81828975c8fc127f16a1) | ID: `3251d95b-2f8a-8182-8975-c8fc127f16a1`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Encrassée, HS, Bruyante, Grille cassée, Filtre manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : VMC, Grille, Extracteur, Aération haute, Aération basse
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-81ce-a56e-ddede28b32c0
- **⚙️ État général** : Optionnel

### Banc extérieur

> [Notion](https://www.notion.so/Banc-ext-rieur-3251d95b2f8a81829295f1e70da4d0e7) | ID: `3251d95b-2f8a-8182-9295-f1e70da4d0e7`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rouille, Cassé, Latte(s) abîmée(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Métal, Pierre, Avec dossier
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Optionnel

### Table à repasser

> [Notion](https://www.notion.so/Table-repasser-3251d95b2f8a81838046c8a7e8bfc169) | ID: `3251d95b-2f8a-8183-8046-c8a7e8bfc169`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Instable, Housse usée, Pieds cassés
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Pliante, Murale, Avec repose-fer
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0
- **⚙️ État général** : Masqué

### Chaîne Hi-fi / Enceinte

> [Notion](https://www.notion.so/Cha-ne-Hi-fi-Enceinte-3251d95b2f8a8183ac28cd9dac03e61f) | ID: `3251d95b-2f8a-8183-ac28-cd9dac03e61f`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Rayure(s), HS, Télécommande manquante
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mini-chaîne, Barre de son, Enceinte Bluetooth, Home cinéma
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Optionnel

### Étagère(s) de rangement

> [Notion](https://www.notion.so/tag-re-s-de-rangement-3251d95b2f8a81878fcdc3628842d5c4) | ID: `3251d95b-2f8a-8187-8fcd-c3628842d5c4`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Branlante, Éclat(s), Tordue
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Métal, Mélaminé, Murale, Cube, Bibliothèque
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69
- **⚙️ État général** : Optionnel

### Balai / Serpillière

> [Notion](https://www.notion.so/Balai-Serpilli-re-3251d95b2f8a8187a6d3efbbab6353b8) | ID: `3251d95b-2f8a-8187-a6d3-efbbab6353b8`

- **Catégorie** : Entretien
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8185-ae9a-fda673c59710
- **⚙️ État général** : Masqué

### Meuble TV / Multimédia

> [Notion](https://www.notion.so/Meuble-TV-Multim-dia-3251d95b2f8a8188a92afedf4a13f487) | ID: `3251d95b-2f8a-8188-a92a-fedf4a13f487`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Éclat(s), Porte cassée
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Mélaminé, Métal, Verre, Mural, Sur pied
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Optionnel

### Robinet (lavabo)

> [Notion](https://www.notion.so/Robinet-lavabo-3251d95b2f8a818991d7cae23ff0b5d9) | ID: `3251d95b-2f8a-8189-91d7-cae23ff0b5d9`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Calcaire, Grippé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mitigeur, Mélangeur
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8110-a320-c1cb3ddadfad
- **⚙️ État général** : Optionnel

### Couteaux

> [Notion](https://www.notion.so/Couteaux-3251d95b2f8a8189b39ffdf6e5a9821d) | ID: `3251d95b-2f8a-8189-b39f-fdf6e5a9821d`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : De table, À pain, De cuisine
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Dévidoir WC

> [Notion](https://www.notion.so/D-vidoir-WC-3251d95b2f8a818a8789d366b60ad795) | ID: `3251d95b-2f8a-818a-8789-d366b60ad795`

- **Catégorie** : Sanitaires
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8115-80ce-ede0625b7cc0
- **⚙️ État général** : Optionnel

### Armoire à pharmacie / Miroir SDB

> [Notion](https://www.notion.so/Armoire-pharmacie-Miroir-SDB-3251d95b2f8a818a99c0cdf041e2cfb0) | ID: `3251d95b-2f8a-818a-99c0-cdf041e2cfb0`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Éclat(s), Miroir fêlé, Charnière HS, Rouille
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Optionnel
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Recommandé

### Bols / Tasses / Mugs

> [Notion](https://www.notion.so/Bols-Tasses-Mugs-3251d95b2f8a818c91f2f5060fd73ef6) | ID: `3251d95b-2f8a-818c-91f2-f5060fd73ef6`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(s), Fissure(s), Tache(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Table de nuit

> [Notion](https://www.notion.so/Table-de-nuit-3251d95b2f8a818d9e32fd76637a3aa7) | ID: `3251d95b-2f8a-818d-9e32-fd76637a3aa7`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Éclat(s), Tache(s), Tiroir cassé
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Mélaminé, Laqué, Avec tiroir(s), Suspendue
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### Massifs de fleurs / Plantations

> [Notion](https://www.notion.so/Massifs-de-fleurs-Plantations-3251d95b2f8a8190ad0adcdc189f2ef9) | ID: `3251d95b-2f8a-8190-ad0a-dcdc189f2ef9`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Non entretenu(s), Dégarni(s), Envahi(s) mauvaises herbes, Mort(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-815d-8267-c7de8c2a2c33, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Recommandé

### Éléments bas cuisine

> [Notion](https://www.notion.so/l-ments-bas-cuisine-3251d95b2f8a81928b65d26e2b7e48d2) | ID: `3251d95b-2f8a-8192-8b65-d26e2b7e48d2`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Éclat(s), Rayure(s), Porte cassée, Charnière HS, Gonflement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Mélaminé, Laqué, Stratifié
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Réfrigérateur

> [Notion](https://www.notion.so/R-frig-rateur-3251d95b2f8a819388f5f7481e1fba47) | ID: `3251d95b-2f8a-8193-88f5-f7481e1fba47`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Rayure(s), Bosse, Rouille, Joint usé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Simple, Combiné, Américain, Encastrable
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Pelouse

> [Notion](https://www.notion.so/Pelouse-3251d95b2f8a8195a422dd5fac4373b5) | ID: `3251d95b-2f8a-8195-a422-dd5fac4373b5`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Jaunie, Dégarnie, Envahie mauvaises herbes, Trous, Mousse, Non entretenue
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-815d-8267-c7de8c2a2c33, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Recommandé

### Éléments hauts cuisine

> [Notion](https://www.notion.so/l-ments-hauts-cuisine-3251d95b2f8a8195bb5be1b5541b095d) | ID: `3251d95b-2f8a-8195-bb5b-e1b5541b095d`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Éclat(s), Rayure(s), Porte cassée, Charnière HS, Gonflement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Mélaminé, Laqué, Stratifié
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Radiateur / Chauffage

> [Notion](https://www.notion.so/Radiateur-Chauffage-3251d95b2f8a8196a361cac9ee5c2067) | ID: `3251d95b-2f8a-8196-a361-cac9ee5c2067`

- **Catégorie** : Chauffage
- **Valeurs Dégradations** : Fuite, Oxydation, Noirci, Mal fixé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Électrique, Gaz, Fonte, Alu, Acier, Sèche-serviettes, Convecteur, Panneau rayonnant
- **⚙️ Quantité** : Optionnel
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-819a-92da-ec08dfc79bac
- **⚙️ État général** : Recommandé

### Armoire

> [Notion](https://www.notion.so/Armoire-3251d95b2f8a8197acd8c4c9b6bd57db) | ID: `3251d95b-2f8a-8197-acd8-c4c9b6bd57db`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Éclat(s), Porte cassée, Charnière HS, Rail cassé, Gonflement
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Mélaminé, Métal, Penderie, Avec étagères, Avec miroir, Coulissante, Battante
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-81a5-950f-eae5e20955eb
- **⚙️ État général** : Recommandé

### Lunette / Abattant

> [Notion](https://www.notion.so/Lunette-Abattant-3251d95b2f8a819894a1f1310e21f35e) | ID: `3251d95b-2f8a-8198-94a1-f1310e21f35e`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Cassée, Fissurée, Jaunissement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Standard, Frein de chute, Déclipsable
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8115-80ce-ede0625b7cc0
- **⚙️ État général** : Recommandé

### Casserole(s)

> [Notion](https://www.notion.so/Casserole-s-3251d95b2f8a819983a2cc7d67bbee4a) | ID: `3251d95b-2f8a-8199-83a2-cc7d67bbee4a`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Rayure(s), Revêtement abîmé, Déformée, Poignée cassée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Inox, Anti-adhésif, Fonte, Céramique, Cuivre
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Entretien chaudière

> [Notion](https://www.notion.so/Entretien-chaudi-re-3251d95b2f8a8199b7b9c529b72092f0) | ID: `3251d95b-2f8a-8199-b7b9-c529b72092f0`

- **Catégorie** : Chauffage
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Justificatif fourni, Justificatif absent
- **⚙️ Quantité** : Masqué
- **⚙️ État général** : Masqué

### Vitrerie (fenêtre)

> [Notion](https://www.notion.so/Vitrerie-fen-tre-3251d95b2f8a819baffde38c3b797e9b) | ID: `3251d95b-2f8a-819b-affd-e38c3b797e9b`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Fêlé, Cassé, Rayure(s), Condensation entre vitrages, Joint de vitrage défaillant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-816b-ad7f-d830764c9dff
- **⚙️ État général** : Recommandé

### Poignée (porte palière)

> [Notion](https://www.notion.so/Poign-e-porte-pali-re-3251d95b2f8a819c8a14ff259fe639c7) | ID: `3251d95b-2f8a-819c-8a14-ff259fe639c7`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Cassée, Branlante, Mal fixée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : Rosace, Béquille, Bouton, Poignée plaque
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8158-ab3b-ef697900521e
- **⚙️ État général** : Optionnel

### Cendrier(s)

> [Notion](https://www.notion.so/Cendrier-s-3251d95b2f8a819d9ba2e2de8b1e0cf0) | ID: `3251d95b-2f8a-819d-9ba2-e2de8b1e0cf0`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462
- **⚙️ État général** : Masqué

### Interrupteur(s)

> [Notion](https://www.notion.so/Interrupteur-s-3251d95b2f8a819ea96fe63b74ae3385) | ID: `3251d95b-2f8a-819e-a96f-e63b74ae3385`

- **Catégorie** : Électricité
- **Valeurs Dégradations** : Cassé, Noirci, Mal fixé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Simple, Double, Va-et-vient, Variateur, Minuterie
- **⚙️ Quantité** : Optionnel
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-81e4-9615-e6a6fe31fd74, 3251d95b-2f8a-812b-8a46-fba571b16456, 3251d95b-2f8a-81ca-9ab1-d080ee489e60, 3251d95b-2f8a-819a-92da-ec08dfc79bac, 3251d95b-2f8a-8186-afe7-c99df8b0c091
- **⚙️ État général** : Optionnel

### Lave-linge

> [Notion](https://www.notion.so/Lave-linge-3251d95b2f8a81a08b7fc618b357f332) | ID: `3251d95b-2f8a-81a0-8b7f-c618b357f332`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Rayure(s), Bosse, Rouille, Joint usé, Vibre anormalement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Hublot, Top, Encastrable, Séchant, Pose libre
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8129-b1e0-c7289079e37d
- **⚙️ État général** : Recommandé

### Brosse WC

> [Notion](https://www.notion.so/Brosse-WC-3251d95b2f8a81a28e51ffc4a611ce9c) | ID: `3251d95b-2f8a-81a2-8e51-ffc4a611ce9c`

- **Catégorie** : Entretien
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Masqué

### Store banne

> [Notion](https://www.notion.so/Store-banne-3251d95b2f8a81a38ed4fb1497186b60) | ID: `3251d95b-2f8a-81a3-8ed4-fb1497186b60`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Toile déchirée, Bras cassé, Manivelle HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Commode

> [Notion](https://www.notion.so/Commode-3251d95b2f8a81a5b683c5fcae9e14c8) | ID: `3251d95b-2f8a-81a5-b683-c5fcae9e14c8`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Éclat(s), Tiroir cassé, Poignée cassée, Gonflement
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Mélaminé, Laqué, 3 tiroirs, 4 tiroirs, 5 tiroirs
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Recommandé

### Housse(s) de couette

> [Notion](https://www.notion.so/Housse-s-de-couette-3251d95b2f8a81a6a8b1e12333f63e6f) | ID: `3251d95b-2f8a-81a6-a8b1-e12333f63e6f`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Déchirure, Usure, Décoloré(e)
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : 140x200, 200x200, 240x220, Avec taie(s)
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### Rideaux

> [Notion](https://www.notion.so/Rideaux-3251d95b2f8a81a79d18e21afedfc53b) | ID: `3251d95b-2f8a-81a7-9d18-e21afedfc53b`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Déchirure, Décoloré
- **⚙️ Couleur** : Recommandé
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Occultant, Voilage, Double rideau, Lin, Coton, Polyester, À œillets, À pattes, Sur tringle, Sur rail
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69
- **⚙️ État général** : Recommandé

### Grille-pain

> [Notion](https://www.notion.so/Grille-pain-3251d95b2f8a81a7b131faad096839b4) | ID: `3251d95b-2f8a-81a7-b131-faad096839b4`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Noirci, Bloque, Levier cassé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : 2 fentes, 4 fentes, Avec réchauffe-viennoiseries
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Cheminée

> [Notion](https://www.notion.so/Chemin-e-3251d95b2f8a81a8afb4d259c6939d1b) | ID: `3251d95b-2f8a-81a8-afb4-d259c6939d1b`

- **Catégorie** : Chauffage
- **Valeurs Dégradations** : Noirci, Fissure(s), Éclat(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Optionnel
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Insert, Foyer ouvert, Poêle, Décorative
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661
- **⚙️ État général** : Recommandé

### Cuvette

> [Notion](https://www.notion.so/Cuvette-3251d95b2f8a81a99b85ced1fe2fa986) | ID: `3251d95b-2f8a-81a9-9b85-ced1fe2fa986`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Éclat(s), Fissure(s), Calcaire, Tache(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8115-80ce-ede0625b7cc0
- **⚙️ État général** : Recommandé

### Vidéoprojecteur

> [Notion](https://www.notion.so/Vid-oprojecteur-3251d95b2f8a81a9bdbee32c959f2c0f) | ID: `3251d95b-2f8a-81a9-bdbe-e32c959f2c0f`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Lampe HS, Pixel(s) mort(s), Télécommande manquante, Ventilateur bruyant, Tache(s) sur l'image
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : LED, Laser, Lampe, Full HD, 4K, Portable, Fixe, Avec écran
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Recommandé

### Garde-corps (fenêtre)

> [Notion](https://www.notion.so/Garde-corps-fen-tre-3251d95b2f8a81aab728d0b30b586ff6) | ID: `3251d95b-2f8a-81aa-b728-d0b30b586ff6`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Oxydation, Branlant, Mal fixé, Manquant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Métal, Bois, Verre, Barre d'appui
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-816b-ad7f-d830764c9dff
- **⚙️ État général** : Recommandé

### Escabeau

> [Notion](https://www.notion.so/Escabeau-3251d95b2f8a81ab94d1f5fcb912dc62) | ID: `3251d95b-2f8a-81ab-94d1-f5fcb912dc62`

- **Catégorie** : Mobilier
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0
- **⚙️ État général** : Masqué

### Clôture / Haie

> [Notion](https://www.notion.so/Cl-ture-Haie-3251d95b2f8a81ad8c88e45c54b0bb2f) | ID: `3251d95b-2f8a-81ad-8c88-e45c54b0bb2f`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Oxydation, Cassée, Manquante, Déformée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Grillage, Bois, PVC, Mur, Béton, Haie végétale
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Rambarde / Garde-corps

> [Notion](https://www.notion.so/Rambarde-Garde-corps-3251d95b2f8a81ad9d22d8540b53ac84) | ID: `3251d95b-2f8a-81ad-9d22-d8540b53ac84`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Oxydation, Branlante, Manquante
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Métal, Bois, Verre, Inox
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-8134-aafc-d3f31a15dc1c, 3251d95b-2f8a-8186-afe7-c99df8b0c091, 3251d95b-2f8a-816f-93b7-ec1265786b6c
- **⚙️ État général** : Recommandé

### Pot(s) de fleur(s)

> [Notion](https://www.notion.so/Pot-s-de-fleur-s-3251d95b2f8a81aead14c9c43e6eec2e) | ID: `3251d95b-2f8a-81ae-ad14-c9c43e6eec2e`

- **Catégorie** : Mobilier
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462
- **⚙️ État général** : Masqué

### Cuisinière

> [Notion](https://www.notion.so/Cuisini-re-3251d95b2f8a81b083a8ecd020d1afce) | ID: `3251d95b-2f8a-81b0-83a8-ecd020d1afce`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Rayure(s), Brûlure, Éclat(s), Rouille, Porte défaillante
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Gaz, Électrique, Mixte, Vitrocéramique, Induction
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Digicode / Badge

> [Notion](https://www.notion.so/Digicode-Badge-3251d95b2f8a81b0ab80dc617164739b) | ID: `3251d95b-2f8a-81b0-ab80-dc617164739b`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : HS, Touches usées, Écran HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Digicode, Badge, Clé magnétique, Bip
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Masqué

### Climatisation

> [Notion](https://www.notion.so/Climatisation-3251d95b2f8a81b18f8adee365683a63) | ID: `3251d95b-2f8a-81b1-8f8a-dee365683a63`

- **Catégorie** : Chauffage
- **Valeurs Dégradations** : Fuite réfrigérant, Bruit anormal, Télécommande manquante, Filtre encrassé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Split, Réversible, Gainable, Mobile
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69
- **⚙️ État général** : Recommandé

### Tupperware / Boîte(s) de rangement

> [Notion](https://www.notion.so/Tupperware-Bo-te-s-de-rangement-3251d95b2f8a81b1bb55daa70e91a6eb) | ID: `3251d95b-2f8a-81b1-bb55-daa70e91a6eb`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Couvercle manquant, Déformé(e), Taché(e)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Chauffe-eau / Ballon ECS

> [Notion](https://www.notion.so/Chauffe-eau-Ballon-ECS-3251d95b2f8a81b49e5dd409fcdd9360) | ID: `3251d95b-2f8a-81b4-9e5d-d409fcdd9360`

- **Catégorie** : Chauffage
- **Valeurs Dégradations** : Fuite, Oxydation, Calcaire, Groupe de sécurité défaillant, Thermostat HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Électrique, Gaz, Thermodynamique, Solaire, Ballon vertical, Ballon horizontal, Ballon extra-plat, Instantané, Cumulus, 50L, 100L, 150L, 200L, 300L
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Recommandé

### Ouvre-boîte / Décapsuleur / Tire-bouchon

> [Notion](https://www.notion.so/Ouvre-bo-te-D-capsuleur-Tire-bouchon-3251d95b2f8a81b78eaee9143cf872a8) | ID: `3251d95b-2f8a-81b7-8eae-e9143cf872a8`

- **Catégorie** : Vaisselle & couverts
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Table basse

> [Notion](https://www.notion.so/Table-basse-3251d95b2f8a81b8a05bd35a4cabce46) | ID: `3251d95b-2f8a-81b8-a05b-d35a4cabce46`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Tache(s), Éclat(s)
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Verre, Métal, Laqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Recommandé

### Bidet

> [Notion](https://www.notion.so/Bidet-3251d95b2f8a81b9a4dad0f9fa8b1bda) | ID: `3251d95b-2f8a-81b9-a4da-d0f9fa8b1bda`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Éclat(s), Fissure(s), Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Sous-items** : 3251d95b-2f8a-8121-bda1-c054b89f0148, 3251d95b-2f8a-8136-9cf8-c7c9424aad5e, 3251d95b-2f8a-8131-9ca3-f9e37c301d12, 3251d95b-2f8a-8180-98e3-e456e19532c3
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Céramique, Sur pied, Suspendu
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Recommandé

### Luminaire(s)

> [Notion](https://www.notion.so/Luminaire-s-3251d95b2f8a81b9b008fb2d5ec6baa7) | ID: `3251d95b-2f8a-81b9-b008-fb2d5ec6baa7`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Cassé, Ampoule manquante
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Lampadaire, Lampe de bureau, Lampe de chevet, Suspension
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8126-b02e-c517f997672f
- **⚙️ État général** : Optionnel

### Serrure (porte)

> [Notion](https://www.notion.so/Serrure-porte-3251d95b2f8a81b9bb01fba854685d09) | ID: `3251d95b-2f8a-81b9-bb01-fba854685d09`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Grippée, Cassée, Difficile, Clé coincée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **Valeurs Caractéristiques** : 3 points, 5 points, Simple, À larder, En applique
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81ca-8aff-f5f3825c03ee
- **⚙️ État général** : Optionnel

### Toiture

> [Notion](https://www.notion.so/Toiture-3251d95b2f8a81c082fac5776273a8e1) | ID: `3251d95b-2f8a-81c0-82fa-c5776273a8e1`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Tuile(s) cassée(s), Tuile(s) manquante(s), Mousse, Infiltration, Faîtage abîmé, Zinc percé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Tuiles, Ardoises, Zinc, Tôle, Fibrociment, Chaume, Toiture-terrasse, Bac acier
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Porte-couteaux / Bloc couteaux

> [Notion](https://www.notion.so/Porte-couteaux-Bloc-couteaux-3251d95b2f8a81c1a8e3d50f00c05164) | ID: `3251d95b-2f8a-81c1-a8e3-d50f00c05164`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Cassé, Magnétique défaillant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Allées / Circulation extérieure

> [Notion](https://www.notion.so/All-es-Circulation-ext-rieure-3251d95b2f8a81c1b8f2e5b0309805d8) | ID: `3251d95b-2f8a-81c1-b8f2-e5b0309805d8`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Fissure(s), Affaissement, Décollement, Mousse, Mauvaises herbes, Nid-de-poule
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Gravier, Pavé, Béton, Dalle, Enrobé, Terre battue
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-815d-8267-c7de8c2a2c33, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Recommandé

### Lit / Couchage

> [Notion](https://www.notion.so/Lit-Couchage-3251d95b2f8a81c28c0ad9d3d183a8f6) | ID: `3251d95b-2f8a-81c2-8c0a-d9d3d183a8f6`

- **Catégorie** : Literie
- **Valeurs Dégradations** : Tache(s), Déchirure, Cassé, Affaissement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Simple, Double, Queen, King, Superposé, Mezzanine, Canapé-lit
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Recommandé

### Parasol

> [Notion](https://www.notion.so/Parasol-3251d95b2f8a81c29988d29e30801af8) | ID: `3251d95b-2f8a-81c2-9988-d29e30801af8`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Toile déchirée, Décoloré, Mât cassé, Manivelle HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Droit, Déporté, Inclinable, Avec manivelle
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Optionnel

### Escalier intérieur

> [Notion](https://www.notion.so/Escalier-int-rieur-3251d95b2f8a81c29c6cc373b313ef19) | ID: `3251d95b-2f8a-81c2-9c6c-c373b313ef19`

- **Catégorie** : Escalier
- **Valeurs Dégradations** : Marche(s) abîmée(s), Rampe branlante, Nez de marche usé(s), Grincement
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Métal, Béton, Colimaçon, Droit, Quart tournant
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8186-afe7-c99df8b0c091
- **⚙️ État général** : Recommandé

### Barre de crédence / Crémaillère

> [Notion](https://www.notion.so/Barre-de-cr-dence-Cr-maill-re-3251d95b2f8a81c2b80def5fe95d591d) | ID: `3251d95b-2f8a-81c2-b80d-ef5fe95d591d`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Mal fixée, Oxydée, Crochet(s) manquant(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Inox, Alu, Avec crochets, Avec étagère
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Poêle(s)

> [Notion](https://www.notion.so/Po-le-s-3251d95b2f8a81c3a5cec85011fd5612) | ID: `3251d95b-2f8a-81c3-a5ce-c85011fd5612`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Rayure(s), Revêtement abîmé, Déformée, Poignée cassée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Anti-adhésif, Inox, Fonte, Céramique, Wok, Crêpière
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Saladier(s)

> [Notion](https://www.notion.so/Saladier-s-3251d95b2f8a81c4a9efcc1ccdec9197) | ID: `3251d95b-2f8a-81c4-a9ef-cc1ccdec9197`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(s), Fissure(s), Rayure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Verre, Porcelaine, Bois, Inox, Plastique
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Dressing / Penderie

> [Notion](https://www.notion.so/Dressing-Penderie-3251d95b2f8a81c58791e18e56644c85) | ID: `3251d95b-2f8a-81c5-8791-e18e56644c85`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Porte cassée, Charnière HS, Rail cassé
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Mélaminé, Ouvert, Fermé, Avec miroir, Coulissant
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8126-b02e-c517f997672f
- **⚙️ État général** : Recommandé

### Télévision

> [Notion](https://www.notion.so/T-l-vision-3251d95b2f8a81c89d81ecfca09072e1) | ID: `3251d95b-2f8a-81c8-9d81-ecfca09072e1`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Rayure(s), Pixel mort, Télécommande manquante, Écran fêlé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : LED, OLED, QLED, 32 pouces, 40 pouces, 55 pouces, 65 pouces, Murale, Sur pied
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Recommandé

### Plan vasque

> [Notion](https://www.notion.so/Plan-vasque-3251d95b2f8a81c89e38eb532b8f6fdd) | ID: `3251d95b-2f8a-81c8-9e38-eb532b8f6fdd`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Éclat(s), Tache(s), Fissure(s), Gonflement, Trace(s) d'humidité
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Céramique, Résine, Pierre, Bois, Stratifié
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213
- **⚙️ État général** : Recommandé

### Bonde (lavabo)

> [Notion](https://www.notion.so/Bonde-lavabo-3251d95b2f8a81ca80f2cf3cee598f3c) | ID: `3251d95b-2f8a-81ca-80f2-cf3cee598f3c`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Grippée, Bouchée, Fuite, Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8110-a320-c1cb3ddadfad
- **⚙️ État général** : Optionnel

### Porte

> [Notion](https://www.notion.so/Porte-3251d95b2f8a81ca8afff5f3825c03ee) | ID: `3251d95b-2f8a-81ca-8aff-f5f3825c03ee`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Éclat(s), Rayure(s), Trace(s), Griffure(s), Impact(s), Voilée, Ne ferme pas
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-8102-9793-e362c5cb336a, 3251d95b-2f8a-81b9-bb01-fba854685d09, 3251d95b-2f8a-8155-9488-cfbd3c094579
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Pleine, Vitrée, Coulissante, Battante, Blindée, Bois, PVC, Alu
- **⚙️ Quantité** : Optionnel
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-81e4-9615-e6a6fe31fd74, 3251d95b-2f8a-812b-8a46-fba571b16456, 3251d95b-2f8a-819a-92da-ec08dfc79bac
- **⚙️ État général** : Recommandé

### Plaque de cuisson

> [Notion](https://www.notion.so/Plaque-de-cuisson-3251d95b2f8a81cb85a5e95b1e7d6ad7) | ID: `3251d95b-2f8a-81cb-85a5-e95b1e7d6ad7`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Rayure(s), Brûlure, Éclat(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Induction, Vitro, Gaz, Électrique, 2 feux, 3 feux, 4 feux
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Hotte

> [Notion](https://www.notion.so/Hotte-3251d95b2f8a81cbb5a1f23b6de86236) | ID: `3251d95b-2f8a-81cb-b5a1-f23b6de86236`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Filtre encrassé, Bruyante, Éclairage HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Casquette, Décorative, Îlot, Encastrable, Groupe filtrant
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Joints (évier)

> [Notion](https://www.notion.so/Joints-vier-3251d95b2f8a81ce9feef6e40126d88b) | ID: `3251d95b-2f8a-81ce-9fee-f6e40126d88b`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Défaillant(s), Moisi(s), Noirci(s), Absent(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Silicone, Caoutchouc
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81e6-8cae-c1ad1e98ea6e
- **⚙️ État général** : Optionnel

### Bain de soleil / Chaise longue

> [Notion](https://www.notion.so/Bain-de-soleil-Chaise-longue-3251d95b2f8a81ceb071e5ee62ae5dc4) | ID: `3251d95b-2f8a-81ce-b071-e5ee62ae5dc4`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rouille, Cassé, Décoloré, Toile déchirée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Bois, Métal, Résine, Avec matelas
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Optionnel

### Cadre(s) / Décoration

> [Notion](https://www.notion.so/Cadre-s-D-coration-3251d95b2f8a81ceb20bf3ca5bc91422) | ID: `3251d95b-2f8a-81ce-b20b-f3ca5bc91422`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Cassé, Rayure(s), Verre fêlé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8152-9933-df5a60730cc3
- **⚙️ État général** : Optionnel

### Coussin(s)

> [Notion](https://www.notion.so/Coussin-s-3251d95b2f8a81cf90e9fa19c366b9ec) | ID: `3251d95b-2f8a-81cf-90e9-fa19c366b9ec`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Déchirure, Déformé
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Masqué

### Plan de travail

> [Notion](https://www.notion.so/Plan-de-travail-3251d95b2f8a81d091b9e173b0660a5d) | ID: `3251d95b-2f8a-81d0-91b9-e173b0660a5d`

- **Catégorie** : Cuisine
- **Valeurs Dégradations** : Rayure(s), Tache(s), Éclat(s), Brûlure(s), Décollement, Gonflement
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Stratifié, Bois massif, Granit, Quartz, Inox, Carrelage, Béton ciré
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Siphon (baignoire)

> [Notion](https://www.notion.so/Siphon-baignoire-3251d95b2f8a81d0a4ebce713c5a5577) | ID: `3251d95b-2f8a-81d0-a4eb-ce713c5a5577`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Bouché, Oxydé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Optionnel

### Paroi / Rideau (douche)

> [Notion](https://www.notion.so/Paroi-Rideau-douche-3251d95b2f8a81d4919ce2439286dc1b) | ID: `3251d95b-2f8a-81d4-919c-e2439286dc1b`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fissure(s), Calcaire, Moisissure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Verre fixe, Verre coulissant, Rideau
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Recommandé

### Couverture(s) / Plaid(s)

> [Notion](https://www.notion.so/Couverture-s-Plaid-s-3251d95b2f8a81d494e0d3ede25520e1) | ID: `3251d95b-2f8a-81d4-94e0-d3ede25520e1`

- **Catégorie** : Linge
- **Valeurs Dégradations** : Tache(s), Déchirure, Usure
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Optionnel

### Porche / Véranda / Loggia

> [Notion](https://www.notion.so/Porche-V-randa-Loggia-3251d95b2f8a81d4999fc6b1dbc4baee) | ID: `3251d95b-2f8a-81d4-999f-c6b1dbc4baee`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Vitrage fêlé, Infiltration, Condensation, Fissure(s), Joint(s) défaillant(s), Moisissure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Alu, PVC, Bois, Vitrage simple, Vitrage double, Toit polycarbonate, Toit verre
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Inverseur (baignoire)

> [Notion](https://www.notion.so/Inverseur-baignoire-3251d95b2f8a81d69f2ff0d5c3be57fe) | ID: `3251d95b-2f8a-81d6-9f2f-f0d5c3be57fe`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Grippé, Fuite, Cassé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Masqué

### Édredon(s) / Couvre-lit

> [Notion](https://www.notion.so/dredon-s-Couvre-lit-3251d95b2f8a81da9475fedb3dda77ff) | ID: `3251d95b-2f8a-81da-9475-fedb3dda77ff`

- **Catégorie** : Literie
- **Valeurs Dégradations** : Tache(s), Déchirure, Décoloré
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### Serrure (porte palière)

> [Notion](https://www.notion.so/Serrure-porte-pali-re-3251d95b2f8a81da9dd2e7054f34aaa3) | ID: `3251d95b-2f8a-81da-9dd2-e7054f34aaa3`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Grippée, Cassée, Difficile, Clé coincée
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : 3 points, 5 points, A2P, À larder, En applique, Cylindre européen
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8158-ab3b-ef697900521e
- **⚙️ État général** : Optionnel

### Assiettes

> [Notion](https://www.notion.so/Assiettes-3251d95b2f8a81dab053e43f7b346359) | ID: `3251d95b-2f8a-81da-b053-e43f7b346359`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(es), Fissure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Plates, Creuses, À dessert, Porcelaine, Grès, Faïence, Mélamine
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Tapis

> [Notion](https://www.notion.so/Tapis-3251d95b2f8a81dab613f2bcc39d3753) | ID: `3251d95b-2f8a-81da-b613-f2bcc39d3753`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Tache(s), Usure, Décoloré
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-81a5-950f-eae5e20955eb
- **⚙️ État général** : Optionnel

### Box Internet

> [Notion](https://www.notion.so/Box-Internet-3251d95b2f8a81dcb4e1eacb698c0ef3) | ID: `3251d95b-2f8a-81dc-b4e1-eacb698c0ef3`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Cassée, Câble endommagé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Fibre, ADSL, 4G/5G
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088
- **⚙️ État général** : Optionnel

### Siphon (douche)

> [Notion](https://www.notion.so/Siphon-douche-3251d95b2f8a81dd9479d81e080cbd34) | ID: `3251d95b-2f8a-81dd-9479-d81e080cbd34`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Bouché, Oxydé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Optionnel

### Table extérieure

> [Notion](https://www.notion.so/Table-ext-rieure-3251d95b2f8a81de9147e2a8c04e72ba) | ID: `3251d95b-2f8a-81de-9147-e2a8c04e72ba`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rouille, Cassée, Tache(s), Décolorée, Branlante
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Métal, Résine, Teck, Alu, Ronde, Rectangulaire, Pliante, Extensible
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Recommandé

### Nappe(s) / Sets de table

> [Notion](https://www.notion.so/Nappe-s-Sets-de-table-3251d95b2f8a81deacc8c298de5c472e) | ID: `3251d95b-2f8a-81de-acc8-c298de5c472e`

- **Catégorie** : Linge
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Siphon (évier)

> [Notion](https://www.notion.so/Siphon-vier-3251d95b2f8a81df9c00c4904038a374) | ID: `3251d95b-2f8a-81df-9c00-c4904038a374`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Bouché, Oxydé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81e6-8cae-c1ad1e98ea6e
- **⚙️ État général** : Optionnel

### Joints (douche)

> [Notion](https://www.notion.so/Joints-douche-3251d95b2f8a81e09073c78c305af3f1) | ID: `3251d95b-2f8a-81e0-9073-c78c305af3f1`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Défaillant(s), Moisi(s), Noirci(s), Absent(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Silicone, Caoutchouc
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811a-86ea-dd155bbb6856
- **⚙️ État général** : Optionnel

### Volet / Store

> [Notion](https://www.notion.so/Volet-Store-3251d95b2f8a81e0b896cd29879b7f1a) | ID: `3251d95b-2f8a-81e0-b896-cd29879b7f1a`

- **Catégorie** : Menuiseries
- **Valeurs Dégradations** : Cassé, Bloqué, Lame(s) abîmée(s), Manivelle HS
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Volet roulant, Volet battant, Store vénitien, Store enrouleur, Persiennes
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-816b-ad7f-d830764c9dff
- **⚙️ État général** : Recommandé

### Oreiller(s)

> [Notion](https://www.notion.so/Oreiller-s-3251d95b2f8a81e5b96cc57ad8fba1b7) | ID: `3251d95b-2f8a-81e5-b96c-c57ad8fba1b7`

- **Catégorie** : Literie
- **Valeurs Dégradations** : Tache(s), Affaissement, Déchirure
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8124-9717-da9eb234b978
- **⚙️ État général** : Optionnel

### Évier

> [Notion](https://www.notion.so/vier-3251d95b2f8a81e68caec1ad1e98ea6e) | ID: `3251d95b-2f8a-81e6-8cae-c1ad1e98ea6e`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Rayure(s), Tache(s), Éclat(s), Calcaire, Fissure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Recommandé
- **Sous-items** : 3251d95b-2f8a-81e9-a4dc-dce93997307f, 3251d95b-2f8a-8176-a6de-f2b64d9e692c, 3251d95b-2f8a-81df-9c00-c4904038a374, 3251d95b-2f8a-81ce-9fee-f6e40126d88b
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Inox, Résine, Céramique, Granit, 1 bac, 2 bacs, Avec égouttoir
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Verres

> [Notion](https://www.notion.so/Verres-3251d95b2f8a81e6a2f8dc5341d2d63c) | ID: `3251d95b-2f8a-81e6-a2f8-dc5341d2d63c`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(s), Fissure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Eau, À vin, À pied, Flûte, Shot, Gobelet
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Chaise(s) de jardin

> [Notion](https://www.notion.so/Chaise-s-de-jardin-3251d95b2f8a81e7a5fed8d78d8ad6d7) | ID: `3251d95b-2f8a-81e7-a5fe-d8d78d8ad6d7`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rouille, Cassée, Décolorée, Branlante
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Métal, Résine, Plastique, Pliante, Empilable
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-81ac-921b-d8a5a5add6c4
- **⚙️ État général** : Optionnel

### Réservoir WC

> [Notion](https://www.notion.so/R-servoir-WC-3251d95b2f8a81e88619ee9a4c2c8e97) | ID: `3251d95b-2f8a-81e8-8619-ee9a4c2c8e97`

- **Catégorie** : Sanitaires
- **Valeurs Dégradations** : Fissure(s), Fuite, Calcaire
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-8115-80ce-ede0625b7cc0
- **⚙️ État général** : Optionnel

### Façade

> [Notion](https://www.notion.so/Fa-ade-3251d95b2f8a81e8976cea4c9255575b) | ID: `3251d95b-2f8a-81e8-976c-ea4c9255575b`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Fissure(s), Écaillement, Décollement enduit, Mousse, Trace(s) d'humidité, Noircissement, Graffiti
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Recommandé
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Enduit, Crépi, Pierre, Brique, Bardage bois, Bardage métallique, Bardage PVC
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Robinet (évier)

> [Notion](https://www.notion.so/Robinet-vier-3251d95b2f8a81e9a4dcdce93997307f) | ID: `3251d95b-2f8a-81e9-a4dc-dce93997307f`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Calcaire, Grippé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mitigeur, Mélangeur, Col de cygne
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-81e6-8cae-c1ad1e98ea6e
- **⚙️ État général** : Recommandé

### Flexible / Pommeau (baignoire)

> [Notion](https://www.notion.so/Flexible-Pommeau-baignoire-3251d95b2f8a81ebbb54e445766b0b30) | ID: `3251d95b-2f8a-81eb-bb54-e445766b0b30`

- **Catégorie** : Plomberie
- **Valeurs Dégradations** : Fuite, Calcaire, Percé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Masqué
- **Item parent** : 3251d95b-2f8a-811d-9b8e-c5b03b2e45aa
- **⚙️ État général** : Optionnel

### Verrou(s)

> [Notion](https://www.notion.so/Verrou-s-3251d95b2f8a81ec8138f54d5677a481) | ID: `3251d95b-2f8a-81ec-8138-f54d5677a481`

- **Catégorie** : Équipements généraux
- **Valeurs Dégradations** : Grippé, Cassé, Difficile, Mal fixé
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Haut, Bas, Chaîne de sécurité, Entrebâilleur
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8168-9da7-d7f29097299a
- **⚙️ État général** : Optionnel

### Gouttières / Descentes EP

> [Notion](https://www.notion.so/Goutti-res-Descentes-EP-3251d95b2f8a81ec8433fa8b465d9062) | ID: `3251d95b-2f8a-81ec-8433-fa8b465d9062`

- **Catégorie** : Extérieur
- **Valeurs Dégradations** : Percé(e), Bouché(e), Décroché(e), Oxydation, Fuite, Débord
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Zinc, PVC, Alu, Cuivre, Cheneau
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8134-aafc-d3f31a15dc1c
- **⚙️ État général** : Recommandé

### Congélateur

> [Notion](https://www.notion.so/Cong-lateur-3251d95b2f8a81ec88ffd8c72c83753d) | ID: `3251d95b-2f8a-81ec-88ff-d8c72c83753d`

- **Catégorie** : Électroménager
- **Valeurs Dégradations** : Givre excessif, Rouille, Joint usé, Bosse
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Coffre, Armoire, Tiroirs, Encastrable
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Optionnel

### Meuble à chaussures

> [Notion](https://www.notion.so/Meuble-chaussures-3251d95b2f8a81f584b4ecdf5c44c041) | ID: `3251d95b-2f8a-81f5-84b4-ecdf5c44c041`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Éclat(s), Porte cassée
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb
- **⚙️ État général** : Optionnel

### Prises électriques

> [Notion](https://www.notion.so/Prises-lectriques-3251d95b2f8a81f5b650e6c68f2427bb) | ID: `3251d95b-2f8a-81f5-b650-e6c68f2427bb`

- **Catégorie** : Électricité
- **Valeurs Dégradations** : Cassée, Noircie, Mal fixée, Fondue
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Recommandé
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Standard, USB, Double, Triple, Extérieure
- **⚙️ Quantité** : Optionnel
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f, 3251d95b-2f8a-811d-b298-db5e33eb0c5d, 3251d95b-2f8a-8102-9db0-ce35450d3462, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-81e4-9615-e6a6fe31fd74, 3251d95b-2f8a-812b-8a46-fba571b16456, 3251d95b-2f8a-81ca-9ab1-d080ee489e60, 3251d95b-2f8a-816f-93b7-ec1265786b6c, 3251d95b-2f8a-819a-92da-ec08dfc79bac
- **⚙️ État général** : Optionnel

### Soupière(s)

> [Notion](https://www.notion.so/Soupi-re-s-3251d95b2f8a81f68125facd10346eee) | ID: `3251d95b-2f8a-81f6-8125-facd10346eee`

- **Catégorie** : Vaisselle & couverts
- **Valeurs Dégradations** : Ébréché(e), Fissure(s)
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Masqué

### Four

> [Notion](https://www.notion.so/Four-3251d95b2f8a81f69958dbe714c60cc3) | ID: `3251d95b-2f8a-81f6-9958-dbe714c60cc3`

- **Catégorie** : Électroménager
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Recommandé
- **⚙️ Fonctionnement** : Obligatoire
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Électrique, Gaz, Pyrolyse, Chaleur tournante, Encastrable
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc
- **⚙️ État général** : Recommandé

### Chaise(s)

> [Notion](https://www.notion.so/Chaise-s-3251d95b2f8a81f88ee9e58b3f5739fc) | ID: `3251d95b-2f8a-81f8-8ee9-e58b3f5739fc`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Rayure(s), Déchirure, Branlante
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Recommandé
- **Valeurs Caractéristiques** : Bois, Métal, Plastique, Tissu, Cuir, Tabouret, Pliante, Bureau
- **⚙️ Quantité** : Obligatoire
- **Pièces** : 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69
- **⚙️ État général** : Optionnel

### Étendoir / Tancarville

> [Notion](https://www.notion.so/tendoir-Tancarville-3251d95b2f8a81faab99c336da783fad) | ID: `3251d95b-2f8a-81fa-ab99-c336da783fad`

- **Catégorie** : Mobilier
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Masqué
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Masqué
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81ce-a56e-ddede28b32c0
- **⚙️ État général** : Masqué

### Porte-manteaux

> [Notion](https://www.notion.so/Porte-manteaux-3251d95b2f8a81fb8475d62edabf5181) | ID: `3251d95b-2f8a-81fb-8475-d62edabf5181`

- **Catégorie** : Mobilier
- **Valeurs Dégradations** : Cassé, Mal fixé, Branlant
- **⚙️ Couleur** : Masqué
- **⚙️ Photos** : Masqué
- **Source** : Plateforme
- **⚙️ Dégradations** : Optionnel
- **⚙️ Propreté** : Masqué
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : Inventaire
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Mural, Sur pied, Patère
- **⚙️ Quantité** : Recommandé
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb
- **⚙️ État général** : Optionnel

### Plafond

> [Notion](https://www.notion.so/Plafond-3251d95b2f8a81fdbdb7edf97baa2a13) | ID: `3251d95b-2f8a-81fd-bdb7-edf97baa2a13`

- **Catégorie** : Revêtements
- **Valeurs Dégradations** : Tache(s), Fissure(s), Décollement, Trace(s) d'humidité, Moisissure, Noirci
- **⚙️ Couleur** : Optionnel
- **⚙️ Photos** : Optionnel
- **Source** : Plateforme
- **⚙️ Dégradations** : Recommandé
- **⚙️ Propreté** : Optionnel
- **⚙️ Fonctionnement** : Masqué
- **Contexte** : EDL
- **⚙️ Caractéristiques** : Optionnel
- **Valeurs Caractéristiques** : Peinture, Crépi, Lambris, Placo, Faux plafond, Moulures
- **⚙️ Quantité** : Masqué
- **Pièces** : 3251d95b-2f8a-81a5-950f-eae5e20955eb, 3251d95b-2f8a-8175-b2c1-d50eb8066088, 3251d95b-2f8a-819e-807f-cf882ad39661, 3251d95b-2f8a-8185-ae9a-fda673c59710, 3251d95b-2f8a-8177-8824-cd1f206400fc, 3251d95b-2f8a-8124-9717-da9eb234b978, 3251d95b-2f8a-8145-834b-e262e2733c69, 3251d95b-2f8a-815b-b5e1-cb36e58112db, 3251d95b-2f8a-8129-b1e0-c7289079e37d, 3251d95b-2f8a-81d6-b321-d58c6af6f213, 3251d95b-2f8a-8174-8d23-e6ec37930817, 3251d95b-2f8a-81ce-a56e-ddede28b32c0, 3251d95b-2f8a-8152-9933-df5a60730cc3, 3251d95b-2f8a-8126-b02e-c517f997672f, 3251d95b-2f8a-8162-b5c3-e130246464c5, 3251d95b-2f8a-817f-9e30-ca8e0cc1b84b, 3251d95b-2f8a-81e4-9615-e6a6fe31fd74, 3251d95b-2f8a-81ca-9ab1-d080ee489e60, 3251d95b-2f8a-819a-92da-ec08dfc79bac
- **⚙️ État général** : Recommandé
