// Auto-generated from Notion knowledge sync -- do not edit manually
// Source: knowledge/notion/databases/pieces/
// Generated: 2026-03-26

export type CategoriePiece = 'vie' | 'eau_sanitaires' | 'circulations' | 'exterieur_annexes' | 'equipements' | 'autres';

export interface TypePieceSeed {
  nom: string;
  icon: string;
  categorie_piece: CategoriePiece;
  source: 'plateforme';
  ordre_affichage: number;
}

export const typePieces: TypePieceSeed[] = [

  // --- vie ---
  { nom: "Bureau", icon: "💻", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 1 },
  { nom: "Chambre", icon: "🛏️", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 2 },
  { nom: "Cuisine", icon: "🍳", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 3 },
  { nom: "Cuisine américaine", icon: "🍳", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 4 },
  { nom: "Entrée / Hall", icon: "🚪", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 5 },
  { nom: "Mezzanine", icon: "🏠", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 6 },
  { nom: "Salle à manger", icon: "🍽️", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 7 },
  { nom: "Salon / Séjour", icon: "🛋️", categorie_piece: 'vie', source: 'plateforme', ordre_affichage: 8 },

  // --- eau_sanitaires ---
  { nom: "Buanderie / Cellier", icon: "🧺", categorie_piece: 'eau_sanitaires', source: 'plateforme', ordre_affichage: 9 },
  { nom: "Salle d'eau", icon: "🚿", categorie_piece: 'eau_sanitaires', source: 'plateforme', ordre_affichage: 10 },
  { nom: "Salle de bain", icon: "🛁", categorie_piece: 'eau_sanitaires', source: 'plateforme', ordre_affichage: 11 },
  { nom: "WC / Toilettes", icon: "🚽", categorie_piece: 'eau_sanitaires', source: 'plateforme', ordre_affichage: 12 },

  // --- circulations ---
  { nom: "Couloir / Dégagement", icon: "↔️", categorie_piece: 'circulations', source: 'plateforme', ordre_affichage: 13 },
  { nom: "Dressing", icon: "👔", categorie_piece: 'circulations', source: 'plateforme', ordre_affichage: 14 },
  { nom: "Placard / Rangement", icon: "🗄️", categorie_piece: 'circulations', source: 'plateforme', ordre_affichage: 15 },

  // --- exterieur_annexes ---
  { nom: "Balcon", icon: "🌿", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 16 },
  { nom: "Cabanon / Abri de jardin", icon: "🏚️", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 17 },
  { nom: "Cave", icon: "📦", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 18 },
  { nom: "Espaces verts (transverse)", icon: "🌻", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 19 },
  { nom: "Extérieur / Bâti (transverse)", icon: "🏠", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 20 },
  { nom: "Garage", icon: "🚗", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 21 },
  { nom: "Grenier / Combles", icon: "🏚️", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 22 },
  { nom: "Jardin / Cour", icon: "🌳", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 23 },
  { nom: "Loggia", icon: "🪟", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 24 },
  { nom: "Parking / Box", icon: "🅿️", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 25 },
  { nom: "Terrasse", icon: "☀️", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 26 },
  { nom: "Véranda", icon: "🏡", categorie_piece: 'exterieur_annexes', source: 'plateforme', ordre_affichage: 27 },

  // --- equipements ---
  { nom: "Équipements généraux (transverse)", icon: "🛠️", categorie_piece: 'equipements', source: 'plateforme', ordre_affichage: 28 },
  { nom: "Escalier", icon: "🪜", categorie_piece: 'equipements', source: 'plateforme', ordre_affichage: 29 },
  { nom: "Palier", icon: "🚪", categorie_piece: 'equipements', source: 'plateforme', ordre_affichage: 30 },
];
