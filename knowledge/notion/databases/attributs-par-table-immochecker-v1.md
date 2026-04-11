---
notion_id: "e3a1c51c-b6f9-4761-adec-e3b9d916f3e0"
notion_url: "https://www.notion.so/e3a1c51cb6f94761adece3b9d916f3e0"
type: database
entries: 313
last_synced: "2026-03-26T12:50:04.426Z"
---

# 📊 🗃️ Attributs par Table — ImmoChecker V1

> 313 entrees | [Ouvrir dans Notion](https://www.notion.so/e3a1c51cb6f94761adece3b9d916f3e0)

## Schema

| Propriete | Type | Options |
|-----------|------|---------|
| Description | rich_text |  |
| Obligatoire | checkbox |  |
| Valeurs_enum | rich_text |  |
| Type | select | uuid, string, enum, bool, int, float, text, blob, url, json, date, datetime, time, uuid FK, liste |
| Notes_client | rich_text |  |
| Table | select | Workspace, Utilisateur, WorkspaceUser, Tiers, TiersOrganisation, Batiment, AdresseBatiment, Lot, Mission, EDL_Inventaire, AccesLot, CompteurLot, ReleveCompteur, ValeurReleveCompteur, Photo, TypePiece, CatalogueItem, ValeurReferentiel, ConfigCritereCategorie, ConfigCritereItem, TemplatePieceItem, PieceEDL, EvaluationItem, LotProprietaire, EDLLocataire, MissionTechnicien, IndisponibiliteTechnicien, CleMission, UserPreference |
| Attribut | title |  |

## Donnees

| # | Attribut | Description | Obligatoire | Valeurs_enum | Type | Notes_client | Table |
|---|---|---|---|---|---|---|---|
| 1 | type | Type d'adresse | Oui | principale \| secondaire | enum |  | AdresseBatiment |
| 2 | workspace_id | Référence Workspace | Oui |  | uuid FK |  | Batiment |
| 3 | id | Clé primaire | Oui |  | uuid |  | AdresseBatiment |
| 4 | heure_debut | Heure de début de la mission — importante notamment pour les | Non |  | time |  | Mission |
| 5 | representant_nom | Nom du représentant (locataire avec procuration) | Non |  | string |  | Tiers |
| 6 | eau_chaude_type | Type d'eau chaude | Non | individuelle \| collective \| aucun \| autre | enum |  | Lot |
| 7 | etage | Étage du lot — si "autre", préciser dans etage_precision | Non | sous_sol \| rez_de_jardin \| rez_de_chaussee \| entresol \|  | enum | Enum ? case autre | Lot |
| 8 | date_signature | Date et heure de signature | Non |  | datetime |  | EDL_Inventaire |
| 9 | rue | Numéro et nom de rue | Oui |  | string |  | AdresseBatiment |
| 10 | auth_provider | Fournisseur d'authentification (email, Google…) | Non |  | string |  | Utilisateur |
| 11 | ordre | Ordre d'affichage | Oui |  | int | Je ne sais pas ce que c’est  | AdresseBatiment |
| 12 | organisation_id | Organisation (personne morale) | Oui |  | uuid FK |  | TiersOrganisation |
| 13 | type_bien | Type de bien | Oui | appartement \| maison \| box_parking \| bureau \| local_comm | enum |  | Lot |
| 14 | num_batiment | Numéro de bâtiment (A, B, C…) | Non |  | string |  | Batiment |
| 15 | contact_mandataire_id | Contact opérationnel chez le mandataire | Non |  | uuid FK |  | EDL_Inventaire |
| 16 | type | Type de document. edl = état des lieux (toujours présent). i | Oui | edl \| inventaire \| avenant | enum |  | EDL_Inventaire |
| 17 | id | Clé primaire | Oui |  | uuid |  | Mission |
| 18 | fonction | Fonction dans l'organisation | Non |  | string |  | TiersOrganisation |
| 19 | signature_image | Image de signature manuscrite stockée | Non |  | blob |  | Utilisateur |
| 20 | mission_id | Mission parente (optionnel) | Non |  | uuid FK |  | EDL_Inventaire |
| 21 | batiment_id | Référence Bâtiment | Oui |  | uuid FK |  | AdresseBatiment |
| 22 | id | Clé primaire | Oui |  | uuid |  | Batiment |
| 23 | heure_fin | Heure de fin prévisionnelle de la mission — permet de bloque | Non |  | time |  | Mission |
| 24 | nb_pieces | Nombre de pièces du lot — si "autre", préciser dans nb_piece | Oui | studio \| T1 \| T2 \| T3 \| T4 \| T5 \| T6 \| autre | enum | Obligatoire, enum avec case autre | Lot |
| 25 | annee_construction | Année de construction | Non |  | int |  | Batiment |
| 26 | est_principal | Contact par défaut de l'organisation ? | Oui |  | bool |  | TiersOrganisation |
| 27 | technicien_id | Utilisateur ayant réalisé l'EDL | Oui |  | uuid FK |  | EDL_Inventaire |
| 28 | ⛔ logo [DOUBLON → logo_url] | DOUBLON (23/03/2026) — Remplacé par logo_url. Utiliser logo_ | Non |  | url |  | Workspace |
| 29 | email | Email (unique, sert à l'authentification) | Oui |  | string |  | Utilisateur |
| 30 | lot_id | Lot concerné | Oui |  | uuid FK |  | EDL_Inventaire |
| 31 | nom | Nom de famille (physique) ou nom du référent (morale) | Oui |  | string |  | Tiers |
| 32 | ville | Ville | Oui |  | string |  | AdresseBatiment |
| 33 | SIREN | Numéro SIREN (morale uniquement) | Non |  | string |  | Tiers |
| 34 | type_workspace | Type de workspace. Conditionne le workflow (simplifié pour b | Oui | societe_edl \| bailleur \| agence | enum |  | Workspace |
| 35 | eau_chaude_mode | Mode énergétique eau chaude | Non | gaz \| electrique \| autre | enum |  | Lot |
| 36 | ville | Ville | Non |  | string |  | Tiers |
| 37 | id | Clé primaire | Oui |  | uuid |  | Workspace |
| 38 | nom | Nom du workspace | Oui |  | string |  | Workspace |
| 39 | web_url | URL de la version web lecture seule (lien persistant) | Non |  | url |  | EDL_Inventaire |
| 40 | workspace_id | Référence Workspace | Oui |  | uuid FK |  | Tiers |
| 41 | statut | Statut du cycle de vie de la mission. brouillon = créée mais | Oui | brouillon \| planifiee \| terminee \| annulee | enum |  | Mission |
| 42 | adresse | Adresse postale | Non |  | string |  | Tiers |
| 43 | mandataire_id | Agence mandataire gestionnaire du lot (Tiers) | Non |  | uuid FK |  | Lot |
| 44 | tel | Téléphone | Non |  | string |  | Utilisateur |
| 45 | meuble | Le lot est-il meublé ? | Oui |  | bool |  | Lot |
| 46 | complement | Complément d'adresse | Non |  | string |  | AdresseBatiment |
| 47 | workspace_id | Référence Workspace | Oui |  | uuid FK |  | WorkspaceUser |
| 48 | code_postal | Code postal | Oui |  | string |  | AdresseBatiment |
| 49 | reference | Référence auto-générée (ex : M-2026-0042) | Oui |  | string | faire un libellé comme pour flat checker ex BOURI _280226_ED | Mission |
| 50 | workspace_id | Référence Workspace | Oui |  | uuid FK |  | Mission |
| 51 | id | Clé primaire | Oui |  | uuid |  | Utilisateur |
| 52 | emplacement | Emplacement / description libre | Non |  | string |  | Lot |
| 53 | role | Rôle de l'utilisateur dans ce workspace | Oui | admin \| gestionnaire \| technicien | enum |  | WorkspaceUser |
| 54 | lot_id | Lot concerné | Oui |  | uuid FK |  | Mission |
| 55 | template_id | Template utilisé pour la saisie | Oui |  | uuid FK |  | EDL_Inventaire |
| 56 | surface | Surface en m² | Non |  | float |  | Lot |
| 57 | chauffage_mode | Mode énergétique du chauffage | Non | gaz \| electrique \| fioul \| autre | enum |  | Lot |
| 58 | prenom | Prénom (physique uniquement) | Non |  | string |  | Tiers |
| 59 | date_realisation | Date et heure de réalisation effective | Non |  | datetime | Les deux champs sont conservés : date_realisation = quand le | EDL_Inventaire |
| 60 | ⛔ plan_abonnement [SUPPRIMÉ] | SUPPRIMÉ (23/03/2026) — Pas de gestion des abonnements en V1 | Non |  | string |  | Workspace |
| 61 | statut | Statut du document EDL/Inventaire. brouillon = en cours de s | Oui | brouillon \| signe \| infructueux | enum |  | EDL_Inventaire |
| 62 | type | Type de bâtiment | Oui | immeuble \| maison \| local_commercial \| mixte \| autre | enum |  | Batiment |
| 63 | created_by | Utilisateur ayant créé la mission | Oui |  | uuid FK | rajouter date et heure | Mission |
| 64 | num_appartement | Numéro du lot / appartement | Non |  | string |  | Lot |
| 65 | batiment_id | Référence Bâtiment | Oui |  | uuid FK |  | Lot |
| 66 | date_planifiee | Date prévue de l'intervention | Oui |  | date |  | Mission |
| 67 | tel | Téléphone | Non |  | string |  | Tiers |
| 68 | id | Clé primaire | Oui |  | uuid |  | EDL_Inventaire |
| 69 | chauffage_type | Type de chauffage | Non | individuel \| collectif \| aucun | enum |  | Lot |
| 70 | nom | Nom de famille | Oui |  | string |  | Utilisateur |
| 71 | type_personne | Type de personne | Oui | physique \| morale | enum |  | Tiers |
| 72 | pdf_url | URL du PDF généré (après signature) | Non |  | url | qr code ?  | EDL_Inventaire |
| 73 | couleur_primaire | Couleur principale de l'interface et des PDF (hex, ex : #256 | Non |  | string |  | Workspace |
| 74 | mandataire_id | Agence mandataire (Tiers) présente lors de l'EDL | Non |  | uuid FK |  | EDL_Inventaire |
| 75 | prenom | Prénom | Oui |  | string |  | Utilisateur |
| 76 | commentaire | Instructions terrain pour le technicien | Non |  | text |  | Mission |
| 77 | tiers_id | Personne physique | Oui |  | uuid FK |  | TiersOrganisation |
| 78 | id | Clé primaire | Oui |  | uuid |  | Tiers |
| 79 | sous_type | Sens de l'EDL | Oui | entree \| sortie | enum |  | EDL_Inventaire |
| 80 | user_id | Référence Utilisateur | Oui |  | uuid FK |  | WorkspaceUser |
| 81 | id | Clé primaire | Oui |  | uuid |  | Lot |
| 82 | edl_entree_id | EDL d'entrée lié (comparatifs sortie) | Non |  | uuid FK |  | EDL_Inventaire |
| 83 | raison_sociale | Raison sociale (morale uniquement) | Non |  | string |  | Tiers |
| 84 | email | Email | Non |  | string |  | Tiers |
| 85 | code_postal | Code postal | Non |  | string |  | Tiers |
| 86 | note | Note concernant le bâtiment | Non |  | string |  | Batiment |
| 87 | id | Clé primaire | Oui |  | uuid | on peut renommer la DB en remises de clefs ?  | AccesLot |
| 88 | reference_interne | Référence interne du bâtiment (ex : BAT-042) | Non |  | string | Prévoir de pouvoir mettre à jour cette référence manuellemen | Batiment |
| 89 | photo_reference | Photo de référence du compteur — prise une fois à la créatio | Non |  | url | pas compris
Tony : sert à avoir une photo de référence du co | CompteurLot |
| 90 | type | Type de fluide / énergie du compteur | Oui | eau_froide \| eau_chaude \| electricite \| gaz \| chauffage_ | enum | compteur chauffage global (principalement dans les immeuble  | CompteurLot |
| 91 | acces | Clés, badges, télécommandes remis lors de l'EDL (via AccesLo | Non |  | liste |  | EDL_Inventaire |
| 92 | ges_classe | Étiquette GES — émissions de gaz à effet de serre | Non | A \| B \| C \| D \| E \| F \| G | enum |  | Lot |
| 93 | organisations | Si personne physique : organisations auxquelles ce tiers app | Non |  | liste |  | Tiers |
| 94 | commentaire | Commentaire libre (ex : "clé cave", "badge parking B2") | Non |  | text |  | AccesLot |
| 95 | bailleur_id | Propriétaire du lot (Tiers — personne physique ou morale) | Oui |  | uuid FK | Obligatoire | Lot |
| 96 | compteur_id | Compteur physique du lot concerné par ce relevé (via Compteu | Oui |  | uuid FK |  | ReleveCompteur |
| 97 | numero_prm | Identifiant officiel du compteur physique. PRM (Point de Liv | Non |  | string |  | CompteurLot |
| 98 | inventaire_entree_id | Inventaire d'entrée lié — utilisé pour les comparatifs lors  | Non |  | uuid FK | et si un autre lot est créé pour le meme lot  possibilité de | EDL_Inventaire |
| 99 | lots | Lots rattachés à ce bâtiment (via Lot.batiment_id) | Non |  | liste | Obligatoire ?

Rep Tony : pourquoi le rendre obligatoire ? O | Batiment |
| 100 | avec_inventaire | Un inventaire mobilier est-il à réaliser lors de cette missi | Oui |  | bool |  | Mission |
| 101 | workspaces | Workspaces auxquels appartient cet utilisateur, avec son rôl | Non |  | liste |  | Utilisateur |
| 102 | utilisateurs | Utilisateurs ayant accès à ce workspace (via WorkspaceUser) | Non |  | liste |  | Workspace |
| 103 | num_parking | Numéro de place de parking associée au lot | Non |  | string |  | Lot |
| 104 | adresses | Adresses associées au bâtiment — principale + secondaires év | Oui |  | liste |  | Batiment |
| 105 | dpe_classe | Étiquette DPE — consommation énergétique | Non | A \| B \| C \| D \| E \| F \| G | enum |  | Lot |
| 106 | presence_locataire | Le locataire était-il présent ou représenté lors de l'EDL ? | Non |  | bool | Pourquoi? | EDL_Inventaire |
| 107 | locataire | Locataire présent lors de l'EDL — nom, coordonnées, procurat | Non |  | liste |  | EDL_Inventaire |
| 108 | bailleur | Propriétaire du lot — nom, coordonnées (via Tiers) | Oui |  | liste | Obligatoire | Lot |
| 109 | statut | Statut du compte utilisateur | Oui | pending \| actif \| suspendu \| desactive | enum |  | Utilisateur |
| 110 | technicien_assigne | Technicien assigné — nom, prénom, contact (via Utilisateur) | Oui |  | liste |  | Mission |
| 111 | type | Type d'accès | Oui | cle \| badge \| telecommande \| digicode \| autre | enum |  | AccesLot |
| 112 | locataire_id | Locataire présent lors de l'EDL (Tiers) | Non |  | uuid FK |  | EDL_Inventaire |
| 113 | commentaire_general | Observation générale sur l'EDL, distincte des commentaires p | Non |  | text |  | EDL_Inventaire |
| 114 | id | Clé primaire | Oui |  | uuid |  | CompteurLot |
| 115 | edl_id | EDL auquel sont rattachés ces accès | Oui |  | uuid FK |  | AccesLot |
| 116 | emplacement | Localisation physique du compteur (ex : sous-sol, cuisine, h | Non |  | string |  | CompteurLot |
| 117 | technicien_assigne_id | Technicien assigné à la mission (Utilisateur) | Oui |  | uuid FK |  | Mission |
| 118 | num_cave | Numéro de cave associé au lot | Non |  | string | rajouter en plus une pièce annexe | Lot |
| 119 | locataire_representant_id | Représentant du locataire si absent — lien vers Tiers | Non |  | uuid FK |  | EDL_Inventaire |
| 120 | reference_interne | Référence interne du lot (ex : APT-042) | Non |  | string | Prévoir de pouvoir mettre à jour cette référence manuellemen | Lot |
| 121 | releves_compteurs | Relevés de compteurs effectués lors de l'EDL (via ReleveComp | Non |  | liste |  | EDL_Inventaire |
| 122 | notes | Notes internes libres (contexte, historique relationnel) | Non |  | text |  | Tiers |
| 123 | photo | Photo de l'accès (ex : photo du trousseau) | Non |  | url |  | AccesLot |
| 124 | photo_compteur | Photo PRM du compteur | Non |  | url |  | ReleveCompteur |
| 125 | statut | Statut du workspace | Oui | actif \| suspendu \| trial | enum |  | Workspace |
| 126 | date_naissance | Date de naissance (personne physique) — parfois requis pour  | Non |  | date |  | Tiers |
| 127 | presence_bailleur | Le bailleur était-il présent ou représenté lors de l'EDL ? | Oui |  | bool | Nécessaire ?  | EDL_Inventaire |
| 128 | compteurs | Compteurs physiques associés au lot — pré-remplis automatiqu | Non |  | liste |  | Lot |
| 129 | edl_id | EDL auquel appartient ce relevé | Oui |  | uuid FK |  | ReleveCompteur |
| 130 | locataire_representant | Représentant du locataire (procuration) — nom, coordonnées ( | Non |  | liste |  | EDL_Inventaire |
| 131 | commentaire | Commentaire libre sur ce compteur | Non |  | text |  | ReleveCompteur |
| 132 | commentaire | Commentaire permanent sur ce compteur (accès, particularité, | Non |  | text |  | CompteurLot |
| 133 | bailleur_representant | Représentant du bailleur (procuration) — nom, coordonnées (v | Non |  | liste |  | EDL_Inventaire |
| 134 | quantite | Nombre d'exemplaires remis | Oui |  | int |  | AccesLot |
| 135 | id | Clé primaire | Oui |  | uuid |  | ReleveCompteur |
| 136 | sens | Sens de la mission | Oui | entree \| sortie | enum | type d’état des lieux | Mission |
| 137 | membres | Si personne morale : contacts membres de cette organisation  | Non |  | liste |  | Tiers |
| 138 | lot_id | Lot auquel appartient ce compteur | Oui |  | uuid FK |  | CompteurLot |
| 139 | bailleur_representant_id | Représentant du bailleur si absent — lien vers Tiers | Non |  | uuid FK |  | EDL_Inventaire |
| 140 | nb_pieces_precision | Précision du nombre de pièces si nb_pieces = "autre" (ex : T | Non |  | string |  | Lot |
| 141 | etage_precision | Précision de l'étage si etage = "autre" (ex : 30, Niveau -2, | Non |  | string |  | Lot |
| 142 | photo_PRM | Photo PRM du compteur - propre à l’électrique | Non |  | url |  | ReleveCompteur |
| 143 | inaccessible | Coché si le compteur est introuvable ou inaccessible lors de | Non |  | bool |  | ReleveCompteur |
| 144 | future_adresse_locataire | Adresse du locataire après son départ. Renseignée uniquement | Non |  | string |  | EDL_Inventaire |
| 145 | libelle | Libellé de la valeur relevée. Pour type_contrat = base : 'Ba | Oui |  | string |  | ValeurReleveCompteur |
| 146 | valeur | Valeur numérique lue sur le cadran du compteur. L'unité (kWh | Non |  | float |  | ValeurReleveCompteur |
| 147 | releve_id | Relevé compteur parent (FK → ReleveCompteur). Toutes les val | Oui |  | uuid FK |  | ValeurReleveCompteur |
| 148 | taille_octets | Taille du fichier en octets — utile pour l'optimisation PDF  | Non |  | int |  | Photo |
| 149 | signature_bailleur_url | URL de la signature électronique du bailleur ou de son repré | Non |  | url |  | EDL_Inventaire |
| 150 | photo | Photo du cadran au moment du relevé, associée à cette valeur | Non |  | url |  | ValeurReleveCompteur |
| 151 | type_contrat | Type de contrat électrique du locataire au moment de l'EDL.  | Non | base \| hp_hc \| personnalise | enum |  | ReleveCompteur |
| 152 | workspace_id | Référence directe au workspace — dérivé de lot_id → batiment | Oui |  | uuid FK |  | EDL_Inventaire |
| 153 | ordre | Ordre d'affichage dans la galerie de l'élément. | Non |  | int |  | Photo |
| 154 | attestation_assurance | Attestation d'assurance habitation fournie par le locataire. | Non |  | bool |  | EDL_Inventaire |
| 155 | numero_serie | Numéro de série physique gravé sur le compteur. Utilisé pour | Non |  | string |  | CompteurLot |
| 156 | statut_assignation | Statut du workflow d'assignation au technicien. Distinct du  | Non | non_assignee \| proposee \| acceptee \| refusee | enum |  | Mission |
| 157 | code_acces | Code d'accès au logement ou à l'immeuble au moment de l'EDL  | Non |  | string |  | EDL_Inventaire |
| 158 | signature_locataire_url | URL de la signature électronique du locataire (image PNG gén | Non |  | url |  | EDL_Inventaire |
| 159 | motif_infructueux | Motif de non-finalisation du document. Visible et obligatoir | Non |  | string |  | EDL_Inventaire |
| 160 | url | URL de stockage S3 de la photo. | Oui |  | url |  | Photo |
| 161 | edl_id | EDL ou Inventaire auquel appartient cette photo. | Oui |  | uuid FK |  | Photo |
| 162 | id | Identifiant unique de la valeur relevée. | Oui |  | uuid |  | ValeurReleveCompteur |
| 163 | id | Identifiant unique de la photo. | Oui |  | uuid | ⚠️ Table anticipée V2 (EPIC 7) — non implémentée en V1. La V | Photo |
| 164 | observations_locataire | Observations libres formulées par le locataire lors de la 4e | Non |  | text |  | EDL_Inventaire |
| 165 | entity_type | Type d'entité à laquelle la photo est rattachée. Permet une  | Oui | item \| sous_item \| section \| piece \| compteur \| acces \ | enum |  | Photo |
| 166 | attestation_entretien_chaudiere | Attestation d'entretien de chaudière fournie par le locatair | Non |  | bool |  | EDL_Inventaire |
| 167 | consentement_locataire | Le locataire a coché la case « J'ai bien pris connaissance d | Non |  | bool |  | EDL_Inventaire |
| 168 | avenant_parent_id | Référence vers le document parent (EDL ou Inventaire) dont c | Non |  | uuid FK |  | EDL_Inventaire |
| 169 | entity_id | ID de l'entité concernée (item, sous-item, section, pièce, e | Oui |  | uuid FK |  | Photo |
| 170 | titre | Titre ou légende de la photo. Demandé par Flat Checker pour  | Non |  | string |  | Photo |
| 171 | etat_proprete | État général de propreté du logement au moment de l'EDL. Inf | Non | tres_propre \| propre \| correct \| sale \| tres_sale | enum |  | EDL_Inventaire |
| 172 | avenants | Liste des avenants rattachés à ce document (via avenant_pare | Non |  | liste |  | EDL_Inventaire |
| 173 | id | Clé primaire | Oui |  | uuid |  | ConfigCritereCategorie |
| 174 | verification_token | Hash unique du document signé, généré à la signature. Sert à | Non |  | string |  | EDL_Inventaire |
| 175 | statut_invitation | Statut de l'invitation du technicien : en_attente (défaut) \ | Non |  | enum |  | MissionTechnicien |
| 176 | id | Clé primaire | Oui |  | uuid |  | IndisponibiliteTechnicien |
| 177 | motif | Raison de l'indisponibilité (congé, formation, maladie…) | Non |  | string |  | IndisponibiliteTechnicien |
| 178 | page | Identifiant de la page/tableau concerné | Oui |  | string | Ex : missions_list, tiers_proprietaire, batiments | UserPreference |
| 179 | critere | Critère overridé | Oui | etat_general \| proprete \| photos \| caracteristiques \| co | enum |  | ConfigCritereItem |
| 180 | created_at | Date de création | Oui |  | datetime |  | UserPreference |
| 181 | contexte | Un item est soit EDL soit Inventaire, pas les deux | Oui | edl \| inventaire | enum |  | CatalogueItem |
| 182 | config | Configuration JSON (colonnes visibles, ordre, largeurs, filt | Oui |  | json |  | UserPreference |
| 183 | updated_at | Date de dernière modification | Oui |  | datetime |  | CatalogueItem |
| 184 | workspace_id | → Workspace. Null = valeur plateforme | Non |  | uuid FK |  | ValeurReferentiel |
| 185 | est_principal | Propriétaire principal du lot (1 seul par lot). Défaut: fals | Oui |  | bool |  | LotProprietaire |
| 186 | est_recurrent | Plage récurrente (type Google Agenda). Défaut: false | Oui |  | bool |  | IndisponibiliteTechnicien |
| 187 | degradations | Array de tags dégradations sélectionnés | Non |  | json | Ex : ["Rayure", "Tache"] | EvaluationItem |
| 188 | nb_photos_min | Nombre minimum de photos d'ensemble requis. Configurable par | Non |  | int |  | PieceEDL |
| 189 | couleur | Couleur constatée. String libre — valeurs prédéfinies dans V | Non |  | string |  | EvaluationItem |
| 190 | parent_item_id | → CatalogueItem (self-ref). Null = item racine. Non-null = s | Non |  | uuid FK |  | CatalogueItem |
| 191 | ordre_affichage | Tri dans l'UI (ASC) | Non |  | int |  | TemplatePieceItem |
| 192 | date_fin | Fin de la plage d'indisponibilité | Oui |  | datetime |  | IndisponibiliteTechnicien |
| 193 | observation | Commentaire libre du technicien sur cet item | Non |  | text |  | EvaluationItem |
| 194 | nom | Nom de l'item | Oui |  | string | Ex : Sol, Évier, Robinet, Lit, Téléviseur… | CatalogueItem |
| 195 | photos_ensemble | Array d'URLs/IDs de photos d'ensemble de la pièce. Essentiel | Non |  | json | Photos vue générale de la pièce (obligatoire à terme) | PieceEDL |
| 196 | quantite_defaut | Nombre d'instances à pré-créer. Défaut: 1 | Oui |  | int | Ex : Mur = 4, Fenêtre = 1, Prise = 2 | TemplatePieceItem |
| 197 | workspace_id | → Workspace. Null = template plateforme | Non |  | uuid FK |  | TemplatePieceItem |
| 198 | lot_id | → Lot | Oui |  | uuid FK |  | LotProprietaire |
| 199 | etat_general | État général constaté. Masqué auto si l'item a des sous-item | Non | neuf \| bon_etat \| etat_usage \| mauvais_etat \| degrade | enum |  | EvaluationItem |
| 200 | couleur | Niveau d'exigence pour la Couleur | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 201 | fonctionnement | Fonctionnement constaté. Non testé/Non testable déclenchent  | Non | fonctionne \| fonctionne_difficilement \| hors_service \| no | enum |  | EvaluationItem |
| 202 | ordre_affichage | Tri dans l'UI (ASC) | Non |  | int |  | TypePiece |
| 203 | role_locataire | Rôle du locataire dans l'EDL | Oui | entrant \| sortant | enum |  | EDLLocataire |
| 204 | updated_at | Date de dernière modification | Oui |  | datetime |  | EvaluationItem |
| 205 | parent_evaluation_id | → EvaluationItem (self-ref). Null = item racine. Non-null =  | Non |  | uuid FK |  | EvaluationItem |
| 206 | niveau | Niveau d'exigence override (différent du défaut catégorie) | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereItem |
| 207 | type_piece_id | → TypePiece | Oui |  | uuid FK |  | TemplatePieceItem |
| 208 | url_verification | Lien public vers la page de vérification d'authenticité du d | Non |  | url | Page publique : type de document, date, adresse + bouton tél | EDL_Inventaire |
| 209 | created_at | Date de création | Oui |  | datetime |  | EvaluationItem |
| 210 | categorie | Catégorie de l'item — utilisée pour le groupement visuel et  | Oui | revetements \| plomberie \| menuiseries_ext \| menuiseries_i | enum |  | CatalogueItem |
| 211 | source | Origine du type de pièce | Oui | plateforme \| workspace | enum |  | TypePiece |
| 212 | edl_id | → EDL_Inventaire | Oui |  | uuid FK |  | EDLLocataire |
| 213 | est_principal | Technicien principal de la mission. Généralement 1 seul tech | Oui |  | bool |  | MissionTechnicien |
| 214 | tiers_id | → Tiers (locataire). Supporte la colocation (plusieurs locat | Oui |  | uuid FK |  | EDLLocataire |
| 215 | valeur | Tag prédéfini | Oui |  | string | Ex : Parquet, Rayure, Blanc, Carrelage… | ValeurReferentiel |
| 216 | tiers_id | → Tiers (propriétaire). Supporte l'indivision (plusieurs pro | Oui |  | uuid FK |  | LotProprietaire |
| 217 | ordre | Ordre d'affichage de la pièce dans l'EDL | Oui |  | int |  | PieceEDL |
| 218 | created_at | Date de création | Oui |  | datetime |  | TypePiece |
| 219 | caracteristiques | Niveau d'exigence pour les Caractéristiques | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 220 | quantite | Quantité (inventaire uniquement). Comptage d'objets mobilier | Non |  | int |  | EvaluationItem |
| 221 | degradations | Niveau d'exigence pour les Dégradations | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 222 | user_id | → Utilisateur (technicien) | Oui |  | uuid FK |  | MissionTechnicien |
| 223 | est_archive | Soft delete. Défaut: false | Oui |  | bool |  | CatalogueItem |
| 224 | caracteristiques | Array de tags caractéristiques sélectionnés (issus de Valeur | Non |  | json | Ex : ["Parquet", "Chêne massif"] | EvaluationItem |
| 225 | workspace_id | → Workspace. Null = type plateforme (socle Flat Checker) | Non |  | uuid FK |  | TypePiece |
| 226 | fonctionnement | Niveau d'exigence pour le Fonctionnement | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 227 | mission_id | → Mission | Oui |  | uuid FK |  | MissionTechnicien |
| 228 | edl_id | → EDL_Inventaire. EDL concret contenant cette pièce | Oui |  | uuid FK |  | PieceEDL |
| 229 | nom_personnalise | Nom affiché dans l'EDL | Oui |  | string | Ex : Chambre 1, Cuisine, SDB parentale | PieceEDL |
| 230 | source | Origine de la valeur | Oui | plateforme \| workspace \| terrain | enum |  | ValeurReferentiel |
| 231 | id | Clé primaire | Oui |  | uuid |  | PieceEDL |
| 232 | workspace_id | → Workspace. Null = item plateforme (socle Flat Checker) | Non |  | uuid FK |  | CatalogueItem |
| 233 | created_at | Date de création | Oui |  | datetime |  | ConfigCritereItem |
| 234 | id | Clé primaire | Oui |  | uuid |  | TypePiece |
| 235 | label | Libellé personnalisé de l'instance, défini par le technicien | Non |  | string | Ex : Mur d'accès, Mur gauche, Fenêtre salon, Robinet cuisine | EvaluationItem |
| 236 | latitude | Latitude GPS (géocodage automatique à la création/modificati | Non |  | float |  | AdresseBatiment |
| 237 | user_id | → Utilisateur | Oui |  | uuid FK |  | UserPreference |
| 238 | categorie_piece | Catégorie regroupant les types de pièces dans l'UI | Oui | vie \| eau_sanitaires \| circulations \| exterieur_annexes \ | enum |  | TypePiece |
| 239 | critere | Critère concerné par cette valeur | Oui | caracteristiques \| degradations \| couleur | enum |  | ValeurReferentiel |
| 240 | commentaire | Note libre (clé manquante, ne fonctionne pas…) | Non |  | text |  | CleMission |
| 241 | etat_general | Niveau d'exigence pour l'État général sur cette catégorie | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 242 | catalogue_item_id | → CatalogueItem. Item pré-sélectionné dans ce type de pièce | Oui |  | uuid FK |  | TemplatePieceItem |
| 243 | workspace_id | → Workspace. Un jeu de config par workspace | Oui |  | uuid FK |  | ConfigCritereCategorie |
| 244 | longitude | Longitude GPS (géocodage automatique). Utilisé pour la vue c | Non |  | float |  | AdresseBatiment |
| 245 | updated_at | Date de dernière modification | Oui |  | datetime |  | TypePiece |
| 246 | workspace_id | → Workspace | Oui |  | uuid FK |  | ConfigCritereItem |
| 247 | id | Clé primaire | Oui |  | uuid |  | UserPreference |
| 248 | workspace_id | → Workspace | Oui |  | uuid FK |  | IndisponibiliteTechnicien |
| 249 | photos | Array d'URLs/IDs de photos liées à cet item. Association pho | Non |  | json |  | EvaluationItem |
| 250 | ordre | Ordre d'affichage dans la pièce | Oui |  | int |  | EvaluationItem |
| 251 | created_at | Date de création | Oui |  | datetime |  | IndisponibiliteTechnicien |
| 252 | categorie | Catégorie d'items concernée (même enum que CatalogueItem.cat | Oui | revetements \| plomberie \| menuiseries_ext \| menuiseries_i | enum |  | ConfigCritereCategorie |
| 253 | type_cle | Type de clé | Oui | cle_principale \| badge \| boite_aux_lettres \| parking \| c | enum | Ex : Clé principale, Badge parking, Boîte aux lettres | CleMission |
| 254 | created_at | Date de création | Oui |  | datetime |  | CleMission |
| 255 | id | Clé primaire | Oui |  | uuid |  | LotProprietaire |
| 256 | id | Clé primaire | Oui |  | uuid |  | ValeurReferentiel |
| 257 | mission_id | → Mission | Oui |  | uuid FK |  | CleMission |
| 258 | commentaire_piece | Commentaire global sur la pièce (pas d'état général par pièc | Non |  | text |  | PieceEDL |
| 259 | updated_at | Date de dernière modification | Oui |  | datetime |  | UserPreference |
| 260 | est_archive | Soft delete — masqué dans les listes mais conservé pour les  | Oui |  | bool |  | TypePiece |
| 261 | photos | Niveau d'exigence pour les Photos | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 262 | id | Clé primaire | Oui |  | uuid |  | EDLLocataire |
| 263 | aide_contextuelle | Tip ℹ️ affiché au technicien sur le terrain | Non |  | text | Ex : Vérifiez le débit chaud/froid, Prenez 2 photos | CatalogueItem |
| 264 | catalogue_item_id | → CatalogueItem. Item auquel ce tag est rattaché | Oui |  | uuid FK |  | ValeurReferentiel |
| 265 | catalogue_item_id | → CatalogueItem. Référence au catalogue pour hériter de la c | Oui |  | uuid FK |  | EvaluationItem |
| 266 | created_at | Date de création | Oui |  | datetime |  | CatalogueItem |
| 267 | nom | Nom du type de pièce | Oui |  | string | Ex : Cuisine, Chambre, Salle de bain, Cave, Garage… | TypePiece |
| 268 | statut_rdv | Statut du rendez-vous avec le locataire : a_confirmer \| con | Non |  | enum |  | Mission |
| 269 | couleur_primaire | Couleur primaire du branding workspace (hex). Utilisée pour  | Non |  | string |  | Workspace |
| 270 | created_at | Date de création | Oui |  | datetime |  | ValeurReferentiel |
| 271 | piece_edl_id | → PieceEDL. Pièce dans laquelle cet item est évalué | Oui |  | uuid FK |  | EvaluationItem |
| 272 | id | Clé primaire | Oui |  | uuid |  | MissionTechnicien |
| 273 | icon | Emoji ou nom d'icône (ex : 🍳, 🛏️, 🚿) | Non |  | string |  | TypePiece |
| 274 | date_debut | Début de la plage d'indisponibilité | Oui |  | datetime |  | IndisponibiliteTechnicien |
| 275 | logo_url | URL du logo personnalisé du workspace. Affiché sur les PDF,  | Non |  | url |  | Workspace |
| 276 | statut | Statut de la clé dans le workflow mission | Oui | a_recuperer \| recuperee \| a_deposer \| deposee | enum |  | CleMission |
| 277 | id | Clé primaire | Oui |  | uuid |  | EvaluationItem |
| 278 | proprete | Niveau d'exigence pour la Propreté | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 279 | created_at | Date de création | Oui |  | datetime |  | ConfigCritereCategorie |
| 280 | recurrence_config | Config récurrence (RRULE ou json). Null si non récurrent | Non |  | json |  | IndisponibiliteTechnicien |
| 281 | id | Clé primaire | Oui |  | uuid |  | CatalogueItem |
| 282 | source | Origine de l'item | Oui | plateforme \| workspace \| terrain | enum |  | CatalogueItem |
| 283 | type_piece_id | → TypePiece. Type de pièce du catalogue | Oui |  | uuid FK |  | PieceEDL |
| 284 | quantite | Niveau d'exigence pour la Quantité (inventaire) | Oui | masque \| optionnel \| recommande \| obligatoire | enum |  | ConfigCritereCategorie |
| 285 | id | Clé primaire | Oui |  | uuid |  | TemplatePieceItem |
| 286 | id | Clé primaire | Oui |  | uuid |  | ConfigCritereItem |
| 287 | updated_at | Date de dernière modification | Oui |  | datetime |  | ConfigCritereCategorie |
| 288 | proprete | Propreté constatée | Non | ras \| a_nettoyer | enum |  | EvaluationItem |
| 289 | ordre_affichage | Tri dans l'UI (ASC) | Non |  | int |  | CatalogueItem |
| 290 | updated_at | Date de dernière modification | Oui |  | datetime |  | PieceEDL |
| 291 | created_at | Date de création | Oui |  | datetime |  | PieceEDL |
| 292 | catalogue_item_id | → CatalogueItem. Item dont on override le niveau d'exigence | Oui |  | uuid FK |  | ConfigCritereItem |
| 293 | est_archive | Soft delete. Défaut: false | Oui |  | bool |  | ValeurReferentiel |
| 294 | user_id | → Utilisateur. Technicien concerné | Oui |  | uuid FK |  | IndisponibiliteTechnicien |
| 295 | id | Clé primaire | Oui |  | uuid |  | CleMission |
| 296 | deposee_at | Date/heure de confirmation du dépôt. Renseigné automatiqueme | Non |  | datetime |  | CleMission |
| 297 | commentaire | Description libre de la clé | Non |  | text | Ex : "Porte-clés bleu", "Badge abîmé" | CleMission |
| 298 | id | Clé primaire | Oui |  | uuid |  | CleMission |
| 299 | est_journee_entiere | Si true, l'indispo couvre la journée entière (composant hora | Oui |  | bool | Défaut : true (journée entière) | IndisponibiliteTechnicien |
| 300 | created_at | Date de création (saisie terrain) | Oui |  | datetime |  | CleMission |
| 301 | user_id | → Utilisateur (technicien concerné par l'indisponibilité) | Oui |  | uuid FK |  | IndisponibiliteTechnicien |
| 302 | quantite | Nombre de clés/badges de ce type récupérés. Défaut : 1 | Oui |  | int | Ex : 2 clés principales, 1 badge parking | CleMission |
| 303 | id | Clé primaire | Oui |  | uuid |  | IndisponibiliteTechnicien |
| 304 | lieu_depot | Lieu où les clés doivent être déposées (texte libre) | Non |  | text | Ex : "Agence Versailles", "Gardien Mme Dupont", "Boîte à clé | CleMission |
| 305 | statut | Statut de la clé. Entrée : remise (documentaire, pas de work | Oui | remise \| a_deposer \| deposee | enum | Entrée = remise au locataire (documentaire). Sortie = à dépo | CleMission |
| 306 | edl_id | FK → EDL_Inventaire. Chaque EDL trace ses propres clés (impo | Oui |  | uuid FK |  | CleMission |
| 307 | email | Email de contact du workspace. Affiché sur les documents PDF | Non |  | string |  | Workspace |
| 308 | adresse | Adresse postale du workspace (siège social). Remplie via aut | Non |  | string |  | Workspace |
| 309 | labels_defaut | Tableau de libellés prédéfinis pour les instances quand quan | Non |  | json | Labels par défaut murs validés client : Mur d'accès · Mur ga | TemplatePieceItem |
| 310 | code_postal | Code postal du workspace. | Non |  | string |  | Workspace |
| 311 | telephone | Téléphone de contact du workspace. Affiché sur les documents | Non |  | string |  | Workspace |
| 312 | ville | Ville du workspace. | Non |  | string |  | Workspace |
| 313 | siret | Numéro SIRET du workspace. Affiché sur les documents PDF (ch | Non |  | string |  | Workspace |

---

## Details par entree

### type

> [Notion](https://www.notion.so/type-3131d95b2f8a8102a7b6f6f2f2d023fc) | ID: `3131d95b-2f8a-8102-a7b6-f6f2f2d023fc`

- **Description** : Type d'adresse
- **Obligatoire** : Oui
- **Valeurs_enum** : principale | secondaire
- **Type** : enum
- **Table** : AdresseBatiment

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3131d95b2f8a810383cfd65144c2790a) | ID: `3131d95b-2f8a-8103-83cf-d65144c2790a`

- **Description** : Référence Workspace
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Batiment

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a8103aa75dd69cf4460a4) | ID: `3131d95b-2f8a-8103-aa75-dd69cf4460a4`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : AdresseBatiment

### heure_debut

> [Notion](https://www.notion.so/heure_debut-3131d95b2f8a81089e67dc44b8321f49) | ID: `3131d95b-2f8a-8108-9e67-dc44b8321f49`

- **Description** : Heure de début de la mission — importante notamment pour les EDL de sortie réalisés en présence du locataire (durée variable selon taille et complexité du bien).
- **Obligatoire** : Non
- **Type** : time
- **Table** : Mission

### representant_nom

> [Notion](https://www.notion.so/representant_nom-3131d95b2f8a8108ac68c205aafafade) | ID: `3131d95b-2f8a-8108-ac68-c205aafafade`

- **Description** : Nom du représentant (locataire avec procuration)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### eau_chaude_type

> [Notion](https://www.notion.so/eau_chaude_type-3131d95b2f8a810b887ddf4dbcde53fd) | ID: `3131d95b-2f8a-810b-887d-df4dbcde53fd`

- **Description** : Type d'eau chaude
- **Obligatoire** : Non
- **Valeurs_enum** : individuelle | collective | aucun | autre
- **Type** : enum
- **Table** : Lot

### etage

> [Notion](https://www.notion.so/etage-3131d95b2f8a810d84b9dcc2368e760f) | ID: `3131d95b-2f8a-810d-84b9-dcc2368e760f`

- **Description** : Étage du lot — si "autre", préciser dans etage_precision
- **Obligatoire** : Non
- **Valeurs_enum** : sous_sol | rez_de_jardin | rez_de_chaussee | entresol | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | autre
- **Type** : enum
- **Notes_client** : Enum ? case autre
- **Table** : Lot

### date_signature

> [Notion](https://www.notion.so/date_signature-3131d95b2f8a810dba96f9128c3ea6a4) | ID: `3131d95b-2f8a-810d-ba96-f9128c3ea6a4`

- **Description** : Date et heure de signature
- **Obligatoire** : Non
- **Type** : datetime
- **Table** : EDL_Inventaire

### rue

> [Notion](https://www.notion.so/rue-3131d95b2f8a8110ab03df17e97e7885) | ID: `3131d95b-2f8a-8110-ab03-df17e97e7885`

- **Description** : Numéro et nom de rue
- **Obligatoire** : Oui
- **Type** : string
- **Table** : AdresseBatiment

### auth_provider

> [Notion](https://www.notion.so/auth_provider-3131d95b2f8a8118b9cac4aab53a38db) | ID: `3131d95b-2f8a-8118-b9ca-c4aab53a38db`

- **Description** : Fournisseur d'authentification (email, Google…)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Utilisateur

### ordre

> [Notion](https://www.notion.so/ordre-3131d95b2f8a8119a8c4d74ba93c10fb) | ID: `3131d95b-2f8a-8119-a8c4-d74ba93c10fb`

- **Description** : Ordre d'affichage
- **Obligatoire** : Oui
- **Type** : int
- **Notes_client** : Je ne sais pas ce que c’est 
- **Table** : AdresseBatiment

### organisation_id

> [Notion](https://www.notion.so/organisation_id-3131d95b2f8a811a8015ff0e86daf18a) | ID: `3131d95b-2f8a-811a-8015-ff0e86daf18a`

- **Description** : Organisation (personne morale)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : TiersOrganisation

### type_bien

> [Notion](https://www.notion.so/type_bien-3131d95b2f8a811ab2a5cd353910c73f) | ID: `3131d95b-2f8a-811a-b2a5-cd353910c73f`

- **Description** : Type de bien
- **Obligatoire** : Oui
- **Valeurs_enum** : appartement | maison | box_parking | bureau | local_commercial | autre
- **Type** : enum
- **Table** : Lot

### num_batiment

> [Notion](https://www.notion.so/num_batiment-3131d95b2f8a811b874befb3e35d7b10) | ID: `3131d95b-2f8a-811b-874b-efb3e35d7b10`

- **Description** : Numéro de bâtiment (A, B, C…)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Batiment

### contact_mandataire_id

> [Notion](https://www.notion.so/contact_mandataire_id-3131d95b2f8a81268bf5ff908fc8ae15) | ID: `3131d95b-2f8a-8126-8bf5-ff908fc8ae15`

- **Description** : Contact opérationnel chez le mandataire
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### type

> [Notion](https://www.notion.so/type-3131d95b2f8a8132a58dc05c0fd869ad) | ID: `3131d95b-2f8a-8132-a58d-c05c0fd869ad`

- **Description** : Type de document. edl = état des lieux (toujours présent). inventaire = inventaire mobilier optionnel lié à l'EDL. avenant = document complémentaire post-signature rattaché à un EDL ou inventaire parent via avenant_parent_id.
- **Obligatoire** : Oui
- **Valeurs_enum** : edl | inventaire | avenant
- **Type** : enum
- **Table** : EDL_Inventaire

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a8133be5cd40f880318d6) | ID: `3131d95b-2f8a-8133-be5c-d40f880318d6`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : Mission

### fonction

> [Notion](https://www.notion.so/fonction-3131d95b2f8a813a978cd5193704461a) | ID: `3131d95b-2f8a-813a-978c-d5193704461a`

- **Description** : Fonction dans l'organisation
- **Obligatoire** : Non
- **Type** : string
- **Table** : TiersOrganisation

### signature_image

> [Notion](https://www.notion.so/signature_image-3131d95b2f8a813f9af8d41c99c048d1) | ID: `3131d95b-2f8a-813f-9af8-d41c99c048d1`

- **Description** : Image de signature manuscrite stockée
- **Obligatoire** : Non
- **Type** : blob
- **Table** : Utilisateur

### mission_id

> [Notion](https://www.notion.so/mission_id-3131d95b2f8a8143bbdaead45c79e7bf) | ID: `3131d95b-2f8a-8143-bbda-ead45c79e7bf`

- **Description** : Mission parente (optionnel)
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### batiment_id

> [Notion](https://www.notion.so/batiment_id-3131d95b2f8a8146a8f5e2a267f2615a) | ID: `3131d95b-2f8a-8146-a8f5-e2a267f2615a`

- **Description** : Référence Bâtiment
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : AdresseBatiment

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a814aa1bbecd5475d7567) | ID: `3131d95b-2f8a-814a-a1bb-ecd5475d7567`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : Batiment

### heure_fin

> [Notion](https://www.notion.so/heure_fin-3131d95b2f8a814d9c44db8e96064e5d) | ID: `3131d95b-2f8a-814d-9c44-db8e96064e5d`

- **Description** : Heure de fin prévisionnelle de la mission — permet de bloquer le créneau dans l'agenda du technicien et d'informer les parties prenantes de la durée estimée.
- **Obligatoire** : Non
- **Type** : time
- **Table** : Mission

### nb_pieces

> [Notion](https://www.notion.so/nb_pieces-3131d95b2f8a815089c7dae20936baed) | ID: `3131d95b-2f8a-8150-89c7-dae20936baed`

- **Description** : Nombre de pièces du lot — si "autre", préciser dans nb_pieces_precision
- **Obligatoire** : Oui
- **Valeurs_enum** : studio | T1 | T2 | T3 | T4 | T5 | T6 | autre
- **Type** : enum
- **Notes_client** : Obligatoire, enum avec case autre
- **Table** : Lot

### annee_construction

> [Notion](https://www.notion.so/annee_construction-3131d95b2f8a8151a3b4e7eddc2f41dd) | ID: `3131d95b-2f8a-8151-a3b4-e7eddc2f41dd`

- **Description** : Année de construction
- **Obligatoire** : Non
- **Type** : int
- **Table** : Batiment

### est_principal

> [Notion](https://www.notion.so/est_principal-3131d95b2f8a8153a32cc08abfd8fa48) | ID: `3131d95b-2f8a-8153-a32c-c08abfd8fa48`

- **Description** : Contact par défaut de l'organisation ?
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : TiersOrganisation

### technicien_id

> [Notion](https://www.notion.so/technicien_id-3131d95b2f8a81619a72f630eae7586f) | ID: `3131d95b-2f8a-8161-9a72-f630eae7586f`

- **Description** : Utilisateur ayant réalisé l'EDL
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### ⛔ logo [DOUBLON → logo_url]

> [Notion](https://www.notion.so/logo-DOUBLON-logo_url-3131d95b2f8a81629cd4c56138f16e76) | ID: `3131d95b-2f8a-8162-9cd4-c56138f16e76`

- **Description** : DOUBLON (23/03/2026) — Remplacé par logo_url. Utiliser logo_url.
- **Obligatoire** : Non
- **Type** : url
- **Table** : Workspace

### email

> [Notion](https://www.notion.so/email-3131d95b2f8a8162bc1bf2ae51bce4bb) | ID: `3131d95b-2f8a-8162-bc1b-f2ae51bce4bb`

- **Description** : Email (unique, sert à l'authentification)
- **Obligatoire** : Oui
- **Type** : string
- **Table** : Utilisateur

### lot_id

> [Notion](https://www.notion.so/lot_id-3131d95b2f8a8165a484df8e22c9dc04) | ID: `3131d95b-2f8a-8165-a484-df8e22c9dc04`

- **Description** : Lot concerné
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### nom

> [Notion](https://www.notion.so/nom-3131d95b2f8a8166bf1df4205f79e2d4) | ID: `3131d95b-2f8a-8166-bf1d-f4205f79e2d4`

- **Description** : Nom de famille (physique) ou nom du référent (morale)
- **Obligatoire** : Oui
- **Type** : string
- **Table** : Tiers

### ville

> [Notion](https://www.notion.so/ville-3131d95b2f8a8168ac93d48863e66d7c) | ID: `3131d95b-2f8a-8168-ac93-d48863e66d7c`

- **Description** : Ville
- **Obligatoire** : Oui
- **Type** : string
- **Table** : AdresseBatiment

### SIREN

> [Notion](https://www.notion.so/SIREN-3131d95b2f8a816aa34bd18602732b9d) | ID: `3131d95b-2f8a-816a-a34b-d18602732b9d`

- **Description** : Numéro SIREN (morale uniquement)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### type_workspace

> [Notion](https://www.notion.so/type_workspace-3131d95b2f8a816c87a2e139e82a7569) | ID: `3131d95b-2f8a-816c-87a2-e139e82a7569`

- **Description** : Type de workspace. Conditionne le workflow (simplifié pour bailleur, complet pour societe_edl) et l'affichage de certains onglets (Mandataire masqué pour agence).
- **Obligatoire** : Oui
- **Valeurs_enum** : societe_edl | bailleur | agence
- **Type** : enum
- **Table** : Workspace

### eau_chaude_mode

> [Notion](https://www.notion.so/eau_chaude_mode-3131d95b2f8a8171af6ae117d3a149cc) | ID: `3131d95b-2f8a-8171-af6a-e117d3a149cc`

- **Description** : Mode énergétique eau chaude
- **Obligatoire** : Non
- **Valeurs_enum** : gaz | electrique | autre
- **Type** : enum
- **Table** : Lot

### ville

> [Notion](https://www.notion.so/ville-3131d95b2f8a81749a63e6c5de298fb3) | ID: `3131d95b-2f8a-8174-9a63-e6c5de298fb3`

- **Description** : Ville
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a8177bdf3d19e22692e49) | ID: `3131d95b-2f8a-8177-bdf3-d19e22692e49`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : Workspace

### nom

> [Notion](https://www.notion.so/nom-3131d95b2f8a8179b750faaf4d294973) | ID: `3131d95b-2f8a-8179-b750-faaf4d294973`

- **Description** : Nom du workspace
- **Obligatoire** : Oui
- **Type** : string
- **Table** : Workspace

### web_url

> [Notion](https://www.notion.so/web_url-3131d95b2f8a817da718e0db178a0522) | ID: `3131d95b-2f8a-817d-a718-e0db178a0522`

- **Description** : URL de la version web lecture seule (lien persistant)
- **Obligatoire** : Non
- **Type** : url
- **Table** : EDL_Inventaire

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3131d95b2f8a817dbc5ef5ca8065088f) | ID: `3131d95b-2f8a-817d-bc5e-f5ca8065088f`

- **Description** : Référence Workspace
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Tiers

### statut

> [Notion](https://www.notion.so/statut-3131d95b2f8a8185855acec9af374a77) | ID: `3131d95b-2f8a-8185-855a-cec9af374a77`

- **Description** : Statut du cycle de vie de la mission. brouillon = créée mais non encore planifiée, planifiee = datée et assignée, terminee = EDL réalisé, annulee = mission annulée. À distinguer de statut_assignation qui gère le workflow technicien.
- **Obligatoire** : Oui
- **Valeurs_enum** : brouillon | planifiee | terminee | annulee
- **Type** : enum
- **Table** : Mission

### adresse

> [Notion](https://www.notion.so/adresse-3131d95b2f8a818695dbdc619e420106) | ID: `3131d95b-2f8a-8186-95db-dc619e420106`

- **Description** : Adresse postale
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### mandataire_id

> [Notion](https://www.notion.so/mandataire_id-3131d95b2f8a8188bbf7e606249688f2) | ID: `3131d95b-2f8a-8188-bbf7-e606249688f2`

- **Description** : Agence mandataire gestionnaire du lot (Tiers)
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : Lot

### tel

> [Notion](https://www.notion.so/tel-3131d95b2f8a81898fd7c3059389d3e8) | ID: `3131d95b-2f8a-8189-8fd7-c3059389d3e8`

- **Description** : Téléphone
- **Obligatoire** : Non
- **Type** : string
- **Table** : Utilisateur

### meuble

> [Notion](https://www.notion.so/meuble-3131d95b2f8a818991b6c17f88e43c05) | ID: `3131d95b-2f8a-8189-91b6-c17f88e43c05`

- **Description** : Le lot est-il meublé ?
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : Lot

### complement

> [Notion](https://www.notion.so/complement-3131d95b2f8a818bad79c3ffd518320f) | ID: `3131d95b-2f8a-818b-ad79-c3ffd518320f`

- **Description** : Complément d'adresse
- **Obligatoire** : Non
- **Type** : string
- **Table** : AdresseBatiment

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3131d95b2f8a81948035e188c5ad5fb2) | ID: `3131d95b-2f8a-8194-8035-e188c5ad5fb2`

- **Description** : Référence Workspace
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : WorkspaceUser

### code_postal

> [Notion](https://www.notion.so/code_postal-3131d95b2f8a81969dffeeb9be7e5016) | ID: `3131d95b-2f8a-8196-9dff-eeb9be7e5016`

- **Description** : Code postal
- **Obligatoire** : Oui
- **Type** : string
- **Table** : AdresseBatiment

### reference

> [Notion](https://www.notion.so/reference-3131d95b2f8a819782b1c0da8facb9d5) | ID: `3131d95b-2f8a-8197-82b1-c0da8facb9d5`

- **Description** : Référence auto-générée (ex : M-2026-0042)
- **Obligatoire** : Oui
- **Type** : string
- **Notes_client** : faire un libellé comme pour flat checker ex BOURI _280226_EDLE_Rapport_72 rue du Maréchal Foch_APV
- **Table** : Mission

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3131d95b2f8a8198bf77ea04a804cee9) | ID: `3131d95b-2f8a-8198-bf77-ea04a804cee9`

- **Description** : Référence Workspace
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Mission

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a819e823df63c12eace3d) | ID: `3131d95b-2f8a-819e-823d-f63c12eace3d`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : Utilisateur

### emplacement

> [Notion](https://www.notion.so/emplacement-3131d95b2f8a819e9cd1c9d0e28c0d29) | ID: `3131d95b-2f8a-819e-9cd1-c9d0e28c0d29`

- **Description** : Emplacement / description libre
- **Obligatoire** : Non
- **Type** : string
- **Table** : Lot

### role

> [Notion](https://www.notion.so/role-3131d95b2f8a81a5aa6dd3d791568b0c) | ID: `3131d95b-2f8a-81a5-aa6d-d3d791568b0c`

- **Description** : Rôle de l'utilisateur dans ce workspace
- **Obligatoire** : Oui
- **Valeurs_enum** : admin | gestionnaire | technicien
- **Type** : enum
- **Table** : WorkspaceUser

### lot_id

> [Notion](https://www.notion.so/lot_id-3131d95b2f8a81a5b8dfe34d8da14962) | ID: `3131d95b-2f8a-81a5-b8df-e34d8da14962`

- **Description** : Lot concerné
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Mission

### template_id

> [Notion](https://www.notion.so/template_id-3131d95b2f8a81adafedfb1cfa33f519) | ID: `3131d95b-2f8a-81ad-afed-fb1cfa33f519`

- **Description** : Template utilisé pour la saisie
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### surface

> [Notion](https://www.notion.so/surface-3131d95b2f8a81adb28ad7e6190bf96d) | ID: `3131d95b-2f8a-81ad-b28a-d7e6190bf96d`

- **Description** : Surface en m²
- **Obligatoire** : Non
- **Type** : float
- **Table** : Lot

### chauffage_mode

> [Notion](https://www.notion.so/chauffage_mode-3131d95b2f8a81aeb007d0f9f2953a92) | ID: `3131d95b-2f8a-81ae-b007-d0f9f2953a92`

- **Description** : Mode énergétique du chauffage
- **Obligatoire** : Non
- **Valeurs_enum** : gaz | electrique | fioul | autre
- **Type** : enum
- **Table** : Lot

### prenom

> [Notion](https://www.notion.so/prenom-3131d95b2f8a81b091cee310e0edb072) | ID: `3131d95b-2f8a-81b0-91ce-e310e0edb072`

- **Description** : Prénom (physique uniquement)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### date_realisation

> [Notion](https://www.notion.so/date_realisation-3131d95b2f8a81b09611da96ad5bcf0a) | ID: `3131d95b-2f8a-81b0-9611-da96ad5bcf0a`

- **Description** : Date et heure de réalisation effective
- **Obligatoire** : Non
- **Type** : datetime
- **Notes_client** : Les deux champs sont conservés : date_realisation = quand le technicien est sur place (peut précéder la signature). date_signature = quand les parties signent (parfois le même jour, parfois après). ❓ Question à valider : arrive-t-il qu'un EDL ne soit pas signé le jour même de la réalisation ? Si oui, quel est le délai habituel ?
- **Table** : EDL_Inventaire

### ⛔ plan_abonnement [SUPPRIMÉ]

> [Notion](https://www.notion.so/plan_abonnement-SUPPRIM-3131d95b2f8a81b78fe7f0d3dc43d8ac) | ID: `3131d95b-2f8a-81b7-8fe7-f0d3dc43d8ac`

- **Description** : SUPPRIMÉ (23/03/2026) — Pas de gestion des abonnements en V1.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### statut

> [Notion](https://www.notion.so/statut-3131d95b2f8a81b882bdc87aee5f36d7) | ID: `3131d95b-2f8a-81b8-82bd-c87aee5f36d7`

- **Description** : Statut du document EDL/Inventaire. brouillon = en cours de saisie, non signé. signe = document finalisé et signé électroniquement. infructueux = mission réalisée mais document non signé (refus, absence…) — préciser dans motif_infructueux.
- **Obligatoire** : Oui
- **Valeurs_enum** : brouillon | signe | infructueux
- **Type** : enum
- **Table** : EDL_Inventaire

### type

> [Notion](https://www.notion.so/type-3131d95b2f8a81b8ac28ff352f92b269) | ID: `3131d95b-2f8a-81b8-ac28-ff352f92b269`

- **Description** : Type de bâtiment
- **Obligatoire** : Oui
- **Valeurs_enum** : immeuble | maison | local_commercial | mixte | autre
- **Type** : enum
- **Table** : Batiment

### created_by

> [Notion](https://www.notion.so/created_by-3131d95b2f8a81bd9219cb7a3714a5d8) | ID: `3131d95b-2f8a-81bd-9219-cb7a3714a5d8`

- **Description** : Utilisateur ayant créé la mission
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Notes_client** : rajouter date et heure
- **Table** : Mission

### num_appartement

> [Notion](https://www.notion.so/num_appartement-3131d95b2f8a81be9dfbd9de5ee1cf19) | ID: `3131d95b-2f8a-81be-9dfb-d9de5ee1cf19`

- **Description** : Numéro du lot / appartement
- **Obligatoire** : Non
- **Type** : string
- **Table** : Lot

### batiment_id

> [Notion](https://www.notion.so/batiment_id-3131d95b2f8a81c38241e5b4894daf19) | ID: `3131d95b-2f8a-81c3-8241-e5b4894daf19`

- **Description** : Référence Bâtiment
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Lot

### date_planifiee

> [Notion](https://www.notion.so/date_planifiee-3131d95b2f8a81c58547e71549ac8551) | ID: `3131d95b-2f8a-81c5-8547-e71549ac8551`

- **Description** : Date prévue de l'intervention
- **Obligatoire** : Oui
- **Type** : date
- **Table** : Mission

### tel

> [Notion](https://www.notion.so/tel-3131d95b2f8a81c5b8dec9a3f1f7c1d2) | ID: `3131d95b-2f8a-81c5-b8de-c9a3f1f7c1d2`

- **Description** : Téléphone
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a81c7a293e4e6345637b1) | ID: `3131d95b-2f8a-81c7-a293-e4e6345637b1`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : EDL_Inventaire

### chauffage_type

> [Notion](https://www.notion.so/chauffage_type-3131d95b2f8a81cb9b33e7c344975ffe) | ID: `3131d95b-2f8a-81cb-9b33-e7c344975ffe`

- **Description** : Type de chauffage
- **Obligatoire** : Non
- **Valeurs_enum** : individuel | collectif | aucun
- **Type** : enum
- **Table** : Lot

### nom

> [Notion](https://www.notion.so/nom-3131d95b2f8a81d2b799e9995a747303) | ID: `3131d95b-2f8a-81d2-b799-e9995a747303`

- **Description** : Nom de famille
- **Obligatoire** : Oui
- **Type** : string
- **Table** : Utilisateur

### type_personne

> [Notion](https://www.notion.so/type_personne-3131d95b2f8a81d49572c03ff4024e98) | ID: `3131d95b-2f8a-81d4-9572-c03ff4024e98`

- **Description** : Type de personne
- **Obligatoire** : Oui
- **Valeurs_enum** : physique | morale
- **Type** : enum
- **Table** : Tiers

### pdf_url

> [Notion](https://www.notion.so/pdf_url-3131d95b2f8a81d4acd0d2812bbf9d50) | ID: `3131d95b-2f8a-81d4-acd0-d2812bbf9d50`

- **Description** : URL du PDF généré (après signature)
- **Obligatoire** : Non
- **Type** : url
- **Notes_client** : qr code ? 
- **Table** : EDL_Inventaire

### couleur_primaire

> [Notion](https://www.notion.so/couleur_primaire-3131d95b2f8a81d79aa9db55e7517c77) | ID: `3131d95b-2f8a-81d7-9aa9-db55e7517c77`

- **Description** : Couleur principale de l'interface et des PDF (hex, ex : #2563eb). Si non définie, couleur ImmoChecker par défaut.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### mandataire_id

> [Notion](https://www.notion.so/mandataire_id-3131d95b2f8a81d99c3ff7d28e5d0f05) | ID: `3131d95b-2f8a-81d9-9c3f-f7d28e5d0f05`

- **Description** : Agence mandataire (Tiers) présente lors de l'EDL
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### prenom

> [Notion](https://www.notion.so/prenom-3131d95b2f8a81dd87d0d31459b2efc8) | ID: `3131d95b-2f8a-81dd-87d0-d31459b2efc8`

- **Description** : Prénom
- **Obligatoire** : Oui
- **Type** : string
- **Table** : Utilisateur

### commentaire

> [Notion](https://www.notion.so/commentaire-3131d95b2f8a81e1831dc0d6fe9d316e) | ID: `3131d95b-2f8a-81e1-831d-c0d6fe9d316e`

- **Description** : Instructions terrain pour le technicien
- **Obligatoire** : Non
- **Type** : text
- **Table** : Mission

### tiers_id

> [Notion](https://www.notion.so/tiers_id-3131d95b2f8a81e68e40daf19fed85f2) | ID: `3131d95b-2f8a-81e6-8e40-daf19fed85f2`

- **Description** : Personne physique
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : TiersOrganisation

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a81e68fd7c4cdfb04d9fa) | ID: `3131d95b-2f8a-81e6-8fd7-c4cdfb04d9fa`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : Tiers

### sous_type

> [Notion](https://www.notion.so/sous_type-3131d95b2f8a81e6905ce5697b202581) | ID: `3131d95b-2f8a-81e6-905c-e5697b202581`

- **Description** : Sens de l'EDL
- **Obligatoire** : Oui
- **Valeurs_enum** : entree | sortie
- **Type** : enum
- **Table** : EDL_Inventaire

### user_id

> [Notion](https://www.notion.so/user_id-3131d95b2f8a81ee845ed192ddca6209) | ID: `3131d95b-2f8a-81ee-845e-d192ddca6209`

- **Description** : Référence Utilisateur
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : WorkspaceUser

### id

> [Notion](https://www.notion.so/id-3131d95b2f8a81ee8f98e66542bfb6eb) | ID: `3131d95b-2f8a-81ee-8f98-e66542bfb6eb`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : Lot

### edl_entree_id

> [Notion](https://www.notion.so/edl_entree_id-3131d95b2f8a81eea4a3d3a9b007f95a) | ID: `3131d95b-2f8a-81ee-a4a3-d3a9b007f95a`

- **Description** : EDL d'entrée lié (comparatifs sortie)
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### raison_sociale

> [Notion](https://www.notion.so/raison_sociale-3131d95b2f8a81f09a17d0e08e0482b2) | ID: `3131d95b-2f8a-81f0-9a17-d0e08e0482b2`

- **Description** : Raison sociale (morale uniquement)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### email

> [Notion](https://www.notion.so/email-3131d95b2f8a81f99fb2fb42d8dbc2da) | ID: `3131d95b-2f8a-81f9-9fb2-fb42d8dbc2da`

- **Description** : Email
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### code_postal

> [Notion](https://www.notion.so/code_postal-3131d95b2f8a81fbb931db4e63e98257) | ID: `3131d95b-2f8a-81fb-b931-db4e63e98257`

- **Description** : Code postal
- **Obligatoire** : Non
- **Type** : string
- **Table** : Tiers

### note

> [Notion](https://www.notion.so/note-3141d95b2f8a805fb51ef085203191d4) | ID: `3141d95b-2f8a-805f-b51e-f085203191d4`

- **Description** : Note concernant le bâtiment
- **Obligatoire** : Non
- **Type** : string
- **Table** : Batiment

### id

> [Notion](https://www.notion.so/id-3141d95b2f8a81048a11fca358fd215f) | ID: `3141d95b-2f8a-8104-8a11-fca358fd215f`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Notes_client** : on peut renommer la DB en remises de clefs ? 
- **Table** : AccesLot

### reference_interne

> [Notion](https://www.notion.so/reference_interne-3141d95b2f8a8123b048d076f08da4db) | ID: `3141d95b-2f8a-8123-b048-d076f08da4db`

- **Description** : Référence interne du bâtiment (ex : BAT-042)
- **Obligatoire** : Non
- **Type** : string
- **Notes_client** : Prévoir de pouvoir mettre à jour cette référence manuellement si besoin de mettre la référence d’un système tiers
- **Table** : Batiment

### photo_reference

> [Notion](https://www.notion.so/photo_reference-3141d95b2f8a812e9e3ec52148219b81) | ID: `3141d95b-2f8a-812e-9e3e-c52148219b81`

- **Description** : Photo de référence du compteur — prise une fois à la création
- **Obligatoire** : Non
- **Type** : url
- **Notes_client** : pas compris
Tony : sert à avoir une photo de référence du compteur pour le prochain état des lieux pour le trouver plus facilement si besoin 
- **Table** : CompteurLot

### type

> [Notion](https://www.notion.so/type-3141d95b2f8a812f8fead9843b412af9) | ID: `3141d95b-2f8a-812f-8fea-d9843b412af9`

- **Description** : Type de fluide / énergie du compteur
- **Obligatoire** : Oui
- **Valeurs_enum** : eau_froide | eau_chaude | electricite | gaz | chauffage_collectif | autre
- **Type** : enum
- **Notes_client** : compteur chauffage global (principalement dans les immeuble neuf
- **Table** : CompteurLot

### acces

> [Notion](https://www.notion.so/acces-3141d95b2f8a812fa976d9b6b19b7070) | ID: `3141d95b-2f8a-812f-a976-d9b6b19b7070`

- **Description** : Clés, badges, télécommandes remis lors de l'EDL (via AccesLot)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : EDL_Inventaire

### ges_classe

> [Notion](https://www.notion.so/ges_classe-3141d95b2f8a8139ae94dc1819a0797d) | ID: `3141d95b-2f8a-8139-ae94-dc1819a0797d`

- **Description** : Étiquette GES — émissions de gaz à effet de serre
- **Obligatoire** : Non
- **Valeurs_enum** : A | B | C | D | E | F | G
- **Type** : enum
- **Table** : Lot

### organisations

> [Notion](https://www.notion.so/organisations-3141d95b2f8a813f86b1df2e9516d400) | ID: `3141d95b-2f8a-813f-86b1-df2e9516d400`

- **Description** : Si personne physique : organisations auxquelles ce tiers appartient (via TiersOrganisation)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : Tiers

### commentaire

> [Notion](https://www.notion.so/commentaire-3141d95b2f8a814188bbe60f4db99963) | ID: `3141d95b-2f8a-8141-88bb-e60f4db99963`

- **Description** : Commentaire libre (ex : "clé cave", "badge parking B2")
- **Obligatoire** : Non
- **Type** : text
- **Table** : AccesLot

### bailleur_id

> [Notion](https://www.notion.so/bailleur_id-3141d95b2f8a8145930cc02fa81c5045) | ID: `3141d95b-2f8a-8145-930c-c02fa81c5045`

- **Description** : Propriétaire du lot (Tiers — personne physique ou morale)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Notes_client** : Obligatoire
- **Table** : Lot

### compteur_id

> [Notion](https://www.notion.so/compteur_id-3141d95b2f8a81568c7ccd4813ca3c05) | ID: `3141d95b-2f8a-8156-8c7c-cd4813ca3c05`

- **Description** : Compteur physique du lot concerné par ce relevé (via CompteurLot — type, numéro et emplacement pré-remplis)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : ReleveCompteur

### numero_prm

> [Notion](https://www.notion.so/numero_prm-3141d95b2f8a81579f31f4a988521523) | ID: `3141d95b-2f8a-8157-9f31-f4a988521523`

- **Description** : Identifiant officiel du compteur physique. PRM (Point de Livraison) uniquement pour les compteurs électriques/Linky. Pour les autres types (eau, gaz, chauffage collectif), utiliser le champ numero_serie. Ce champ peut ne pas être présent sur tous les compteurs électriques anciens.
- **Obligatoire** : Non
- **Type** : string
- **Table** : CompteurLot

### inventaire_entree_id

> [Notion](https://www.notion.so/inventaire_entree_id-3141d95b2f8a815da875d7c63249b54f) | ID: `3141d95b-2f8a-815d-a875-d7c63249b54f`

- **Description** : Inventaire d'entrée lié — utilisé pour les comparatifs lors d'un inventaire de sortie (miroir de edl_entree_id pour les inventaires)
- **Obligatoire** : Non
- **Type** : uuid FK
- **Notes_client** : et si un autre lot est créé pour le meme lot  possibilité de faire le comparatif ?
- **Table** : EDL_Inventaire

### lots

> [Notion](https://www.notion.so/lots-3141d95b2f8a815f9d9aca98464cdd43) | ID: `3141d95b-2f8a-815f-9d9a-ca98464cdd43`

- **Description** : Lots rattachés à ce bâtiment (via Lot.batiment_id)
- **Obligatoire** : Non
- **Type** : liste
- **Notes_client** : Obligatoire ?

Rep Tony : pourquoi le rendre obligatoire ? On ne pourrait pas créer directement un bâtiment depuis l’interface et cela devrait forcément passer par la création d’une mission ou d’un document ? 
- **Table** : Batiment

### avec_inventaire

> [Notion](https://www.notion.so/avec_inventaire-3141d95b2f8a8161be5ed28a602914be) | ID: `3141d95b-2f8a-8161-be5e-d28a602914be`

- **Description** : Un inventaire mobilier est-il à réaliser lors de cette mission ? Si oui, un document Inventaire sera créé en plus de l'EDL, avec les données parties prenantes pré-remplies depuis l'EDL.
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : Mission

### workspaces

> [Notion](https://www.notion.so/workspaces-3141d95b2f8a816391e6c42a3c8dfe9e) | ID: `3141d95b-2f8a-8163-91e6-c42a3c8dfe9e`

- **Description** : Workspaces auxquels appartient cet utilisateur, avec son rôle dans chacun (via WorkspaceUser)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : Utilisateur

### utilisateurs

> [Notion](https://www.notion.so/utilisateurs-3141d95b2f8a8166a2bfe36cab6ff715) | ID: `3141d95b-2f8a-8166-a2bf-e36cab6ff715`

- **Description** : Utilisateurs ayant accès à ce workspace (via WorkspaceUser)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : Workspace

### num_parking

> [Notion](https://www.notion.so/num_parking-3141d95b2f8a816984b9c27257518ad6) | ID: `3141d95b-2f8a-8169-84b9-c27257518ad6`

- **Description** : Numéro de place de parking associée au lot
- **Obligatoire** : Non
- **Type** : string
- **Table** : Lot

### adresses

> [Notion](https://www.notion.so/adresses-3141d95b2f8a816988b4e41b0bbed728) | ID: `3141d95b-2f8a-8169-88b4-e41b0bbed728`

- **Description** : Adresses associées au bâtiment — principale + secondaires éventuelles (via AdresseBatiment)
- **Obligatoire** : Oui
- **Type** : liste
- **Table** : Batiment

### dpe_classe

> [Notion](https://www.notion.so/dpe_classe-3141d95b2f8a816ebcb1f60c676a51c9) | ID: `3141d95b-2f8a-816e-bcb1-f60c676a51c9`

- **Description** : Étiquette DPE — consommation énergétique
- **Obligatoire** : Non
- **Valeurs_enum** : A | B | C | D | E | F | G
- **Type** : enum
- **Table** : Lot

### presence_locataire

> [Notion](https://www.notion.so/presence_locataire-3141d95b2f8a8170b0d5c8a3bce5c67a) | ID: `3141d95b-2f8a-8170-b0d5-c8a3bce5c67a`

- **Description** : Le locataire était-il présent ou représenté lors de l'EDL ?
- **Obligatoire** : Non
- **Type** : bool
- **Notes_client** : Pourquoi?
- **Table** : EDL_Inventaire

### locataire

> [Notion](https://www.notion.so/locataire-3141d95b2f8a8171b40debe119a38444) | ID: `3141d95b-2f8a-8171-b40d-ebe119a38444`

- **Description** : Locataire présent lors de l'EDL — nom, coordonnées, procuration éventuelle (via Tiers)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : EDL_Inventaire

### bailleur

> [Notion](https://www.notion.so/bailleur-3141d95b2f8a8172ab7bd7fed3c97efa) | ID: `3141d95b-2f8a-8172-ab7b-d7fed3c97efa`

- **Description** : Propriétaire du lot — nom, coordonnées (via Tiers)
- **Obligatoire** : Oui
- **Type** : liste
- **Notes_client** : Obligatoire
- **Table** : Lot

### statut

> [Notion](https://www.notion.so/statut-3141d95b2f8a81779fc3ec322f2541fe) | ID: `3141d95b-2f8a-8177-9fc3-ec322f2541fe`

- **Description** : Statut du compte utilisateur
- **Obligatoire** : Oui
- **Valeurs_enum** : pending | actif | suspendu | desactive
- **Type** : enum
- **Table** : Utilisateur

### technicien_assigne

> [Notion](https://www.notion.so/technicien_assigne-3141d95b2f8a817b9d24cb1902be6e44) | ID: `3141d95b-2f8a-817b-9d24-cb1902be6e44`

- **Description** : Technicien assigné — nom, prénom, contact (via Utilisateur)
- **Obligatoire** : Oui
- **Type** : liste
- **Table** : Mission

### type

> [Notion](https://www.notion.so/type-3141d95b2f8a817bbb42da43b9b0dfe7) | ID: `3141d95b-2f8a-817b-bb42-da43b9b0dfe7`

- **Description** : Type d'accès
- **Obligatoire** : Oui
- **Valeurs_enum** : cle | badge | telecommande | digicode | autre
- **Type** : enum
- **Table** : AccesLot

### locataire_id

> [Notion](https://www.notion.so/locataire_id-3141d95b2f8a8188b4bee267ab479c10) | ID: `3141d95b-2f8a-8188-b4be-e267ab479c10`

- **Description** : Locataire présent lors de l'EDL (Tiers)
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### commentaire_general

> [Notion](https://www.notion.so/commentaire_general-3141d95b2f8a8189908ec318bb9ec0e4) | ID: `3141d95b-2f8a-8189-908e-c318bb9ec0e4`

- **Description** : Observation générale sur l'EDL, distincte des commentaires par pièce
- **Obligatoire** : Non
- **Type** : text
- **Table** : EDL_Inventaire

### id

> [Notion](https://www.notion.so/id-3141d95b2f8a818c9e04f6dbbe7b66a7) | ID: `3141d95b-2f8a-818c-9e04-f6dbbe7b66a7`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : CompteurLot

### edl_id

> [Notion](https://www.notion.so/edl_id-3141d95b2f8a818ca46cc7478eed7308) | ID: `3141d95b-2f8a-818c-a46c-c7478eed7308`

- **Description** : EDL auquel sont rattachés ces accès
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : AccesLot

### emplacement

> [Notion](https://www.notion.so/emplacement-3141d95b2f8a818eac76fb1925003dbd) | ID: `3141d95b-2f8a-818e-ac76-fb1925003dbd`

- **Description** : Localisation physique du compteur (ex : sous-sol, cuisine, hall d'entrée)
- **Obligatoire** : Non
- **Type** : string
- **Table** : CompteurLot

### technicien_assigne_id

> [Notion](https://www.notion.so/technicien_assigne_id-3141d95b2f8a819a8c12ce88a052275a) | ID: `3141d95b-2f8a-819a-8c12-ce88a052275a`

- **Description** : Technicien assigné à la mission (Utilisateur)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Mission

### num_cave

> [Notion](https://www.notion.so/num_cave-3141d95b2f8a819e8de9d275793d59fc) | ID: `3141d95b-2f8a-819e-8de9-d275793d59fc`

- **Description** : Numéro de cave associé au lot
- **Obligatoire** : Non
- **Type** : string
- **Notes_client** : rajouter en plus une pièce annexe
- **Table** : Lot

### locataire_representant_id

> [Notion](https://www.notion.so/locataire_representant_id-3141d95b2f8a81a380f8c34647a6b9f4) | ID: `3141d95b-2f8a-81a3-80f8-c34647a6b9f4`

- **Description** : Représentant du locataire si absent — lien vers Tiers
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### reference_interne

> [Notion](https://www.notion.so/reference_interne-3141d95b2f8a81a6b392e1cd3f2660f3) | ID: `3141d95b-2f8a-81a6-b392-e1cd3f2660f3`

- **Description** : Référence interne du lot (ex : APT-042)
- **Obligatoire** : Non
- **Type** : string
- **Notes_client** : Prévoir de pouvoir mettre à jour cette référence manuellement si besoin de mettre la référence d’un système tiers
- **Table** : Lot

### releves_compteurs

> [Notion](https://www.notion.so/releves_compteurs-3141d95b2f8a81a79621da2532ad143e) | ID: `3141d95b-2f8a-81a7-9621-da2532ad143e`

- **Description** : Relevés de compteurs effectués lors de l'EDL (via ReleveCompteur)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : EDL_Inventaire

### notes

> [Notion](https://www.notion.so/notes-3141d95b2f8a81afbc86fbb79b4a8c81) | ID: `3141d95b-2f8a-81af-bc86-fbb79b4a8c81`

- **Description** : Notes internes libres (contexte, historique relationnel)
- **Obligatoire** : Non
- **Type** : text
- **Table** : Tiers

### photo

> [Notion](https://www.notion.so/photo-3141d95b2f8a81b2a5fbc93e21e7219a) | ID: `3141d95b-2f8a-81b2-a5fb-c93e21e7219a`

- **Description** : Photo de l'accès (ex : photo du trousseau)
- **Obligatoire** : Non
- **Type** : url
- **Table** : AccesLot

### photo_compteur

> [Notion](https://www.notion.so/photo_compteur-3141d95b2f8a81b5844eef86265c1e43) | ID: `3141d95b-2f8a-81b5-844e-ef86265c1e43`

- **Description** : Photo PRM du compteur
- **Obligatoire** : Non
- **Type** : url
- **Table** : ReleveCompteur

### statut

> [Notion](https://www.notion.so/statut-3141d95b2f8a81b6a2e5cfae0314c913) | ID: `3141d95b-2f8a-81b6-a2e5-cfae0314c913`

- **Description** : Statut du workspace
- **Obligatoire** : Oui
- **Valeurs_enum** : actif | suspendu | trial
- **Type** : enum
- **Table** : Workspace

### date_naissance

> [Notion](https://www.notion.so/date_naissance-3141d95b2f8a81b79ecdc2a35b38d4b0) | ID: `3141d95b-2f8a-81b7-9ecd-c2a35b38d4b0`

- **Description** : Date de naissance (personne physique) — parfois requis pour identification légale
- **Obligatoire** : Non
- **Type** : date
- **Table** : Tiers

### presence_bailleur

> [Notion](https://www.notion.so/presence_bailleur-3141d95b2f8a81c29a58fe9038842b86) | ID: `3141d95b-2f8a-81c2-9a58-fe9038842b86`

- **Description** : Le bailleur était-il présent ou représenté lors de l'EDL ?
- **Obligatoire** : Oui
- **Type** : bool
- **Notes_client** : Nécessaire ? 
- **Table** : EDL_Inventaire

### compteurs

> [Notion](https://www.notion.so/compteurs-3141d95b2f8a81c69f68ff01e527d34f) | ID: `3141d95b-2f8a-81c6-9f68-ff01e527d34f`

- **Description** : Compteurs physiques associés au lot — pré-remplis automatiquement dans les relevés à chaque EDL (via CompteurLot)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : Lot

### edl_id

> [Notion](https://www.notion.so/edl_id-3141d95b2f8a81c88bf2fcce24c4fbe2) | ID: `3141d95b-2f8a-81c8-8bf2-fcce24c4fbe2`

- **Description** : EDL auquel appartient ce relevé
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : ReleveCompteur

### locataire_representant

> [Notion](https://www.notion.so/locataire_representant-3141d95b2f8a81caae8ec7b834764a52) | ID: `3141d95b-2f8a-81ca-ae8e-c7b834764a52`

- **Description** : Représentant du locataire (procuration) — nom, coordonnées (via Tiers)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : EDL_Inventaire

### commentaire

> [Notion](https://www.notion.so/commentaire-3141d95b2f8a81cc92dde9326ed88fa1) | ID: `3141d95b-2f8a-81cc-92dd-e9326ed88fa1`

- **Description** : Commentaire libre sur ce compteur
- **Obligatoire** : Non
- **Type** : text
- **Table** : ReleveCompteur

### commentaire

> [Notion](https://www.notion.so/commentaire-3141d95b2f8a81d0a25acd645dddd3d8) | ID: `3141d95b-2f8a-81d0-a25a-cd645dddd3d8`

- **Description** : Commentaire permanent sur ce compteur (accès, particularité, etc.)
- **Obligatoire** : Non
- **Type** : text
- **Table** : CompteurLot

### bailleur_representant

> [Notion](https://www.notion.so/bailleur_representant-3141d95b2f8a81d4a41ceda55f5503f1) | ID: `3141d95b-2f8a-81d4-a41c-eda55f5503f1`

- **Description** : Représentant du bailleur (procuration) — nom, coordonnées (via Tiers)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : EDL_Inventaire

### quantite

> [Notion](https://www.notion.so/quantite-3141d95b2f8a81d5a0e4fc7e5e80b1b4) | ID: `3141d95b-2f8a-81d5-a0e4-fc7e5e80b1b4`

- **Description** : Nombre d'exemplaires remis
- **Obligatoire** : Oui
- **Type** : int
- **Table** : AccesLot

### id

> [Notion](https://www.notion.so/id-3141d95b2f8a81dea731c007f5ab43e2) | ID: `3141d95b-2f8a-81de-a731-c007f5ab43e2`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : ReleveCompteur

### sens

> [Notion](https://www.notion.so/sens-3141d95b2f8a81e2bf47e4af98888d63) | ID: `3141d95b-2f8a-81e2-bf47-e4af98888d63`

- **Description** : Sens de la mission
- **Obligatoire** : Oui
- **Valeurs_enum** : entree | sortie
- **Type** : enum
- **Notes_client** : type d’état des lieux
- **Table** : Mission

### membres

> [Notion](https://www.notion.so/membres-3141d95b2f8a81f2ba66efc6bc3b10b5) | ID: `3141d95b-2f8a-81f2-ba66-efc6bc3b10b5`

- **Description** : Si personne morale : contacts membres de cette organisation (via TiersOrganisation)
- **Obligatoire** : Non
- **Type** : liste
- **Table** : Tiers

### lot_id

> [Notion](https://www.notion.so/lot_id-3141d95b2f8a81f9ae2fc2a15e75c22b) | ID: `3141d95b-2f8a-81f9-ae2f-c2a15e75c22b`

- **Description** : Lot auquel appartient ce compteur
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : CompteurLot

### bailleur_representant_id

> [Notion](https://www.notion.so/bailleur_representant_id-3141d95b2f8a81feb3a2cc3222bc251f) | ID: `3141d95b-2f8a-81fe-b3a2-cc3222bc251f`

- **Description** : Représentant du bailleur si absent — lien vers Tiers
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### nb_pieces_precision

> [Notion](https://www.notion.so/nb_pieces_precision-3211d95b2f8a819a944fd5866ee27ed6) | ID: `3211d95b-2f8a-819a-944f-d5866ee27ed6`

- **Description** : Précision du nombre de pièces si nb_pieces = "autre" (ex : T8, 10 pièces)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Lot

### etage_precision

> [Notion](https://www.notion.so/etage_precision-3211d95b2f8a81ab9bb8c4f2e503a3c6) | ID: `3211d95b-2f8a-81ab-9bb8-c4f2e503a3c6`

- **Description** : Précision de l'étage si etage = "autre" (ex : 30, Niveau -2, Mezzanine)
- **Obligatoire** : Non
- **Type** : string
- **Table** : Lot

### photo_PRM

> [Notion](https://www.notion.so/photo_PRM-3221d95b2f8a8005846bd277da23b591) | ID: `3221d95b-2f8a-8005-846b-d277da23b591`

- **Description** : Photo PRM du compteur - propre à l’électrique
- **Obligatoire** : Non
- **Type** : url
- **Table** : ReleveCompteur

### inaccessible

> [Notion](https://www.notion.so/inaccessible-3221d95b2f8a816fb74efb7d0b5b2df0) | ID: `3221d95b-2f8a-816f-b74e-fb7d0b5b2df0`

- **Description** : Coché si le compteur est introuvable ou inaccessible lors de l'EDL (cave verrouillée, boîtier absent...). Permet de signaler sans bloquer la saisie. Affiché dans le rapport PDF.
- **Obligatoire** : Non
- **Type** : bool
- **Table** : ReleveCompteur

### future_adresse_locataire

> [Notion](https://www.notion.so/future_adresse_locataire-3231d95b2f8a81048b13c4c2db08ee0b) | ID: `3231d95b-2f8a-8104-8b13-c4c2db08ee0b`

- **Description** : Adresse du locataire après son départ. Renseignée uniquement sur les EDL de sortie (sous_type = sortie). Saisie assistée par autocomplete Google Places.
- **Obligatoire** : Non
- **Type** : string
- **Table** : EDL_Inventaire

### libelle

> [Notion](https://www.notion.so/libelle-3231d95b2f8a81058b01e760748d3aa4) | ID: `3231d95b-2f8a-8105-8b01-e760748d3aa4`

- **Description** : Libellé de la valeur relevée. Pour type_contrat = base : 'Base'. Pour hp_hc : 'HP' ou 'HC'. Pour personnalise : libellé libre saisi par le technicien (ex : 'HP Bleu', 'HC Blanc', 'Rouge HP').
- **Obligatoire** : Oui
- **Type** : string
- **Table** : ValeurReleveCompteur

### valeur

> [Notion](https://www.notion.so/valeur-3231d95b2f8a8108a864c68958db458b) | ID: `3231d95b-2f8a-8108-a864-c68958db458b`

- **Description** : Valeur numérique lue sur le cadran du compteur. L'unité (kWh ou m³) est dérivée du type du CompteurLot parent et affichée côté front sans être stockée.
- **Obligatoire** : Non
- **Type** : float
- **Table** : ValeurReleveCompteur

### releve_id

> [Notion](https://www.notion.so/releve_id-3231d95b2f8a810d9b54ccb9c2e2fa0a) | ID: `3231d95b-2f8a-810d-9b54-ccb9c2e2fa0a`

- **Description** : Relevé compteur parent (FK → ReleveCompteur). Toutes les valeurs d'un même relevé sont groupées par ce champ.
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : ValeurReleveCompteur

### taille_octets

> [Notion](https://www.notion.so/taille_octets-3231d95b2f8a811baeafd200332c5db6) | ID: `3231d95b-2f8a-811b-aeaf-d200332c5db6`

- **Description** : Taille du fichier en octets — utile pour l'optimisation PDF et le suivi du stockage S3.
- **Obligatoire** : Non
- **Type** : int
- **Table** : Photo

### signature_bailleur_url

> [Notion](https://www.notion.so/signature_bailleur_url-3231d95b2f8a8121bbfac2ac8e97401e) | ID: `3231d95b-2f8a-8121-bbfa-c2ac8e97401e`

- **Description** : URL de la signature électronique du bailleur ou de son représentant. Peut être absente si le bailleur n'était pas présent lors de l'EDL.
- **Obligatoire** : Non
- **Type** : url
- **Table** : EDL_Inventaire

### photo

> [Notion](https://www.notion.so/photo-3231d95b2f8a812bbed0fd0169592f72) | ID: `3231d95b-2f8a-812b-bed0-fd0169592f72`

- **Description** : Photo du cadran au moment du relevé, associée à cette valeur spécifique. Permet de prouver la valeur relevée et de différencier les photos HP vs HC sur un même compteur.
- **Obligatoire** : Non
- **Type** : url
- **Table** : ValeurReleveCompteur

### type_contrat

> [Notion](https://www.notion.so/type_contrat-3231d95b2f8a812fbac9ceec26abccb9) | ID: `3231d95b-2f8a-812f-bac9-ceec26abccb9`

- **Description** : Type de contrat électrique du locataire au moment de l'EDL. Détermine le nombre de valeurs à relever : base = 1 valeur, hp_hc = 2 valeurs (HP + HC), personnalise = N valeurs libres (contrats bleu/blanc/rouge, etc.) stockées dans ValeurReleveCompteur. Visible uniquement pour les compteurs de type electricite.
- **Obligatoire** : Non
- **Valeurs_enum** : base | hp_hc | personnalise
- **Type** : enum
- **Table** : ReleveCompteur

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3231d95b2f8a81399a5bc5fb93a679fe) | ID: `3231d95b-2f8a-8139-9a5b-c5fb93a679fe`

- **Description** : Référence directe au workspace — dérivé de lot_id → batiment_id → workspace_id mais stocké en dur pour l'isolation multi-tenant et les performances de requête.
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### ordre

> [Notion](https://www.notion.so/ordre-3231d95b2f8a813eb48ccc34f70b5168) | ID: `3231d95b-2f8a-813e-b48c-cc34f70b5168`

- **Description** : Ordre d'affichage dans la galerie de l'élément.
- **Obligatoire** : Non
- **Type** : int
- **Table** : Photo

### attestation_assurance

> [Notion](https://www.notion.so/attestation_assurance-3231d95b2f8a8147a605e9ebb38aba96) | ID: `3231d95b-2f8a-8147-a605-e9ebb38aba96`

- **Description** : Attestation d'assurance habitation fournie par le locataire. Applicable uniquement aux EDL d'entrée (sous_type = entree).
- **Obligatoire** : Non
- **Type** : bool
- **Table** : EDL_Inventaire

### numero_serie

> [Notion](https://www.notion.so/numero_serie-3231d95b2f8a814bb061fac5cf2eb461) | ID: `3231d95b-2f8a-814b-b061-fac5cf2eb461`

- **Description** : Numéro de série physique gravé sur le compteur. Utilisé pour les compteurs eau, gaz et chauffage collectif. Pour les compteurs électriques Linky, privilégier le champ numero (PRM). Les deux peuvent coexister sur un compteur électrique ancien.
- **Obligatoire** : Non
- **Type** : string
- **Table** : CompteurLot

### statut_assignation

> [Notion](https://www.notion.so/statut_assignation-3231d95b2f8a8151888afdbc3b692f9e) | ID: `3231d95b-2f8a-8151-888a-fdbc3b692f9e`

- **Description** : Statut du workflow d'assignation au technicien. Distinct du statut cycle de vie. Permet de gérer l'acceptation/refus des missions par des intervenants externes.
- **Obligatoire** : Non
- **Valeurs_enum** : non_assignee | proposee | acceptee | refusee
- **Type** : enum
- **Table** : Mission

### code_acces

> [Notion](https://www.notion.so/code_acces-3231d95b2f8a8152bba2d706ded4c6b4) | ID: `3231d95b-2f8a-8152-bba2-d706ded4c6b4`

- **Description** : Code d'accès au logement ou à l'immeuble au moment de l'EDL (digicode, interphone...). Saisi à chaque état des lieux car peut changer entre deux passages. Migré depuis la table Lot.
- **Obligatoire** : Non
- **Type** : string
- **Table** : EDL_Inventaire

### signature_locataire_url

> [Notion](https://www.notion.so/signature_locataire_url-3231d95b2f8a8163816fe8181ebc9549) | ID: `3231d95b-2f8a-8163-816f-e8181ebc9549`

- **Description** : URL de la signature électronique du locataire (image PNG générée lors de la signature sur tablette). Stockage S3. Obligatoire pour que le document soit considéré comme signé.
- **Obligatoire** : Non
- **Type** : url
- **Table** : EDL_Inventaire

### motif_infructueux

> [Notion](https://www.notion.so/motif_infructueux-3231d95b2f8a81709b24df60c89a0e12) | ID: `3231d95b-2f8a-8170-9b24-df60c89a0e12`

- **Description** : Motif de non-finalisation du document. Visible et obligatoire uniquement si statut = infructueux. Ex : refus de signature, locataire absent, accès impossible.
- **Obligatoire** : Non
- **Type** : string
- **Table** : EDL_Inventaire

### url

> [Notion](https://www.notion.so/url-3231d95b2f8a8185bed8e8800803e3c8) | ID: `3231d95b-2f8a-8185-bed8-e8800803e3c8`

- **Description** : URL de stockage S3 de la photo.
- **Obligatoire** : Oui
- **Type** : url
- **Table** : Photo

### edl_id

> [Notion](https://www.notion.so/edl_id-3231d95b2f8a818ab50dec00c6542fcf) | ID: `3231d95b-2f8a-818a-b50d-ec00c6542fcf`

- **Description** : EDL ou Inventaire auquel appartient cette photo.
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Photo

### id

> [Notion](https://www.notion.so/id-3231d95b2f8a818faf1af4e2e489995b) | ID: `3231d95b-2f8a-818f-af1a-f4e2e489995b`

- **Description** : Identifiant unique de la valeur relevée.
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : ValeurReleveCompteur

### id

> [Notion](https://www.notion.so/id-3231d95b2f8a8197ad65ea25aa885651) | ID: `3231d95b-2f8a-8197-ad65-ea25aa885651`

- **Description** : Identifiant unique de la photo.
- **Obligatoire** : Oui
- **Type** : uuid
- **Notes_client** : ⚠️ Table anticipée V2 (EPIC 7) — non implémentée en V1. La V1 gère les photos via des champs url simples sur chaque table. Cette table permettra en V2 de gérer les métadonnées, l'association photo↔item et les comparatifs entrée/sortie.
- **Table** : Photo

### observations_locataire

> [Notion](https://www.notion.so/observations_locataire-3231d95b2f8a8199942afbad15b05c2f) | ID: `3231d95b-2f8a-8199-942a-fbad15b05c2f`

- **Description** : Observations libres formulées par le locataire lors de la 4e étape du workflow de signature, après relecture du document. Apparaissent dans le rapport PDF.
- **Obligatoire** : Non
- **Type** : text
- **Table** : EDL_Inventaire

### entity_type

> [Notion](https://www.notion.so/entity_type-3231d95b2f8a81a291c9e09ee121bf9e) | ID: `3231d95b-2f8a-81a2-91c9-e09ee121bf9e`

- **Description** : Type d'entité à laquelle la photo est rattachée. Permet une association polymorphique sans multiplier les colonnes FK.
- **Obligatoire** : Oui
- **Valeurs_enum** : item | sous_item | section | piece | compteur | acces | cle | general
- **Type** : enum
- **Table** : Photo

### attestation_entretien_chaudiere

> [Notion](https://www.notion.so/attestation_entretien_chaudiere-3231d95b2f8a81a8a818ead026609f53) | ID: `3231d95b-2f8a-81a8-a818-ead026609f53`

- **Description** : Attestation d'entretien de chaudière fournie par le locataire. Applicable uniquement aux EDL de sortie (sous_type = sortie).
- **Obligatoire** : Non
- **Type** : bool
- **Table** : EDL_Inventaire

### consentement_locataire

> [Notion](https://www.notion.so/consentement_locataire-3231d95b2f8a81b4a582e5c3a3fb28c8) | ID: `3231d95b-2f8a-81b4-a582-e5c3a3fb28c8`

- **Description** : Le locataire a coché la case « J'ai bien pris connaissance de l'état des lieux avant de signer ». Obtenu lors du workflow de signature en 3 étapes (information légale → consultation → consentement → observations).
- **Obligatoire** : Non
- **Type** : bool
- **Table** : EDL_Inventaire

### avenant_parent_id

> [Notion](https://www.notion.so/avenant_parent_id-3231d95b2f8a81c0a874c6607f0955c2) | ID: `3231d95b-2f8a-81c0-a874-c6607f0955c2`

- **Description** : Référence vers le document parent (EDL ou Inventaire) dont ce document est un avenant. Null si document original. Permet la navigation bidirectionnelle via le champ liste avenants sur le document parent.
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EDL_Inventaire

### entity_id

> [Notion](https://www.notion.so/entity_id-3231d95b2f8a81c19effc894beeec5eb) | ID: `3231d95b-2f8a-81c1-9eff-c894beeec5eb`

- **Description** : ID de l'entité concernée (item, sous-item, section, pièce, etc.) selon entity_type.
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : Photo

### titre

> [Notion](https://www.notion.so/titre-3231d95b2f8a81d591c2f3d3173ba14c) | ID: `3231d95b-2f8a-81d5-91c2-f3d3173ba14c`

- **Description** : Titre ou légende de la photo. Demandé par Flat Checker pour faciliter les comparatifs entrée/sortie (chaque photo doit avoir un titre descriptif).
- **Obligatoire** : Non
- **Type** : string
- **Table** : Photo

### etat_proprete

> [Notion](https://www.notion.so/etat_proprete-3231d95b2f8a81e2bf01f911b366cce6) | ID: `3231d95b-2f8a-81e2-bf01-f911b366cce6`

- **Description** : État général de propreté du logement au moment de l'EDL. Information complémentaire globale, distincte des états par élément.
- **Obligatoire** : Non
- **Valeurs_enum** : tres_propre | propre | correct | sale | tres_sale
- **Type** : enum
- **Table** : EDL_Inventaire

### avenants

> [Notion](https://www.notion.so/avenants-3231d95b2f8a81f19412e06d3fbeca30) | ID: `3231d95b-2f8a-81f1-9412-e06d3fbeca30`

- **Description** : Liste des avenants rattachés à ce document (via avenant_parent_id). Un EDL ou Inventaire peut avoir N avenants, chacun signé séparément.
- **Obligatoire** : Non
- **Type** : liste
- **Table** : EDL_Inventaire

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81008866cb40421f41b7) | ID: `3271d95b-2f8a-8100-8866-cb40421f41b7`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : ConfigCritereCategorie

### verification_token

> [Notion](https://www.notion.so/verification_token-3271d95b2f8a8101a12dfd224dc228c1) | ID: `3271d95b-2f8a-8101-a12d-fd224dc228c1`

- **Description** : Hash unique du document signé, généré à la signature. Sert à prouver l'intégrité du document (contenu non altéré post-signature). Utilisé pour le QR code de vérification
- **Obligatoire** : Non
- **Type** : string
- **Table** : EDL_Inventaire

### statut_invitation

> [Notion](https://www.notion.so/statut_invitation-3271d95b2f8a810287c7f6004900f9ee) | ID: `3271d95b-2f8a-8102-87c7-f6004900f9ee`

- **Description** : Statut de l'invitation du technicien : en_attente (défaut) | accepte | refuse. Séparé du statut de mission (retour client 18/03/2026).
- **Obligatoire** : Non
- **Type** : enum
- **Table** : MissionTechnicien

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81058f54d669d6b9ae45) | ID: `3271d95b-2f8a-8105-8f54-d669d6b9ae45`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : IndisponibiliteTechnicien

### motif

> [Notion](https://www.notion.so/motif-3271d95b2f8a8106a793fa13beebcfb2) | ID: `3271d95b-2f8a-8106-a793-fa13beebcfb2`

- **Description** : Raison de l'indisponibilité (congé, formation, maladie…)
- **Obligatoire** : Non
- **Type** : string
- **Table** : IndisponibiliteTechnicien

### page

> [Notion](https://www.notion.so/page-3271d95b2f8a8109a5fffcc38554b7a0) | ID: `3271d95b-2f8a-8109-a5ff-fcc38554b7a0`

- **Description** : Identifiant de la page/tableau concerné
- **Obligatoire** : Oui
- **Type** : string
- **Notes_client** : Ex : missions_list, tiers_proprietaire, batiments
- **Table** : UserPreference

### critere

> [Notion](https://www.notion.so/critere-3271d95b2f8a810a9fbcd771a47e9d2e) | ID: `3271d95b-2f8a-810a-9fbc-d771a47e9d2e`

- **Description** : Critère overridé
- **Obligatoire** : Oui
- **Valeurs_enum** : etat_general | proprete | photos | caracteristiques | couleur | degradations | fonctionnement | quantite
- **Type** : enum
- **Table** : ConfigCritereItem

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a810e831ecd6ccb924fd2) | ID: `3271d95b-2f8a-810e-831e-cd6ccb924fd2`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : UserPreference

### contexte

> [Notion](https://www.notion.so/contexte-3271d95b2f8a810e8b4ac1f658ae08b5) | ID: `3271d95b-2f8a-810e-8b4a-c1f658ae08b5`

- **Description** : Un item est soit EDL soit Inventaire, pas les deux
- **Obligatoire** : Oui
- **Valeurs_enum** : edl | inventaire
- **Type** : enum
- **Table** : CatalogueItem

### config

> [Notion](https://www.notion.so/config-3271d95b2f8a810ebedde1b0ec61c65a) | ID: `3271d95b-2f8a-810e-bedd-e1b0ec61c65a`

- **Description** : Configuration JSON (colonnes visibles, ordre, largeurs, filtres sauvegardés)
- **Obligatoire** : Oui
- **Type** : json
- **Table** : UserPreference

### updated_at

> [Notion](https://www.notion.so/updated_at-3271d95b2f8a811181ede41f03d4cdbc) | ID: `3271d95b-2f8a-8111-81ed-e41f03d4cdbc`

- **Description** : Date de dernière modification
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : CatalogueItem

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3271d95b2f8a81118ab7f2ef82b4ea22) | ID: `3271d95b-2f8a-8111-8ab7-f2ef82b4ea22`

- **Description** : → Workspace. Null = valeur plateforme
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : ValeurReferentiel

### est_principal

> [Notion](https://www.notion.so/est_principal-3271d95b2f8a81119aa8da51bda27fe8) | ID: `3271d95b-2f8a-8111-9aa8-da51bda27fe8`

- **Description** : Propriétaire principal du lot (1 seul par lot). Défaut: false
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : LotProprietaire

### est_recurrent

> [Notion](https://www.notion.so/est_recurrent-3271d95b2f8a8111a2f1f77cc175f363) | ID: `3271d95b-2f8a-8111-a2f1-f77cc175f363`

- **Description** : Plage récurrente (type Google Agenda). Défaut: false
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : IndisponibiliteTechnicien

### degradations

> [Notion](https://www.notion.so/degradations-3271d95b2f8a8112ace0c7300cedadb0) | ID: `3271d95b-2f8a-8112-ace0-c7300cedadb0`

- **Description** : Array de tags dégradations sélectionnés
- **Obligatoire** : Non
- **Type** : json
- **Notes_client** : Ex : ["Rayure", "Tache"]
- **Table** : EvaluationItem

### nb_photos_min

> [Notion](https://www.notion.so/nb_photos_min-3271d95b2f8a811393dccd0abcdc3da4) | ID: `3271d95b-2f8a-8113-93dc-cd0abcdc3da4`

- **Description** : Nombre minimum de photos d'ensemble requis. Configurable par workspace
- **Obligatoire** : Non
- **Type** : int
- **Table** : PieceEDL

### couleur

> [Notion](https://www.notion.so/couleur-3271d95b2f8a811588c0e13e69c17dd5) | ID: `3271d95b-2f8a-8115-88c0-e13e69c17dd5`

- **Description** : Couleur constatée. String libre — valeurs prédéfinies dans ValeurReferentiel (critere=couleur), technicien peut créer de nouvelles valeurs
- **Obligatoire** : Non
- **Type** : string
- **Table** : EvaluationItem

### parent_item_id

> [Notion](https://www.notion.so/parent_item_id-3271d95b2f8a8116b008dc6e218a3d3d) | ID: `3271d95b-2f8a-8116-b008-dc6e218a3d3d`

- **Description** : → CatalogueItem (self-ref). Null = item racine. Non-null = sous-item. Profondeur max : 2 niveaux
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : CatalogueItem

### ordre_affichage

> [Notion](https://www.notion.so/ordre_affichage-3271d95b2f8a811780a3da2f6b1b4ab4) | ID: `3271d95b-2f8a-8117-80a3-da2f6b1b4ab4`

- **Description** : Tri dans l'UI (ASC)
- **Obligatoire** : Non
- **Type** : int
- **Table** : TemplatePieceItem

### date_fin

> [Notion](https://www.notion.so/date_fin-3271d95b2f8a8118ab5cc16e48588d20) | ID: `3271d95b-2f8a-8118-ab5c-c16e48588d20`

- **Description** : Fin de la plage d'indisponibilité
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : IndisponibiliteTechnicien

### observation

> [Notion](https://www.notion.so/observation-3271d95b2f8a8119855bda2f4b7e0157) | ID: `3271d95b-2f8a-8119-855b-da2f4b7e0157`

- **Description** : Commentaire libre du technicien sur cet item
- **Obligatoire** : Non
- **Type** : text
- **Table** : EvaluationItem

### nom

> [Notion](https://www.notion.so/nom-3271d95b2f8a81199506f2d185ef291e) | ID: `3271d95b-2f8a-8119-9506-f2d185ef291e`

- **Description** : Nom de l'item
- **Obligatoire** : Oui
- **Type** : string
- **Notes_client** : Ex : Sol, Évier, Robinet, Lit, Téléviseur…
- **Table** : CatalogueItem

### photos_ensemble

> [Notion](https://www.notion.so/photos_ensemble-3271d95b2f8a811a9b8cc795bbff982f) | ID: `3271d95b-2f8a-811a-9b8c-c795bbff982f`

- **Description** : Array d'URLs/IDs de photos d'ensemble de la pièce. Essentiel pour les comparatifs entrée/sortie V2
- **Obligatoire** : Non
- **Type** : json
- **Notes_client** : Photos vue générale de la pièce (obligatoire à terme)
- **Table** : PieceEDL

### quantite_defaut

> [Notion](https://www.notion.so/quantite_defaut-3271d95b2f8a811e94a6dbe5f9f96246) | ID: `3271d95b-2f8a-811e-94a6-dbe5f9f96246`

- **Description** : Nombre d'instances à pré-créer. Défaut: 1
- **Obligatoire** : Oui
- **Type** : int
- **Notes_client** : Ex : Mur = 4, Fenêtre = 1, Prise = 2
- **Table** : TemplatePieceItem

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3271d95b2f8a812095c6e696c15d9b57) | ID: `3271d95b-2f8a-8120-95c6-e696c15d9b57`

- **Description** : → Workspace. Null = template plateforme
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : TemplatePieceItem

### lot_id

> [Notion](https://www.notion.so/lot_id-3271d95b2f8a8120b1a4d6edfe005f01) | ID: `3271d95b-2f8a-8120-b1a4-d6edfe005f01`

- **Description** : → Lot
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : LotProprietaire

### etat_general

> [Notion](https://www.notion.so/etat_general-3271d95b2f8a8122acbfee0cdd87d6f8) | ID: `3271d95b-2f8a-8122-acbf-ee0cdd87d6f8`

- **Description** : État général constaté. Masqué auto si l'item a des sous-items
- **Obligatoire** : Non
- **Valeurs_enum** : neuf | bon_etat | etat_usage | mauvais_etat | degrade
- **Type** : enum
- **Table** : EvaluationItem

### couleur

> [Notion](https://www.notion.so/couleur-3271d95b2f8a8126ab09e7d8d64a8f07) | ID: `3271d95b-2f8a-8126-ab09-e7d8d64a8f07`

- **Description** : Niveau d'exigence pour la Couleur
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### fonctionnement

> [Notion](https://www.notion.so/fonctionnement-3271d95b2f8a8129897ff5b5d415a9cd) | ID: `3271d95b-2f8a-8129-897f-f5b5d415a9cd`

- **Description** : Fonctionnement constaté. Non testé/Non testable déclenchent mention « sous réserve » dans le rapport
- **Obligatoire** : Non
- **Valeurs_enum** : fonctionne | fonctionne_difficilement | hors_service | non_teste | non_testable
- **Type** : enum
- **Table** : EvaluationItem

### ordre_affichage

> [Notion](https://www.notion.so/ordre_affichage-3271d95b2f8a812aa8f0ed6d164925c8) | ID: `3271d95b-2f8a-812a-a8f0-ed6d164925c8`

- **Description** : Tri dans l'UI (ASC)
- **Obligatoire** : Non
- **Type** : int
- **Table** : TypePiece

### role_locataire

> [Notion](https://www.notion.so/role_locataire-3271d95b2f8a812e8714ee8bb1f6bd1d) | ID: `3271d95b-2f8a-812e-8714-ee8bb1f6bd1d`

- **Description** : Rôle du locataire dans l'EDL
- **Obligatoire** : Oui
- **Valeurs_enum** : entrant | sortant
- **Type** : enum
- **Table** : EDLLocataire

### updated_at

> [Notion](https://www.notion.so/updated_at-3271d95b2f8a813081edf78e880cd4e8) | ID: `3271d95b-2f8a-8130-81ed-f78e880cd4e8`

- **Description** : Date de dernière modification
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : EvaluationItem

### parent_evaluation_id

> [Notion](https://www.notion.so/parent_evaluation_id-3271d95b2f8a81368c84dee2b38ca593) | ID: `3271d95b-2f8a-8136-8c84-dee2b38ca593`

- **Description** : → EvaluationItem (self-ref). Null = item racine. Non-null = sous-item évalué sous un parent
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : EvaluationItem

### niveau

> [Notion](https://www.notion.so/niveau-3271d95b2f8a8136a992f39c3adc6e5c) | ID: `3271d95b-2f8a-8136-a992-f39c3adc6e5c`

- **Description** : Niveau d'exigence override (différent du défaut catégorie)
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereItem

### type_piece_id

> [Notion](https://www.notion.so/type_piece_id-3271d95b2f8a8136b873c19abddc14a7) | ID: `3271d95b-2f8a-8136-b873-c19abddc14a7`

- **Description** : → TypePiece
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : TemplatePieceItem

### url_verification

> [Notion](https://www.notion.so/url_verification-3271d95b2f8a8137b903e06c3b39abb2) | ID: `3271d95b-2f8a-8137-b903-e06c3b39abb2`

- **Description** : Lien public vers la page de vérification d'authenticité du document (ex : app.immochecker.fr/verify/{token}). Le QR code dans le PDF pointe vers cette URL
- **Obligatoire** : Non
- **Type** : url
- **Notes_client** : Page publique : type de document, date, adresse + bouton télécharger + badge scellé électronique (cf. pattern Nockee)
- **Table** : EDL_Inventaire

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a81399685e429acb69e4d) | ID: `3271d95b-2f8a-8139-9685-e429acb69e4d`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : EvaluationItem

### categorie

> [Notion](https://www.notion.so/categorie-3271d95b2f8a813c9692e94737df7df1) | ID: `3271d95b-2f8a-813c-9692-e94737df7df1`

- **Description** : Catégorie de l'item — utilisée pour le groupement visuel et le paramétrage des critères par défaut
- **Obligatoire** : Oui
- **Valeurs_enum** : revetements | plomberie | menuiseries_ext | menuiseries_int | electricite | chauffage_clim | cuisine_equipee | sdb_sanitaires | mobilier | electromenager | literie_linge | decoration_eclairage | multimedia | entretien | equipements_generaux | exterieur_bati | espaces_verts
- **Type** : enum
- **Table** : CatalogueItem

### source

> [Notion](https://www.notion.so/source-3271d95b2f8a813ebfebf3ee910dd523) | ID: `3271d95b-2f8a-813e-bfeb-f3ee910dd523`

- **Description** : Origine du type de pièce
- **Obligatoire** : Oui
- **Valeurs_enum** : plateforme | workspace
- **Type** : enum
- **Table** : TypePiece

### edl_id

> [Notion](https://www.notion.so/edl_id-3271d95b2f8a813f892ad8d5bd5df553) | ID: `3271d95b-2f8a-813f-892a-d8d5bd5df553`

- **Description** : → EDL_Inventaire
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EDLLocataire

### est_principal

> [Notion](https://www.notion.so/est_principal-3271d95b2f8a813f9271dab88e687ea6) | ID: `3271d95b-2f8a-813f-9271-dab88e687ea6`

- **Description** : Technicien principal de la mission. Généralement 1 seul technicien par mission, pivot pour anticiper le multi-technicien. Défaut: true
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : MissionTechnicien

### tiers_id

> [Notion](https://www.notion.so/tiers_id-3271d95b2f8a81418a4cd788c1ab6255) | ID: `3271d95b-2f8a-8141-8a4c-d788c1ab6255`

- **Description** : → Tiers (locataire). Supporte la colocation (plusieurs locataires par EDL)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EDLLocataire

### valeur

> [Notion](https://www.notion.so/valeur-3271d95b2f8a81489566d160e3a76c01) | ID: `3271d95b-2f8a-8148-9566-d160e3a76c01`

- **Description** : Tag prédéfini
- **Obligatoire** : Oui
- **Type** : string
- **Notes_client** : Ex : Parquet, Rayure, Blanc, Carrelage…
- **Table** : ValeurReferentiel

### tiers_id

> [Notion](https://www.notion.so/tiers_id-3271d95b2f8a8148ac60cd5b0a2ebd21) | ID: `3271d95b-2f8a-8148-ac60-cd5b0a2ebd21`

- **Description** : → Tiers (propriétaire). Supporte l'indivision (plusieurs propriétaires par lot)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : LotProprietaire

### ordre

> [Notion](https://www.notion.so/ordre-3271d95b2f8a814c9dcfe725264ee6ab) | ID: `3271d95b-2f8a-814c-9dcf-e725264ee6ab`

- **Description** : Ordre d'affichage de la pièce dans l'EDL
- **Obligatoire** : Oui
- **Type** : int
- **Table** : PieceEDL

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a814cae71ead942244cf3) | ID: `3271d95b-2f8a-814c-ae71-ead942244cf3`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : TypePiece

### caracteristiques

> [Notion](https://www.notion.so/caracteristiques-3271d95b2f8a8150a175e019b9dc8311) | ID: `3271d95b-2f8a-8150-a175-e019b9dc8311`

- **Description** : Niveau d'exigence pour les Caractéristiques
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### quantite

> [Notion](https://www.notion.so/quantite-3271d95b2f8a81548923d33999701451) | ID: `3271d95b-2f8a-8154-8923-d33999701451`

- **Description** : Quantité (inventaire uniquement). Comptage d'objets mobiliers
- **Obligatoire** : Non
- **Type** : int
- **Table** : EvaluationItem

### degradations

> [Notion](https://www.notion.so/degradations-3271d95b2f8a8154ba45eb8789a85e7e) | ID: `3271d95b-2f8a-8154-ba45-eb8789a85e7e`

- **Description** : Niveau d'exigence pour les Dégradations
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### user_id

> [Notion](https://www.notion.so/user_id-3271d95b2f8a8155acc5fed0eddc5f04) | ID: `3271d95b-2f8a-8155-acc5-fed0eddc5f04`

- **Description** : → Utilisateur (technicien)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : MissionTechnicien

### est_archive

> [Notion](https://www.notion.so/est_archive-3271d95b2f8a81579cebf6d6cabbe010) | ID: `3271d95b-2f8a-8157-9ceb-f6d6cabbe010`

- **Description** : Soft delete. Défaut: false
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : CatalogueItem

### caracteristiques

> [Notion](https://www.notion.so/caracteristiques-3271d95b2f8a815c931ee19eb4be8c14) | ID: `3271d95b-2f8a-815c-931e-e19eb4be8c14`

- **Description** : Array de tags caractéristiques sélectionnés (issus de ValeurReferentiel + créations terrain)
- **Obligatoire** : Non
- **Type** : json
- **Notes_client** : Ex : ["Parquet", "Chêne massif"]
- **Table** : EvaluationItem

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3271d95b2f8a815e887cea8145fab305) | ID: `3271d95b-2f8a-815e-887c-ea8145fab305`

- **Description** : → Workspace. Null = type plateforme (socle Flat Checker)
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : TypePiece

### fonctionnement

> [Notion](https://www.notion.so/fonctionnement-3271d95b2f8a815fab1ed09456d82ba5) | ID: `3271d95b-2f8a-815f-ab1e-d09456d82ba5`

- **Description** : Niveau d'exigence pour le Fonctionnement
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### mission_id

> [Notion](https://www.notion.so/mission_id-3271d95b2f8a81679aafea8c1db25f47) | ID: `3271d95b-2f8a-8167-9aaf-ea8c1db25f47`

- **Description** : → Mission
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : MissionTechnicien

### edl_id

> [Notion](https://www.notion.so/edl_id-3271d95b2f8a81679f1edb391104eb30) | ID: `3271d95b-2f8a-8167-9f1e-db391104eb30`

- **Description** : → EDL_Inventaire. EDL concret contenant cette pièce
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : PieceEDL

### nom_personnalise

> [Notion](https://www.notion.so/nom_personnalise-3271d95b2f8a8169aff2c5a81862bbc0) | ID: `3271d95b-2f8a-8169-aff2-c5a81862bbc0`

- **Description** : Nom affiché dans l'EDL
- **Obligatoire** : Oui
- **Type** : string
- **Notes_client** : Ex : Chambre 1, Cuisine, SDB parentale
- **Table** : PieceEDL

### source

> [Notion](https://www.notion.so/source-3271d95b2f8a816a9db8c264727a9792) | ID: `3271d95b-2f8a-816a-9db8-c264727a9792`

- **Description** : Origine de la valeur
- **Obligatoire** : Oui
- **Valeurs_enum** : plateforme | workspace | terrain
- **Type** : enum
- **Table** : ValeurReferentiel

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a816c8652c4392d5884ef) | ID: `3271d95b-2f8a-816c-8652-c4392d5884ef`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : PieceEDL

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3271d95b2f8a8170a663cc73a4badbce) | ID: `3271d95b-2f8a-8170-a663-cc73a4badbce`

- **Description** : → Workspace. Null = item plateforme (socle Flat Checker)
- **Obligatoire** : Non
- **Type** : uuid FK
- **Table** : CatalogueItem

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a8173af32d9c4410a91fd) | ID: `3271d95b-2f8a-8173-af32-d9c4410a91fd`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : ConfigCritereItem

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a8176a425fdd6ecda2f38) | ID: `3271d95b-2f8a-8176-a425-fdd6ecda2f38`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : TypePiece

### label

> [Notion](https://www.notion.so/label-3271d95b2f8a8177be1cc3ee86c65ee6) | ID: `3271d95b-2f8a-8177-be1c-c3ee86c65ee6`

- **Description** : Libellé personnalisé de l'instance, défini par le technicien sur le terrain. Si null, affiche CatalogueItem.nom (+ numéro auto si doublon dans la pièce). Auto-numérotation : 2ème Mur → "Mur 1" + "Mur 2". Renommage libre possible ("Mur de face").
- **Obligatoire** : Non
- **Type** : string
- **Notes_client** : Ex : Mur d'accès, Mur gauche, Fenêtre salon, Robinet cuisine. Labels par défaut murs : Mur d'accès · Mur gauche · Mur droit · Mur de face.
- **Table** : EvaluationItem

### latitude

> [Notion](https://www.notion.so/latitude-3271d95b2f8a8179b4c7fcbf8ecb05d5) | ID: `3271d95b-2f8a-8179-b4c7-fcbf8ecb05d5`

- **Description** : Latitude GPS (géocodage automatique à la création/modification). Utilisé pour la vue carte des missions
- **Obligatoire** : Non
- **Type** : float
- **Table** : AdresseBatiment

### user_id

> [Notion](https://www.notion.so/user_id-3271d95b2f8a817a8729fbec29c7dc02) | ID: `3271d95b-2f8a-817a-8729-fbec29c7dc02`

- **Description** : → Utilisateur
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : UserPreference

### categorie_piece

> [Notion](https://www.notion.so/categorie_piece-3271d95b2f8a81858702d7ed833dfe79) | ID: `3271d95b-2f8a-8185-8702-d7ed833dfe79`

- **Description** : Catégorie regroupant les types de pièces dans l'UI
- **Obligatoire** : Oui
- **Valeurs_enum** : vie | eau_sanitaires | circulations | exterieur_annexes | parties_communes
- **Type** : enum
- **Table** : TypePiece

### critere

> [Notion](https://www.notion.so/critere-3271d95b2f8a8186b01ce4d0b711acdd) | ID: `3271d95b-2f8a-8186-b01c-e4d0b711acdd`

- **Description** : Critère concerné par cette valeur
- **Obligatoire** : Oui
- **Valeurs_enum** : caracteristiques | degradations | couleur
- **Type** : enum
- **Table** : ValeurReferentiel

### commentaire

> [Notion](https://www.notion.so/commentaire-3271d95b2f8a8186be12df720b7bcea4) | ID: `3271d95b-2f8a-8186-be12-df720b7bcea4`

- **Description** : Note libre (clé manquante, ne fonctionne pas…)
- **Obligatoire** : Non
- **Type** : text
- **Table** : CleMission

### etat_general

> [Notion](https://www.notion.so/etat_general-3271d95b2f8a81888c0af27b20a0ec67) | ID: `3271d95b-2f8a-8188-8c0a-f27b20a0ec67`

- **Description** : Niveau d'exigence pour l'État général sur cette catégorie
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### catalogue_item_id

> [Notion](https://www.notion.so/catalogue_item_id-3271d95b2f8a818a8271d27d0a43dae8) | ID: `3271d95b-2f8a-818a-8271-d27d0a43dae8`

- **Description** : → CatalogueItem. Item pré-sélectionné dans ce type de pièce
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : TemplatePieceItem

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3271d95b2f8a818ca9b1d5c9e9ff120b) | ID: `3271d95b-2f8a-818c-a9b1-d5c9e9ff120b`

- **Description** : → Workspace. Un jeu de config par workspace
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : ConfigCritereCategorie

### longitude

> [Notion](https://www.notion.so/longitude-3271d95b2f8a81928ce9f1a4bb5c1e58) | ID: `3271d95b-2f8a-8192-8ce9-f1a4bb5c1e58`

- **Description** : Longitude GPS (géocodage automatique). Utilisé pour la vue carte des missions
- **Obligatoire** : Non
- **Type** : float
- **Table** : AdresseBatiment

### updated_at

> [Notion](https://www.notion.so/updated_at-3271d95b2f8a81929751ca45e3da9fe5) | ID: `3271d95b-2f8a-8192-9751-ca45e3da9fe5`

- **Description** : Date de dernière modification
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : TypePiece

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3271d95b2f8a81929e61d80713c7116c) | ID: `3271d95b-2f8a-8192-9e61-d80713c7116c`

- **Description** : → Workspace
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : ConfigCritereItem

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a8195bc51d985aa2c9922) | ID: `3271d95b-2f8a-8195-bc51-d985aa2c9922`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : UserPreference

### workspace_id

> [Notion](https://www.notion.so/workspace_id-3271d95b2f8a8198be2bc2e6743ba842) | ID: `3271d95b-2f8a-8198-be2b-c2e6743ba842`

- **Description** : → Workspace
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : IndisponibiliteTechnicien

### photos

> [Notion](https://www.notion.so/photos-3271d95b2f8a819db195f8abcec2d3a6) | ID: `3271d95b-2f8a-819d-b195-f8abcec2d3a6`

- **Description** : Array d'URLs/IDs de photos liées à cet item. Association photo-item pour comparatifs entrée/sortie
- **Obligatoire** : Non
- **Type** : json
- **Table** : EvaluationItem

### ordre

> [Notion](https://www.notion.so/ordre-3271d95b2f8a81a1b97af28c3d3211a1) | ID: `3271d95b-2f8a-81a1-b97a-f28c3d3211a1`

- **Description** : Ordre d'affichage dans la pièce
- **Obligatoire** : Oui
- **Type** : int
- **Table** : EvaluationItem

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a81a2b46bdef21702cd9a) | ID: `3271d95b-2f8a-81a2-b46b-def21702cd9a`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : IndisponibiliteTechnicien

### categorie

> [Notion](https://www.notion.so/categorie-3271d95b2f8a81a8b5cbf0f3e6ff3e53) | ID: `3271d95b-2f8a-81a8-b5cb-f0f3e6ff3e53`

- **Description** : Catégorie d'items concernée (même enum que CatalogueItem.categorie)
- **Obligatoire** : Oui
- **Valeurs_enum** : revetements | plomberie | menuiseries_ext | menuiseries_int | electricite | chauffage_clim | cuisine_equipee | sdb_sanitaires | mobilier | electromenager | literie_linge | decoration_eclairage | multimedia | entretien | equipements_generaux | exterieur_bati | espaces_verts
- **Type** : enum
- **Table** : ConfigCritereCategorie

### type_cle

> [Notion](https://www.notion.so/type_cle-3271d95b2f8a81b0b632cb50eba7cc6d) | ID: `3271d95b-2f8a-81b0-b632-cb50eba7cc6d`

- **Description** : Type de clé
- **Obligatoire** : Oui
- **Valeurs_enum** : cle_principale | badge | boite_aux_lettres | parking | cave | digicode | autre
- **Type** : enum
- **Notes_client** : Ex : Clé principale, Badge parking, Boîte aux lettres
- **Table** : CleMission

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a81b49aafd6cd558235b6) | ID: `3271d95b-2f8a-81b4-9aaf-d6cd558235b6`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : CleMission

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81b4b662e5baa65e7bbd) | ID: `3271d95b-2f8a-81b4-b662-e5baa65e7bbd`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : LotProprietaire

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81b5bdb4f6908384a4cc) | ID: `3271d95b-2f8a-81b5-bdb4-f6908384a4cc`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : ValeurReferentiel

### mission_id

> [Notion](https://www.notion.so/mission_id-3271d95b2f8a81b694eec3540333dff0) | ID: `3271d95b-2f8a-81b6-94ee-c3540333dff0`

- **Description** : → Mission
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : CleMission

### commentaire_piece

> [Notion](https://www.notion.so/commentaire_piece-3271d95b2f8a81b8adbec960fa0c0ebc) | ID: `3271d95b-2f8a-81b8-adbe-c960fa0c0ebc`

- **Description** : Commentaire global sur la pièce (pas d'état général par pièce)
- **Obligatoire** : Non
- **Type** : text
- **Table** : PieceEDL

### updated_at

> [Notion](https://www.notion.so/updated_at-3271d95b2f8a81bdb1e2d76ac38890b7) | ID: `3271d95b-2f8a-81bd-b1e2-d76ac38890b7`

- **Description** : Date de dernière modification
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : UserPreference

### est_archive

> [Notion](https://www.notion.so/est_archive-3271d95b2f8a81bf898cdbb0315e5f3a) | ID: `3271d95b-2f8a-81bf-898c-dbb0315e5f3a`

- **Description** : Soft delete — masqué dans les listes mais conservé pour les EDL historiques. Défaut: false
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : TypePiece

### photos

> [Notion](https://www.notion.so/photos-3271d95b2f8a81c092f5d27856215bb2) | ID: `3271d95b-2f8a-81c0-92f5-d27856215bb2`

- **Description** : Niveau d'exigence pour les Photos
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81c4ac22d7c09555ef1f) | ID: `3271d95b-2f8a-81c4-ac22-d7c09555ef1f`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : EDLLocataire

### aide_contextuelle

> [Notion](https://www.notion.so/aide_contextuelle-3271d95b2f8a81c5a216e5457618617f) | ID: `3271d95b-2f8a-81c5-a216-e5457618617f`

- **Description** : Tip ℹ️ affiché au technicien sur le terrain
- **Obligatoire** : Non
- **Type** : text
- **Notes_client** : Ex : Vérifiez le débit chaud/froid, Prenez 2 photos
- **Table** : CatalogueItem

### catalogue_item_id

> [Notion](https://www.notion.so/catalogue_item_id-3271d95b2f8a81c5a9f0e3f67619d172) | ID: `3271d95b-2f8a-81c5-a9f0-e3f67619d172`

- **Description** : → CatalogueItem. Item auquel ce tag est rattaché
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : ValeurReferentiel

### catalogue_item_id

> [Notion](https://www.notion.so/catalogue_item_id-3271d95b2f8a81c9a1edde54101112b1) | ID: `3271d95b-2f8a-81c9-a1ed-de54101112b1`

- **Description** : → CatalogueItem. Référence au catalogue pour hériter de la config
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EvaluationItem

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a81caa1dee85705fbcbba) | ID: `3271d95b-2f8a-81ca-a1de-e85705fbcbba`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : CatalogueItem

### nom

> [Notion](https://www.notion.so/nom-3271d95b2f8a81cc8bf7e2732028dc56) | ID: `3271d95b-2f8a-81cc-8bf7-e2732028dc56`

- **Description** : Nom du type de pièce
- **Obligatoire** : Oui
- **Type** : string
- **Notes_client** : Ex : Cuisine, Chambre, Salle de bain, Cave, Garage…
- **Table** : TypePiece

### statut_rdv

> [Notion](https://www.notion.so/statut_rdv-3271d95b2f8a81ceae3cdf7a9ca0395c) | ID: `3271d95b-2f8a-81ce-ae3c-df7a9ca0395c`

- **Description** : Statut du rendez-vous avec le locataire : a_confirmer | confirme | reporte. Séparé du statut de mission (retour client 18/03/2026).
- **Obligatoire** : Non
- **Type** : enum
- **Table** : Mission

### couleur_primaire

> [Notion](https://www.notion.so/couleur_primaire-3271d95b2f8a81d09120cb6f4108c655) | ID: `3271d95b-2f8a-81d0-9120-cb6f4108c655`

- **Description** : Couleur primaire du branding workspace (hex). Utilisée pour l'interface et les PDF. Si vide, couleur ImmoChecker par défaut.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a81d1a71dd78eee44a69e) | ID: `3271d95b-2f8a-81d1-a71d-d78eee44a69e`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : ValeurReferentiel

### piece_edl_id

> [Notion](https://www.notion.so/piece_edl_id-3271d95b2f8a81d1ae82fd9d8b8336d4) | ID: `3271d95b-2f8a-81d1-ae82-fd9d8b8336d4`

- **Description** : → PieceEDL. Pièce dans laquelle cet item est évalué
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : EvaluationItem

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81d7a2e2fd3602ca024f) | ID: `3271d95b-2f8a-81d7-a2e2-fd3602ca024f`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : MissionTechnicien

### icon

> [Notion](https://www.notion.so/icon-3271d95b2f8a81dcbbccfac5498984ea) | ID: `3271d95b-2f8a-81dc-bbcc-fac5498984ea`

- **Description** : Emoji ou nom d'icône (ex : 🍳, 🛏️, 🚿)
- **Obligatoire** : Non
- **Type** : string
- **Table** : TypePiece

### date_debut

> [Notion](https://www.notion.so/date_debut-3271d95b2f8a81dd99dbf6a5e24a9c80) | ID: `3271d95b-2f8a-81dd-99db-f6a5e24a9c80`

- **Description** : Début de la plage d'indisponibilité
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : IndisponibiliteTechnicien

### logo_url

> [Notion](https://www.notion.so/logo_url-3271d95b2f8a81df8208e566cda602b9) | ID: `3271d95b-2f8a-81df-8208-e566cda602b9`

- **Description** : URL du logo personnalisé du workspace. Affiché sur les PDF, la page de vérification et l'interface. Si vide, logo ImmoChecker par défaut. Branding workspace validé client 18/03/2026.
- **Obligatoire** : Non
- **Type** : url
- **Table** : Workspace

### statut

> [Notion](https://www.notion.so/statut-3271d95b2f8a81e08563f8fe6c501cdb) | ID: `3271d95b-2f8a-81e0-8563-f8fe6c501cdb`

- **Description** : Statut de la clé dans le workflow mission
- **Obligatoire** : Oui
- **Valeurs_enum** : a_recuperer | recuperee | a_deposer | deposee
- **Type** : enum
- **Table** : CleMission

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81e08d0bdd80e4ca172a) | ID: `3271d95b-2f8a-81e0-8d0b-dd80e4ca172a`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : EvaluationItem

### proprete

> [Notion](https://www.notion.so/proprete-3271d95b2f8a81e1920be2d4836455dd) | ID: `3271d95b-2f8a-81e1-920b-e2d4836455dd`

- **Description** : Niveau d'exigence pour la Propreté
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a81e3ba0de12328dd7d61) | ID: `3271d95b-2f8a-81e3-ba0d-e12328dd7d61`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : ConfigCritereCategorie

### recurrence_config

> [Notion](https://www.notion.so/recurrence_config-3271d95b2f8a81e8b774c6f15d3c407f) | ID: `3271d95b-2f8a-81e8-b774-c6f15d3c407f`

- **Description** : Config récurrence (RRULE ou json). Null si non récurrent
- **Obligatoire** : Non
- **Type** : json
- **Table** : IndisponibiliteTechnicien

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81e993e4fb5af1204b93) | ID: `3271d95b-2f8a-81e9-93e4-fb5af1204b93`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : CatalogueItem

### source

> [Notion](https://www.notion.so/source-3271d95b2f8a81eaaa2cc718ca93b3bd) | ID: `3271d95b-2f8a-81ea-aa2c-c718ca93b3bd`

- **Description** : Origine de l'item
- **Obligatoire** : Oui
- **Valeurs_enum** : plateforme | workspace | terrain
- **Type** : enum
- **Table** : CatalogueItem

### type_piece_id

> [Notion](https://www.notion.so/type_piece_id-3271d95b2f8a81eb8db9d7a97e1694cf) | ID: `3271d95b-2f8a-81eb-8db9-d7a97e1694cf`

- **Description** : → TypePiece. Type de pièce du catalogue
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : PieceEDL

### quantite

> [Notion](https://www.notion.so/quantite-3271d95b2f8a81ec8311c07c70c9e42b) | ID: `3271d95b-2f8a-81ec-8311-c07c70c9e42b`

- **Description** : Niveau d'exigence pour la Quantité (inventaire)
- **Obligatoire** : Oui
- **Valeurs_enum** : masque | optionnel | recommande | obligatoire
- **Type** : enum
- **Table** : ConfigCritereCategorie

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81ee92a3f09c6ff726bf) | ID: `3271d95b-2f8a-81ee-92a3-f09c6ff726bf`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : TemplatePieceItem

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81ef9d2af14ea8be76d0) | ID: `3271d95b-2f8a-81ef-9d2a-f14ea8be76d0`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : ConfigCritereItem

### updated_at

> [Notion](https://www.notion.so/updated_at-3271d95b2f8a81efa8c2fe1a7617569b) | ID: `3271d95b-2f8a-81ef-a8c2-fe1a7617569b`

- **Description** : Date de dernière modification
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : ConfigCritereCategorie

### proprete

> [Notion](https://www.notion.so/proprete-3271d95b2f8a81f2a5f3fa8170fe91b2) | ID: `3271d95b-2f8a-81f2-a5f3-fa8170fe91b2`

- **Description** : Propreté constatée
- **Obligatoire** : Non
- **Valeurs_enum** : ras | a_nettoyer
- **Type** : enum
- **Table** : EvaluationItem

### ordre_affichage

> [Notion](https://www.notion.so/ordre_affichage-3271d95b2f8a81f48456f92b9bdfb91c) | ID: `3271d95b-2f8a-81f4-8456-f92b9bdfb91c`

- **Description** : Tri dans l'UI (ASC)
- **Obligatoire** : Non
- **Type** : int
- **Table** : CatalogueItem

### updated_at

> [Notion](https://www.notion.so/updated_at-3271d95b2f8a81f582cad90885bf6aa3) | ID: `3271d95b-2f8a-81f5-82ca-d90885bf6aa3`

- **Description** : Date de dernière modification
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : PieceEDL

### created_at

> [Notion](https://www.notion.so/created_at-3271d95b2f8a81f6bc7cc9796e0a9e7a) | ID: `3271d95b-2f8a-81f6-bc7c-c9796e0a9e7a`

- **Description** : Date de création
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : PieceEDL

### catalogue_item_id

> [Notion](https://www.notion.so/catalogue_item_id-3271d95b2f8a81f8ba78f93057cf6fd6) | ID: `3271d95b-2f8a-81f8-ba78-f93057cf6fd6`

- **Description** : → CatalogueItem. Item dont on override le niveau d'exigence
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : ConfigCritereItem

### est_archive

> [Notion](https://www.notion.so/est_archive-3271d95b2f8a81faa0f0f1aab4164d0a) | ID: `3271d95b-2f8a-81fa-a0f0-f1aab4164d0a`

- **Description** : Soft delete. Défaut: false
- **Obligatoire** : Oui
- **Type** : bool
- **Table** : ValeurReferentiel

### user_id

> [Notion](https://www.notion.so/user_id-3271d95b2f8a81fd83c1df48cd7c92e5) | ID: `3271d95b-2f8a-81fd-83c1-df48cd7c92e5`

- **Description** : → Utilisateur. Technicien concerné
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : IndisponibiliteTechnicien

### id

> [Notion](https://www.notion.so/id-3271d95b2f8a81ff972cc40040b4a829) | ID: `3271d95b-2f8a-81ff-972c-c40040b4a829`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : CleMission

### deposee_at

> [Notion](https://www.notion.so/deposee_at-3291d95b2f8a81108b8dde31d840c05a) | ID: `3291d95b-2f8a-8110-8b8d-de31d840c05a`

- **Description** : Date/heure de confirmation du dépôt. Renseigné automatiquement quand statut passe à deposee.
- **Obligatoire** : Non
- **Type** : datetime
- **Table** : CleMission

### commentaire

> [Notion](https://www.notion.so/commentaire-3291d95b2f8a8112aabbc3a65ac6b810) | ID: `3291d95b-2f8a-8112-aabb-c3a65ac6b810`

- **Description** : Description libre de la clé
- **Obligatoire** : Non
- **Type** : text
- **Notes_client** : Ex : "Porte-clés bleu", "Badge abîmé"
- **Table** : CleMission

### id

> [Notion](https://www.notion.so/id-3291d95b2f8a8134a582fdb2b32bc08e) | ID: `3291d95b-2f8a-8134-a582-fdb2b32bc08e`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : CleMission

### est_journee_entiere

> [Notion](https://www.notion.so/est_journee_entiere-3291d95b2f8a813cbdabda75883437d0) | ID: `3291d95b-2f8a-813c-bdab-da75883437d0`

- **Description** : Si true, l'indispo couvre la journée entière (composant horaire de date_debut/date_fin ignoré). Si false, les heures dans date_debut/date_fin définissent le créneau.
- **Obligatoire** : Oui
- **Type** : bool
- **Notes_client** : Défaut : true (journée entière)
- **Table** : IndisponibiliteTechnicien

### created_at

> [Notion](https://www.notion.so/created_at-3291d95b2f8a81598859e8ccc114ebe0) | ID: `3291d95b-2f8a-8159-8859-e8ccc114ebe0`

- **Description** : Date de création (saisie terrain)
- **Obligatoire** : Oui
- **Type** : datetime
- **Table** : CleMission

### user_id

> [Notion](https://www.notion.so/user_id-3291d95b2f8a815d9d4ac9b3b70b5e02) | ID: `3291d95b-2f8a-815d-9d4a-c9b3b70b5e02`

- **Description** : → Utilisateur (technicien concerné par l'indisponibilité)
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : IndisponibiliteTechnicien

### quantite

> [Notion](https://www.notion.so/quantite-3291d95b2f8a81b2a96ed4f2f26cdebd) | ID: `3291d95b-2f8a-81b2-a96e-d4f2f26cdebd`

- **Description** : Nombre de clés/badges de ce type récupérés. Défaut : 1
- **Obligatoire** : Oui
- **Type** : int
- **Notes_client** : Ex : 2 clés principales, 1 badge parking
- **Table** : CleMission

### id

> [Notion](https://www.notion.so/id-3291d95b2f8a81bdbe31c2f0ccf81d1e) | ID: `3291d95b-2f8a-81bd-be31-c2f0ccf81d1e`

- **Description** : Clé primaire
- **Obligatoire** : Oui
- **Type** : uuid
- **Table** : IndisponibiliteTechnicien

### lieu_depot

> [Notion](https://www.notion.so/lieu_depot-3291d95b2f8a81d49f17e488819c19c2) | ID: `3291d95b-2f8a-81d4-9f17-e488819c19c2`

- **Description** : Lieu où les clés doivent être déposées (texte libre)
- **Obligatoire** : Non
- **Type** : text
- **Notes_client** : Ex : "Agence Versailles", "Gardien Mme Dupont", "Boîte à clés 3e étage"
- **Table** : CleMission

### statut

> [Notion](https://www.notion.so/statut-3291d95b2f8a81d791a5d6926c4b0ce4) | ID: `3291d95b-2f8a-81d7-91a5-d6926c4b0ce4`

- **Description** : Statut de la clé. Entrée : remise (documentaire, pas de workflow). Sortie : a_deposer → deposee (workflow dépôt).
- **Obligatoire** : Oui
- **Valeurs_enum** : remise | a_deposer | deposee
- **Type** : enum
- **Notes_client** : Entrée = remise au locataire (documentaire). Sortie = à déposer puis déposée.
- **Table** : CleMission

### edl_id

> [Notion](https://www.notion.so/edl_id-3291d95b2f8a81ec92ade0e93ae88040) | ID: `3291d95b-2f8a-81ec-92ad-e0e93ae88040`

- **Description** : FK → EDL_Inventaire. Chaque EDL trace ses propres clés (important en colocation : chaque locataire remet ses clés). L'agrégation au niveau mission se fait via le join EDL_Inventaire.mission_id.
- **Obligatoire** : Oui
- **Type** : uuid FK
- **Table** : CleMission

### email

> [Notion](https://www.notion.so/email-32c1d95b2f8a810581ffd0dd67b69356) | ID: `32c1d95b-2f8a-8105-81ff-d0dd67b69356`

- **Description** : Email de contact du workspace. Affiché sur les documents PDF.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### adresse

> [Notion](https://www.notion.so/adresse-32c1d95b2f8a8147a827dd94d7dca4e9) | ID: `32c1d95b-2f8a-8147-a827-dd94d7dca4e9`

- **Description** : Adresse postale du workspace (siège social). Remplie via autocomplete Google Places (EPIC 16). Utilisée sur les documents PDF (chaîne de signature "Réalisé par").
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### labels_defaut

> [Notion](https://www.notion.so/labels_defaut-32c1d95b2f8a8150aa18ddcc547a2395) | ID: `32c1d95b-2f8a-8150-aa18-ddcc547a2395`

- **Description** : Tableau de libellés prédéfinis pour les instances quand quantite_defaut > 1. Ex : ["Mur d'accès","Mur gauche","Mur droit","Mur de face"]. Optionnel — si absent, auto-numérotation ("Mur 1", "Mur 2"). La taille du tableau doit correspondre à quantite_defaut. Utilisé pour pré-remplir EvaluationItem.label à la création de la pièce sur tablette.
- **Obligatoire** : Non
- **Type** : json
- **Notes_client** : Labels par défaut murs validés client : Mur d'accès · Mur gauche · Mur droit · Mur de face
- **Table** : TemplatePieceItem

### code_postal

> [Notion](https://www.notion.so/code_postal-32c1d95b2f8a8151b671f34f27dc3367) | ID: `32c1d95b-2f8a-8151-b671-f34f27dc3367`

- **Description** : Code postal du workspace.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### telephone

> [Notion](https://www.notion.so/telephone-32c1d95b2f8a8170a5d5d0291359d0d5) | ID: `32c1d95b-2f8a-8170-a5d5-d0291359d0d5`

- **Description** : Téléphone de contact du workspace. Affiché sur les documents PDF.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### ville

> [Notion](https://www.notion.so/ville-32c1d95b2f8a819b8f23eb95d19633bd) | ID: `32c1d95b-2f8a-819b-8f23-eb95d19633bd`

- **Description** : Ville du workspace.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace

### siret

> [Notion](https://www.notion.so/siret-32c1d95b2f8a81c99506d331b49e8e74) | ID: `32c1d95b-2f8a-81c9-9506-d331b49e8e74`

- **Description** : Numéro SIRET du workspace. Affiché sur les documents PDF (chaîne de signature "Réalisé par"). Optionnel pour les bailleurs directs.
- **Obligatoire** : Non
- **Type** : string
- **Table** : Workspace
