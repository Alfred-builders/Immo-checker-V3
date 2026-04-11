---
notion_id: "3271d95b-2f8a-81d7-9c63-f4ca9959a2f0"
notion_url: "https://www.notion.so/FCR-US829-Autocomplete-adresse-Google-Places-3271d95b2f8a81d79c63f4ca9959a2f0"
last_synced: "2026-03-26T12:57:13.826Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-18T14:33:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "829"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Autocomplete adresse (Google Places)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-8198-928c-f11fa16a89de"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US829 Autocomplete adresse (Google Places)"
  Time Spent Activation: "Non"
---

# FCR - US829 Autocomplete adresse (Google Places)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 829 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3271d95b-2f8a-8198-928c-f11fa16a89de |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:33:00.000Z |
| Code | FCR - US829 Autocomplete adresse (Google Places) |
| Time Spent Activation | Non |


# User Story
**En tant que** utilisateur saisissant une adresse,
**je veux** avoir de l'autocomplétion intelligente,
**afin de** gagner du temps et éviter les erreurs.

---


# Périmètre
- Composant partagé utilisé dans : création bâtiment, création tiers, paramètres workspace
- Intégration Google Places Autocomplete API
- Remplissage auto : rue, complément, CP, ville
- Récupération coordonnées GPS (latitude/longitude) pour la vue carte
- Fallback : saisie manuelle si pas de connexion ou résultat non trouvé