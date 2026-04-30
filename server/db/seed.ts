import { pool } from './index.js'
import bcrypt from 'bcryptjs'
import { typePieces } from './seed-data/type-pieces.js'
import { catalogueItems, valeursReferentiel } from './seed-data/catalogue-items.js'
import { templatePieceItems } from './seed-data/template-piece-items.js'

async function seed() {
  console.log('[seed] Starting seed...')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // ========================================
    // 1. Demo workspace + admin
    // ========================================
    const wsResult = await client.query(
      `INSERT INTO workspace (nom, type_workspace, statut, email, siret)
       VALUES ('Flat Checker', 'societe_edl', 'actif', 'contact@flatchecker.fr', '12345678901234')
       ON CONFLICT (nom) DO NOTHING RETURNING id`
    )
    let workspaceId: string
    if (wsResult.rows.length > 0) {
      workspaceId = wsResult.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM workspace WHERE nom = 'Flat Checker'`)
      workspaceId = existing.rows[0].id
    }
    console.log('[seed] Workspace:', workspaceId)

    const passwordHash = await bcrypt.hash('Admin1234', 12)
    const userResult = await client.query(
      `INSERT INTO utilisateur (email, nom, prenom, password_hash)
       VALUES ('admin@flatchecker.fr', 'Admin', 'Flat Checker', $1)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [passwordHash]
    )
    let adminId: string
    if (userResult.rows.length > 0) {
      adminId = userResult.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM utilisateur WHERE email = 'admin@flatchecker.fr'`)
      adminId = existing.rows[0].id
    }
    await client.query(
      `INSERT INTO workspace_user (workspace_id, user_id, role)
       VALUES ($1, $2, 'admin') ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspaceId, adminId]
    )
    console.log('[seed] Admin:', adminId)

    // ========================================
    // 2. Sample buildings + lots + tiers
    // ========================================
    const buildings = [
      { designation: 'Résidence Les Lilas', type: 'immeuble', nb_etages: 5 },
      { designation: 'Maison Dupont', type: 'maison', nb_etages: 2 },
      { designation: 'Immeuble Victor Hugo', type: 'immeuble', nb_etages: 8 },
      { designation: 'Résidence Montmartre', type: 'immeuble', nb_etages: 6 },
      { designation: 'Villa Beausoleil', type: 'maison', nb_etages: 1 },
      { designation: 'Le Marais Loft', type: 'immeuble', nb_etages: 4 },
      { designation: 'Résidence Belleville', type: 'immeuble', nb_etages: 7 },
      { designation: 'Pavillon Vincennes', type: 'maison', nb_etages: 2 },
      { designation: 'Tour Défense Sud', type: 'immeuble', nb_etages: 12 },
      { designation: 'Immeuble Nation', type: 'mixte', nb_etages: 5 },
      { designation: 'Résidence Bastille', type: 'immeuble', nb_etages: 6 },
      { designation: 'Maison Charenton', type: 'maison', nb_etages: 2 },
    ]
    const buildingIds: string[] = []
    for (const b of buildings) {
      const res = await client.query(
        `INSERT INTO batiment (workspace_id, designation, type, nb_etages)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [workspaceId, b.designation, b.type, b.nb_etages]
      )
      buildingIds.push(res.rows[0].id)
    }

    const addresses = [
      { batiment_id: buildingIds[0], rue: '12 Rue des Lilas', code_postal: '75011', ville: 'Paris', lat: 48.8601, lng: 2.3815 },
      { batiment_id: buildingIds[1], rue: '45 Avenue de la République', code_postal: '92100', ville: 'Boulogne-Billancourt', lat: 48.8396, lng: 2.2399 },
      { batiment_id: buildingIds[2], rue: '8 Boulevard Victor Hugo', code_postal: '75015', ville: 'Paris', lat: 48.8425, lng: 2.2920 },
      { batiment_id: buildingIds[3], rue: '23 Rue Lepic', code_postal: '75018', ville: 'Paris', lat: 48.8847, lng: 2.3334 },
      { batiment_id: buildingIds[4], rue: '7 Allée des Tilleuls', code_postal: '92130', ville: 'Issy-les-Moulineaux', lat: 48.8236, lng: 2.2700 },
      { batiment_id: buildingIds[5], rue: '56 Rue de Turenne', code_postal: '75003', ville: 'Paris', lat: 48.8612, lng: 2.3636 },
      { batiment_id: buildingIds[6], rue: '110 Boulevard de Belleville', code_postal: '75020', ville: 'Paris', lat: 48.8708, lng: 2.3844 },
      { batiment_id: buildingIds[7], rue: '15 Rue de Fontenay', code_postal: '94300', ville: 'Vincennes', lat: 48.8480, lng: 2.4388 },
      { batiment_id: buildingIds[8], rue: '2 Place de la Défense', code_postal: '92800', ville: 'Puteaux', lat: 48.8920, lng: 2.2380 },
      { batiment_id: buildingIds[9], rue: '35 Rue du Faubourg Saint-Antoine', code_postal: '75011', ville: 'Paris', lat: 48.8510, lng: 2.3720 },
      { batiment_id: buildingIds[10], rue: '18 Rue de la Roquette', code_postal: '75011', ville: 'Paris', lat: 48.8560, lng: 2.3740 },
      { batiment_id: buildingIds[11], rue: '42 Rue de Paris', code_postal: '94220', ville: 'Charenton-le-Pont', lat: 48.8230, lng: 2.4060 },
    ]
    for (const a of addresses) {
      await client.query(
        `INSERT INTO adresse_batiment (batiment_id, type, rue, code_postal, ville, latitude, longitude, ordre)
         VALUES ($1, 'principale', $2, $3, $4, $5, $6, 1)`,
        [a.batiment_id, a.rue, a.code_postal, a.ville, a.lat, a.lng]
      )
    }

    const lots = [
      // Résidence Les Lilas (0)
      { batiment_id: buildingIds[0], designation: 'Appartement 201', type_bien: 'appartement', etage: '2', surface: 65, meuble: false, nb_pieces: 'T3' },
      { batiment_id: buildingIds[0], designation: 'Appartement 302', type_bien: 'appartement', etage: '3', surface: 42, meuble: true, nb_pieces: 'T2' },
      { batiment_id: buildingIds[0], designation: 'Appartement 101', type_bien: 'appartement', etage: '1', surface: 78, meuble: false, nb_pieces: 'T4' },
      // Maison Dupont (1)
      { batiment_id: buildingIds[1], designation: 'Maison Dupont', type_bien: 'maison', etage: 'RDC', surface: 120, meuble: false, nb_pieces: 'T5' },
      // Immeuble Victor Hugo (2)
      { batiment_id: buildingIds[2], designation: 'Bureau 4A', type_bien: 'local_commercial', etage: '4', surface: 55, meuble: true, nb_pieces: 'autre' },
      // Résidence Montmartre (3)
      { batiment_id: buildingIds[3], designation: 'Studio 1A', type_bien: 'studio', etage: '1', surface: 22, meuble: true, nb_pieces: 'studio' },
      { batiment_id: buildingIds[3], designation: 'Appartement 3B', type_bien: 'appartement', etage: '3', surface: 58, meuble: false, nb_pieces: 'T3' },
      { batiment_id: buildingIds[3], designation: 'Appartement 5C', type_bien: 'appartement', etage: '5', surface: 72, meuble: false, nb_pieces: 'T4' },
      // Villa Beausoleil (4)
      { batiment_id: buildingIds[4], designation: 'Villa Beausoleil', type_bien: 'maison', etage: 'RDC', surface: 145, meuble: false, nb_pieces: 'T6' },
      // Le Marais Loft (5)
      { batiment_id: buildingIds[5], designation: 'Loft 2A', type_bien: 'appartement', etage: '2', surface: 95, meuble: true, nb_pieces: 'T3' },
      { batiment_id: buildingIds[5], designation: 'Studio 1B', type_bien: 'studio', etage: '1', surface: 28, meuble: true, nb_pieces: 'studio' },
      // Résidence Belleville (6)
      { batiment_id: buildingIds[6], designation: 'Appartement 202', type_bien: 'appartement', etage: '2', surface: 48, meuble: false, nb_pieces: 'T2' },
      { batiment_id: buildingIds[6], designation: 'Appartement 601', type_bien: 'appartement', etage: '6', surface: 82, meuble: false, nb_pieces: 'T4' },
      // Pavillon Vincennes (7)
      { batiment_id: buildingIds[7], designation: 'Pavillon Vincennes', type_bien: 'maison', etage: 'RDC', surface: 110, meuble: false, nb_pieces: 'T5' },
      // Tour Défense Sud (8)
      { batiment_id: buildingIds[8], designation: 'Bureau 8B', type_bien: 'local_commercial', etage: '8', surface: 120, meuble: true, nb_pieces: 'autre' },
      // Immeuble Nation (9)
      { batiment_id: buildingIds[9], designation: 'Appartement 3A', type_bien: 'appartement', etage: '3', surface: 55, meuble: false, nb_pieces: 'T2' },
      { batiment_id: buildingIds[9], designation: 'Local Commercial RDC', type_bien: 'local_commercial', etage: 'RDC', surface: 90, meuble: false, nb_pieces: 'autre' },
      // Résidence Bastille (10)
      { batiment_id: buildingIds[10], designation: 'Appartement 4D', type_bien: 'appartement', etage: '4', surface: 38, meuble: true, nb_pieces: 'T1' },
      { batiment_id: buildingIds[10], designation: 'Appartement 1A', type_bien: 'appartement', etage: '1', surface: 62, meuble: false, nb_pieces: 'T3' },
      // Maison Charenton (11)
      { batiment_id: buildingIds[11], designation: 'Maison Charenton', type_bien: 'maison', etage: 'RDC', surface: 98, meuble: false, nb_pieces: 'T4' },
    ]
    const lotIds: string[] = []
    for (const l of lots) {
      const res = await client.query(
        `INSERT INTO lot (workspace_id, batiment_id, designation, type_bien, etage, surface, meuble, nb_pieces)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [workspaceId, l.batiment_id, l.designation, l.type_bien, l.etage, l.surface, l.meuble, l.nb_pieces]
      )
      lotIds.push(res.rows[0].id)
    }

    const tiers = [
      { type: 'physique', nom: 'Martin', prenom: 'Jean', email: 'jean.martin@email.com', tel: '06 12 34 56 78' },
      { type: 'physique', nom: 'Dubois', prenom: 'Sophie', email: 'sophie.dubois@email.com', tel: '06 98 76 54 32' },
      { type: 'morale', nom: 'SCI Les Hêtres', raison_sociale: 'SCI Les Hêtres', siren: '123456789', email: 'contact@scileshetres.fr' },
      { type: 'physique', nom: 'Petit', prenom: 'Lucas', email: 'lucas.petit@email.com' },
      { type: 'physique', nom: 'Leroy', prenom: 'Emma', email: 'emma.leroy@email.com', tel: '06 11 22 33 44' },
      { type: 'physique', nom: 'Bernard', prenom: 'Thomas', email: 'thomas.bernard@email.com', tel: '06 55 66 77 88' },
      { type: 'morale', nom: 'SCI Haussmann', raison_sociale: 'SCI Haussmann', siren: '987654321', email: 'gestion@scihaussmann.fr' },
      { type: 'physique', nom: 'Garcia', prenom: 'Marie', email: 'marie.garcia@email.com', tel: '06 22 33 44 55' },
      { type: 'physique', nom: 'Roux', prenom: 'Antoine', email: 'antoine.roux@email.com' },
      { type: 'physique', nom: 'Fournier', prenom: 'Camille', email: 'camille.fournier@email.com', tel: '06 77 88 99 00' },
    ]
    const tiersIds: string[] = []
    for (const t of tiers) {
      const res = await client.query(
        `INSERT INTO tiers (workspace_id, type_personne, nom, prenom, raison_sociale, siren, email, tel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [workspaceId, t.type, t.nom, t.prenom ?? null, (t as any).raison_sociale ?? null, (t as any).siren ?? null, t.email ?? null, t.tel ?? null]
      )
      tiersIds.push(res.rows[0].id)
    }

    // Link proprietaires to lots
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[0], tiersIds[0]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[1], tiersIds[2]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[3], tiersIds[1]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[5], tiersIds[4]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[6], tiersIds[6]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[7], tiersIds[6]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[8], tiersIds[5]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[9], tiersIds[2]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[10], tiersIds[7]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[11], tiersIds[8]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[12], tiersIds[8]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[13], tiersIds[9]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[14], tiersIds[6]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[15], tiersIds[0]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[16], tiersIds[7]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[17], tiersIds[4]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[18], tiersIds[5]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[19], tiersIds[9]])

    console.log(`[seed] Demo: ${buildings.length} bâtiments, ${lots.length} lots, ${tiers.length} tiers`)

    // ========================================
    // 3. Type Pieces (plateforme)
    // ========================================
    let piecesInserted = 0
    const pieceIdMap = new Map<string, string>()

    for (const p of typePieces) {
      const res = await client.query(
        `INSERT INTO type_piece (workspace_id, nom, icon, categorie_piece, source, ordre_affichage)
         VALUES (NULL, $1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING RETURNING id`,
        [p.nom, p.icon, p.categorie_piece, p.source, p.ordre_affichage]
      )
      if (res.rows.length > 0) {
        pieceIdMap.set(p.nom, res.rows[0].id)
        piecesInserted++
      } else {
        const existing = await client.query(`SELECT id FROM type_piece WHERE nom = $1 AND workspace_id IS NULL`, [p.nom])
        if (existing.rows.length > 0) pieceIdMap.set(p.nom, existing.rows[0].id)
      }
    }
    console.log(`[seed] TypePiece: ${piecesInserted} inserted (${typePieces.length} total)`)

    // ========================================
    // 4. Catalogue Items (plateforme)
    // ========================================
    // First pass: top-level items (parent_nom = null)
    let itemsInserted = 0
    const itemIdMap = new Map<string, string>()

    const topLevel = catalogueItems.filter(i => i.parent_nom === null)
    const subItems = catalogueItems.filter(i => i.parent_nom !== null)

    for (const item of topLevel) {
      const res = await client.query(
        `INSERT INTO catalogue_item (workspace_id, parent_item_id, nom, categorie, contexte, source, ordre_affichage)
         VALUES (NULL, NULL, $1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING RETURNING id`,
        [item.nom, item.categorie, item.contexte, item.source, item.ordre_affichage]
      )
      if (res.rows.length > 0) {
        itemIdMap.set(item.nom, res.rows[0].id)
        itemsInserted++
      } else {
        const existing = await client.query(`SELECT id FROM catalogue_item WHERE nom = $1 AND workspace_id IS NULL AND parent_item_id IS NULL`, [item.nom])
        if (existing.rows.length > 0) itemIdMap.set(item.nom, existing.rows[0].id)
      }
    }

    // Second pass: sub-items
    for (const item of subItems) {
      const parentId = itemIdMap.get(item.parent_nom!)
      if (!parentId) {
        console.warn(`[seed] Skipping sub-item "${item.nom}" — parent "${item.parent_nom}" not found`)
        continue
      }
      const res = await client.query(
        `INSERT INTO catalogue_item (workspace_id, parent_item_id, nom, categorie, contexte, source, ordre_affichage)
         VALUES (NULL, $1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING RETURNING id`,
        [parentId, item.nom, item.categorie, item.contexte, item.source, item.ordre_affichage]
      )
      if (res.rows.length > 0) {
        itemIdMap.set(item.nom, res.rows[0].id)
        itemsInserted++
      }
    }
    console.log(`[seed] CatalogueItem: ${itemsInserted} inserted (${catalogueItems.length} total)`)

    // ========================================
    // 5. Valeurs Referentiel (plateforme)
    // ========================================
    let refsInserted = 0
    for (const v of valeursReferentiel) {
      const itemId = itemIdMap.get(v.item_nom)
      if (!itemId) continue
      // Map type to critere enum
      const critere = v.type === 'caracteristique' ? 'caracteristiques' : 'degradations'
      const res = await client.query(
        `INSERT INTO valeur_referentiel (catalogue_item_id, workspace_id, critere, valeur, source, ordre_affichage)
         VALUES ($1, NULL, $2, $3, 'plateforme', $4)
         ON CONFLICT DO NOTHING RETURNING id`,
        [itemId, critere, v.valeur, v.ordre_affichage]
      )
      if (res.rows.length > 0) refsInserted++
    }
    console.log(`[seed] ValeurReferentiel: ${refsInserted} inserted (${valeursReferentiel.length} total)`)

    // ========================================
    // 6. Template Piece-Items (plateforme)
    // ========================================
    let templatesInserted = 0
    for (const t of templatePieceItems) {
      const pieceId = pieceIdMap.get(t.piece_nom)
      const itemId = itemIdMap.get(t.item_nom)
      if (!pieceId || !itemId) {
        if (!pieceId) console.warn(`[seed] Template skip — piece "${t.piece_nom}" not found`)
        if (!itemId) console.warn(`[seed] Template skip — item "${t.item_nom}" not found`)
        continue
      }
      const res = await client.query(
        `INSERT INTO template_piece_item (type_piece_id, catalogue_item_id, workspace_id, quantite_defaut, ordre_affichage)
         VALUES ($1, $2, NULL, $3, $4)
         ON CONFLICT DO NOTHING RETURNING id`,
        [pieceId, itemId, t.quantite_defaut, templatesInserted + 1]
      )
      if (res.rows.length > 0) templatesInserted++
    }
    console.log(`[seed] TemplatePieceItem: ${templatesInserted} inserted (${templatePieceItems.length} total)`)

    // ========================================
    // 7. Config Critere Categorie (defaults pour workspace Flat Checker)
    // ========================================
    const categories = [
      'revetement_sol', 'revetement_mur', 'revetement_plafond', 'menuiserie',
      'plomberie', 'electricite', 'chauffage', 'ventilation', 'electromenager',
      'mobilier', 'equipement', 'serrurerie', 'vitrage', 'exterieur', 'divers',
      'structure', 'securite'
    ]
    let configsInserted = 0
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO config_critere_categorie
         (workspace_id, categorie, etat_general, proprete, photos, caracteristiques, couleur, degradations, fonctionnement, quantite)
         VALUES ($1, $2, 'obligatoire', 'recommande', 'recommande', 'optionnel', 'optionnel', 'recommande', 'optionnel', 'masque')
         ON CONFLICT (workspace_id, categorie) DO NOTHING RETURNING id`,
        [workspaceId, cat]
      )
      if (res.rows.length > 0) configsInserted++
    }
    console.log(`[seed] ConfigCritereCategorie: ${configsInserted} inserted (${categories.length} categories)`)

    // ========================================
    // 8. Techniciens + Gestionnaire
    // ========================================
    const techHash = await bcrypt.hash('Tech1234', 12)
    const techResult = await client.query(
      `INSERT INTO utilisateur (email, nom, prenom, password_hash)
       VALUES ('tech@flatchecker.fr', 'Bernard', 'Marc', $1)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [techHash]
    )
    let techId: string
    if (techResult.rows.length > 0) {
      techId = techResult.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM utilisateur WHERE email = 'tech@flatchecker.fr'`)
      techId = existing.rows[0].id
    }
    await client.query(
      `INSERT INTO workspace_user (workspace_id, user_id, role)
       VALUES ($1, $2, 'technicien') ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspaceId, techId]
    )

    const tech2Hash = await bcrypt.hash('Tech1234', 12)
    const tech2Result = await client.query(
      `INSERT INTO utilisateur (email, nom, prenom, password_hash)
       VALUES ('julie@flatchecker.fr', 'Moreau', 'Julie', $1)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [tech2Hash]
    )
    let tech2Id: string
    if (tech2Result.rows.length > 0) {
      tech2Id = tech2Result.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM utilisateur WHERE email = 'julie@flatchecker.fr'`)
      tech2Id = existing.rows[0].id
    }
    await client.query(
      `INSERT INTO workspace_user (workspace_id, user_id, role)
       VALUES ($1, $2, 'technicien') ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspaceId, tech2Id]
    )

    // Third technicien
    const tech3Hash = await bcrypt.hash('Tech1234', 12)
    const tech3Result = await client.query(
      `INSERT INTO utilisateur (email, nom, prenom, password_hash)
       VALUES ('pierre@flatchecker.fr', 'Durand', 'Pierre', $1)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [tech3Hash]
    )
    let tech3Id: string
    if (tech3Result.rows.length > 0) {
      tech3Id = tech3Result.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM utilisateur WHERE email = 'pierre@flatchecker.fr'`)
      tech3Id = existing.rows[0].id
    }
    await client.query(
      `INSERT INTO workspace_user (workspace_id, user_id, role)
       VALUES ($1, $2, 'technicien') ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspaceId, tech3Id]
    )
    console.log('[seed] Techniciens:', techId, tech2Id, tech3Id)

    // Helper: generate mission reference
    let missionSeq = 0
    function nextRef() {
      missionSeq++
      return `M-2026-${String(missionSeq).padStart(4, '0')}`
    }

    // Helper: insert mission + EDL + optional tech + optional locataire
    async function createMission(opts: {
      lotIdx: number, date: string, heure_debut?: string, heure_fin?: string,
      statut: string, avec_inventaire: boolean,
      techUserId?: string, techStatut?: string,
      edlSens: string, edlStatut?: string, edlType?: string,
      commentaire?: string, motif_annulation?: string, motif_infructueux?: string,
      locataireIdx?: number, locataireRole?: string,
      date_realisation?: string, date_signature?: string,
    }) {
      const mRes = await client.query(
        `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire, commentaire, motif_annulation, motif_infructueux)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [workspaceId, lotIds[opts.lotIdx], adminId, nextRef(), opts.date,
         opts.heure_debut ?? null, opts.heure_fin ?? null, opts.statut,
         opts.avec_inventaire, opts.commentaire ?? null, opts.motif_annulation ?? null, opts.motif_infructueux ?? null]
      )
      const missionId = mRes.rows[0].id

      if (opts.techUserId) {
        await client.query(
          `INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, $3)`,
          [missionId, opts.techUserId, opts.techStatut ?? 'accepte']
        )
      }

      const edlRes = await client.query(
        `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [workspaceId, missionId, lotIds[opts.lotIdx], opts.techUserId ?? null,
         opts.edlType ?? 'edl', opts.edlSens, opts.edlStatut ?? 'brouillon',
         opts.date_realisation ?? null, opts.date_signature ?? null]
      )

      if (opts.avec_inventaire) {
        await client.query(
          `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut)
           VALUES ($1, $2, $3, $4, 'inventaire', $5, 'brouillon')`,
          [workspaceId, missionId, lotIds[opts.lotIdx], opts.techUserId ?? null, opts.edlSens]
        )
      }

      if (opts.locataireIdx !== undefined) {
        await client.query(
          `INSERT INTO edl_locataire (edl_id, tiers_id, role_locataire) VALUES ($1, $2, $3)`,
          [edlRes.rows[0].id, tiersIds[opts.locataireIdx], opts.locataireRole ?? 'entrant']
        )
      }

      return missionId
    }

    // Helper: compute date relative to today
    const today = new Date()
    function dateOffset(days: number): string {
      const d = new Date(today)
      d.setDate(d.getDate() + days)
      return d.toISOString().slice(0, 10)
    }
    const todayStr = dateOffset(0)

    // ── Missions: Today ──
    await createMission({ lotIdx: 0, date: todayStr, heure_debut: '09:00', heure_fin: '12:00', statut: 'planifiee', avec_inventaire: true, techUserId: techId, edlSens: 'sortie', commentaire: 'Changement de locataire - entrée + sortie', locataireIdx: 3, locataireRole: 'sortant' })
    const todayMissions = [
      { lotIdx: 5, h1: '08:30', h2: '10:00', statut: 'planifiee', inv: false, tech: techId, sens: 'entree', loc: 4 },
      { lotIdx: 9, h1: '10:30', h2: '12:00', statut: 'planifiee', inv: true, tech: tech2Id, sens: 'entree', loc: 7 },
      { lotIdx: 3, h1: '14:00', h2: '15:30', statut: 'planifiee', inv: false, tech: null, sens: 'sortie' },
      { lotIdx: 11, h1: '14:00', h2: '16:00', statut: 'planifiee', inv: false, tech: tech3Id, sens: 'entree', loc: 8 },
      { lotIdx: 17, h1: '16:00', h2: '17:30', statut: 'planifiee', inv: false, tech: techId, sens: 'sortie', loc: 5 },
    ]
    for (const tm of todayMissions) {
      const mRes = await client.query(
        `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8) RETURNING id`,
        [workspaceId, lotIds[tm.lotIdx], adminId, nextRef(), tm.h1, tm.h2, tm.statut, tm.inv]
      )
      if (tm.tech) {
        await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, 'accepte')`, [mRes.rows[0].id, tm.tech])
      }
      const edlRes = await client.query(
        `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut) VALUES ($1, $2, $3, $4, 'edl', $5, 'brouillon') RETURNING id`,
        [workspaceId, mRes.rows[0].id, lotIds[tm.lotIdx], tm.tech, tm.sens]
      )
      if (tm.inv) {
        await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut) VALUES ($1, $2, $3, $4, 'inventaire', $5, 'brouillon')`, [workspaceId, mRes.rows[0].id, lotIds[tm.lotIdx], tm.tech, tm.sens])
      }
      if (tm.loc !== undefined) {
        await client.query(`INSERT INTO edl_locataire (edl_id, tiers_id, role_locataire) VALUES ($1, $2, $3)`, [edlRes.rows[0].id, tiersIds[tm.loc], tm.sens === 'entree' ? 'entrant' : 'sortant'])
      }
    }

    // ── Missions: This week (upcoming) ──
    const weekMissions = [
      { lotIdx: 1, days: 1, h1: '09:00', h2: '11:00', statut: 'planifiee', inv: true, tech: tech2Id, sens: 'sortie', loc: 3 },
      { lotIdx: 6, days: 1, h1: '14:00', h2: '16:00', statut: 'planifiee', inv: false, tech: techId, sens: 'entree', loc: 8 },
      { lotIdx: 2, days: 2, h1: '08:00', h2: '10:00', statut: 'planifiee', inv: false, tech: null, sens: 'entree' },
      { lotIdx: 12, days: 2, h1: '10:30', h2: '12:00', statut: 'planifiee', inv: false, tech: tech3Id, sens: 'sortie', loc: 9 },
      { lotIdx: 7, days: 3, h1: '09:00', h2: '11:00', statut: 'planifiee', inv: true, tech: techId, sens: 'entree', loc: 4 },
      { lotIdx: 15, days: 3, h1: '14:00', h2: '16:00', statut: 'planifiee', inv: false, tech: null, sens: 'sortie' },
      { lotIdx: 4, days: 4, h1: '08:30', h2: '10:30', statut: 'planifiee', inv: false, tech: tech2Id, techStatut: 'en_attente', sens: 'sortie' },
      { lotIdx: 13, days: 4, h1: '14:00', h2: '16:00', statut: 'planifiee', inv: false, tech: tech3Id, sens: 'entree', loc: 0 },
    ]
    for (const wm of weekMissions) {
      const mRes = await client.query(
        `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire)
         VALUES ($1, $2, $3, $4, CURRENT_DATE + $5::int * INTERVAL '1 day', $6, $7, $8, $9) RETURNING id`,
        [workspaceId, lotIds[wm.lotIdx], adminId, nextRef(), wm.days, wm.h1, wm.h2, wm.statut, wm.inv]
      )
      if (wm.tech) {
        await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, $3)`, [mRes.rows[0].id, wm.tech, (wm as any).techStatut ?? 'accepte'])
      }
      const edlRes = await client.query(
        `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut) VALUES ($1, $2, $3, $4, 'edl', $5, 'brouillon') RETURNING id`,
        [workspaceId, mRes.rows[0].id, lotIds[wm.lotIdx], wm.tech, wm.sens]
      )
      if (wm.inv) {
        await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut) VALUES ($1, $2, $3, $4, 'inventaire', $5, 'brouillon')`, [workspaceId, mRes.rows[0].id, lotIds[wm.lotIdx], wm.tech, wm.sens])
      }
      if (wm.loc !== undefined) {
        await client.query(`INSERT INTO edl_locataire (edl_id, tiers_id, role_locataire) VALUES ($1, $2, $3)`, [edlRes.rows[0].id, tiersIds[wm.loc], wm.sens === 'entree' ? 'entrant' : 'sortant'])
      }
    }

    // ── Missions: Next 2 weeks ──
    const futureMissions = [
      { lotIdx: 8, days: 5, h1: '09:30', h2: '11:30', statut: 'planifiee', inv: true, tech: techId, sens: 'entree' },
      { lotIdx: 10, days: 5, h1: '14:00', h2: '15:30', statut: 'planifiee', inv: false, tech: null, sens: 'entree' },
      { lotIdx: 0, days: 7, h1: '14:00', h2: '16:00', statut: 'planifiee', inv: false, tech: techId, sens: 'sortie', comment: 'Reporté à la demande du propriétaire' },
      { lotIdx: 14, days: 7, h1: '09:00', h2: '11:00', statut: 'planifiee', inv: false, tech: tech2Id, techStatut: 'en_attente', sens: 'entree' },
      { lotIdx: 16, days: 8, h1: '10:00', h2: '12:00', statut: 'planifiee', inv: false, tech: null, sens: 'sortie' },
      { lotIdx: 19, days: 9, h1: '08:00', h2: '10:00', statut: 'planifiee', inv: true, tech: null, sens: 'entree' },
      { lotIdx: 1, days: 10, h1: '10:00', h2: '12:00', statut: 'planifiee', inv: true, tech: null, sens: 'entree' },
      { lotIdx: 18, days: 12, h1: '09:00', h2: '11:00', statut: 'planifiee', inv: false, tech: null, sens: 'sortie' },
      { lotIdx: 7, days: 14, h1: '14:00', h2: '16:00', statut: 'planifiee', inv: false, tech: null, sens: 'entree' },
    ]
    for (const fm of futureMissions) {
      const mRes = await client.query(
        `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire, commentaire)
         VALUES ($1, $2, $3, $4, CURRENT_DATE + $5::int * INTERVAL '1 day', $6, $7, $8, $9, $10) RETURNING id`,
        [workspaceId, lotIds[fm.lotIdx], adminId, nextRef(), fm.days, fm.h1, fm.h2, fm.statut, fm.inv, (fm as any).comment ?? null]
      )
      if (fm.tech) {
        await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, $3)`, [mRes.rows[0].id, fm.tech, (fm as any).techStatut ?? 'accepte'])
      }
      await client.query(
        `INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut) VALUES ($1, $2, $3, $4, 'edl', $5, 'brouillon')`,
        [workspaceId, mRes.rows[0].id, lotIds[fm.lotIdx], fm.tech, fm.sens]
      )
      if (fm.inv) {
        await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut) VALUES ($1, $2, $3, $4, 'inventaire', $5, 'brouillon')`, [workspaceId, mRes.rows[0].id, lotIds[fm.lotIdx], fm.tech, fm.sens])
      }
    }

    // ── Missions: Past (terminées & annulées) ──
    // Terminée: yesterday
    const mYesterday = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire, commentaire)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '1 day', '09:00', '11:00', 'terminee', false, 'RAS - état correct') RETURNING id`,
      [workspaceId, lotIds[9], adminId, nextRef()]
    )
    await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, 'accepte')`, [mYesterday.rows[0].id, tech2Id])
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature) VALUES ($1, $2, $3, $4, 'edl', 'entree', 'signe', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day')`, [workspaceId, mYesterday.rows[0].id, lotIds[9], tech2Id])

    // Terminée: 3 days ago
    const m3d = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire, commentaire)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '3 days', '10:00', '11:30', 'terminee', false, 'Quelques traces d''usure normales') RETURNING id`,
      [workspaceId, lotIds[1], adminId, nextRef()]
    )
    await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, 'accepte')`, [m3d.rows[0].id, tech2Id])
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature) VALUES ($1, $2, $3, $4, 'edl', 'sortie', 'signe', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days')`, [workspaceId, m3d.rows[0].id, lotIds[1], tech2Id])

    // Terminée: last week
    const mLastWeek = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire, commentaire)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '6 days', '14:00', '16:00', 'terminee', true, 'Inventaire complet réalisé') RETURNING id`,
      [workspaceId, lotIds[6], adminId, nextRef()]
    )
    await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, 'accepte')`, [mLastWeek.rows[0].id, techId])
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature) VALUES ($1, $2, $3, $4, 'edl', 'entree', 'signe', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE - INTERVAL '6 days')`, [workspaceId, mLastWeek.rows[0].id, lotIds[6], techId])
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature) VALUES ($1, $2, $3, $4, 'inventaire', 'entree', 'signe', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE - INTERVAL '6 days')`, [workspaceId, mLastWeek.rows[0].id, lotIds[6], techId])

    // Terminée: 2 weeks ago
    const m2w = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '14 days', '09:00', '11:00', 'terminee', false) RETURNING id`,
      [workspaceId, lotIds[13], adminId, nextRef()]
    )
    await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, 'accepte')`, [m2w.rows[0].id, tech3Id])
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature) VALUES ($1, $2, $3, $4, 'edl', 'sortie', 'signe', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '14 days')`, [workspaceId, m2w.rows[0].id, lotIds[13], tech3Id])

    // Terminée: March
    const mMarch = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire)
       VALUES ($1, $2, $3, $4, '2026-03-15', '09:00', '11:00', 'terminee', false) RETURNING id`,
      [workspaceId, lotIds[3], adminId, nextRef()]
    )
    await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, 'accepte')`, [mMarch.rows[0].id, tech2Id])
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature) VALUES ($1, $2, $3, $4, 'edl', 'entree', 'signe', '2026-03-15', '2026-03-15')`, [workspaceId, mMarch.rows[0].id, lotIds[3], tech2Id])

    // Terminée: February
    const mFeb = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, heure_debut, heure_fin, statut, avec_inventaire)
       VALUES ($1, $2, $3, $4, '2026-02-20', '10:00', '12:00', 'terminee', false) RETURNING id`,
      [workspaceId, lotIds[8], adminId, nextRef()]
    )
    await client.query(`INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation) VALUES ($1, $2, true, 'accepte')`, [mFeb.rows[0].id, techId])
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_realisation, date_signature) VALUES ($1, $2, $3, $4, 'edl', 'entree', 'signe', '2026-02-20', '2026-02-20')`, [workspaceId, mFeb.rows[0].id, lotIds[8], techId])

    // Annulée: recent
    const mAnnulee1 = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, statut, avec_inventaire, motif_annulation)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '2 days', 'annulee', false, 'Locataire absent - report demandé') RETURNING id`,
      [workspaceId, lotIds[3], adminId, nextRef()]
    )
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut) VALUES ($1, $2, $3, 'edl', 'entree', 'infructueux')`, [workspaceId, mAnnulee1.rows[0].id, lotIds[3]])

    // Annulée: old
    const mAnnulee2 = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, statut, avec_inventaire, motif_annulation)
       VALUES ($1, $2, $3, $4, '2026-03-28', 'annulee', false, 'Propriétaire a annulé la vente') RETURNING id`,
      [workspaceId, lotIds[10], adminId, nextRef()]
    )
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut) VALUES ($1, $2, $3, 'edl', 'sortie', 'infructueux')`, [workspaceId, mAnnulee2.rows[0].id, lotIds[10]])

    // Annulée: another
    const mAnnulee3 = await client.query(
      `INSERT INTO mission (workspace_id, lot_id, created_by, reference, date_planifiee, statut, avec_inventaire, motif_annulation)
       VALUES ($1, $2, $3, $4, '2026-04-05', 'annulee', false, 'Dégât des eaux - report sine die') RETURNING id`,
      [workspaceId, lotIds[15], adminId, nextRef()]
    )
    await client.query(`INSERT INTO edl_inventaire (workspace_id, mission_id, lot_id, type, sens, statut) VALUES ($1, $2, $3, 'edl', 'entree', 'infructueux')`, [workspaceId, mAnnulee3.rows[0].id, lotIds[15]])

    // Indisponibilités technicien
    await client.query(
      `INSERT INTO indisponibilite_technicien (user_id, workspace_id, date_debut, date_fin, est_journee_entiere, motif)
       VALUES ($1, $2, '2026-04-20', '2026-04-22', true, 'Congé')`,
      [techId, workspaceId]
    )
    await client.query(
      `INSERT INTO indisponibilite_technicien (user_id, workspace_id, date_debut, date_fin, est_journee_entiere, motif)
       VALUES ($1, $2, CURRENT_DATE + INTERVAL '8 days', CURRENT_DATE + INTERVAL '8 days', true, 'Formation')`,
      [tech2Id, workspaceId]
    )
    await client.query(
      `INSERT INTO indisponibilite_technicien (user_id, workspace_id, date_debut, date_fin, est_journee_entiere, motif)
       VALUES ($1, $2, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '17 days', true, 'Vacances')`,
      [tech3Id, workspaceId]
    )

    console.log(`[seed] Missions: ${missionSeq} missions, 3 techniciens, EDLs, clés, indisponibilités seeded`)

    await client.query('COMMIT')
    console.log('[seed] All seed data inserted successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[seed] Seed failed:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
