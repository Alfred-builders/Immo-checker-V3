// Templates email transactionnels — fallbacks codés en dur (Cadrage FC §6).
// Un workspace peut écraser n'importe lequel via la table email_template.
// Si aucune ligne custom n'existe, on utilise ce qui est défini ici.
//
// Substitution : {{variable}} → valeur (escape HTML appliqué par défaut sauf
// pour les variables marquées "html").

export type EmailTemplateCode =
  | 'mission_planifiee'
  | 'mission_creneau_modifie'
  | 'technicien_invite'
  | 'mission_tech_assigne'

export interface DefaultTemplate {
  code: EmailTemplateCode
  label: string
  description: string
  /** Variables que l'admin peut insérer dans sujet ou body. */
  variables: { name: string; description: string; example: string }[]
  sujet: string
  body_html: string
}

const COMMON_VARS = [
  { name: 'workspace_nom', description: 'Nom de la société/agence', example: 'Flat Checker' },
  { name: 'mission_reference', description: 'Référence de la mission', example: 'M-2026-0042' },
  { name: 'lot_designation', description: 'Désignation du lot', example: 'Apt 201' },
  { name: 'lot_adresse', description: 'Adresse complète du lot', example: '12 rue des Lilas, 75019 Paris' },
  { name: 'date_planifiee', description: 'Date de la mission (format long)', example: 'mardi 5 mai 2026' },
  { name: 'heure_debut', description: 'Heure de début', example: '09:00' },
  { name: 'heure_fin', description: 'Heure de fin', example: '10:30' },
  { name: 'destinataire_nom', description: 'Nom complet du destinataire', example: 'Camille Roux' },
] as const

export const DEFAULT_TEMPLATES: Record<EmailTemplateCode, DefaultTemplate> = {
  mission_planifiee: {
    code: 'mission_planifiee',
    label: 'Confirmation de rendez-vous (locataire)',
    description: 'Envoyé au locataire au passage de la mission en "Planifié" (créneau fixé).',
    variables: [...COMMON_VARS],
    sujet: 'Votre rendez-vous d\'état des lieux est confirmé — {{date_planifiee}}',
    body_html: `<p>Bonjour {{destinataire_nom}},</p>
<p>Votre rendez-vous d'état des lieux pour le bien <strong>{{lot_designation}}</strong> situé au {{lot_adresse}} est confirmé.</p>
<p><strong>Date :</strong> {{date_planifiee}}<br>
<strong>Horaire :</strong> {{heure_debut}} – {{heure_fin}}</p>
<p>Notre équipe vous contactera si un changement intervient. Merci de prévoir d'être présent à cette heure ou de désigner un mandataire.</p>
<p>Cordialement,<br>L'équipe {{workspace_nom}}</p>`,
  },
  mission_creneau_modifie: {
    code: 'mission_creneau_modifie',
    label: 'Modification du créneau (locataire et technicien)',
    description: 'Envoyé quand la date ou l\'heure de la mission est modifiée.',
    variables: [
      ...COMMON_VARS,
      { name: 'ancienne_date', description: 'Ancien créneau (date)', example: 'lundi 4 mai 2026' },
      { name: 'ancien_horaire', description: 'Ancien horaire (HH:MM-HH:MM)', example: '09:00-10:30' },
    ],
    sujet: 'Modification de votre rendez-vous — nouveau créneau {{date_planifiee}}',
    body_html: `<p>Bonjour {{destinataire_nom}},</p>
<p>Le créneau de votre rendez-vous d'état des lieux pour <strong>{{lot_designation}}</strong> ({{lot_adresse}}) a été modifié.</p>
<p><strong>Nouveau créneau :</strong> {{date_planifiee}} de {{heure_debut}} à {{heure_fin}}<br>
<strong>Ancien créneau :</strong> {{ancienne_date}} ({{ancien_horaire}})</p>
<p>Merci de votre compréhension. N'hésitez pas à nous recontacter pour toute question.</p>
<p>Cordialement,<br>L'équipe {{workspace_nom}}</p>`,
  },
  technicien_invite: {
    code: 'technicien_invite',
    label: 'Invitation technicien',
    description: 'Envoyé au technicien à l\'assignation d\'une mission.',
    variables: [
      ...COMMON_VARS,
      { name: 'app_url', description: 'Lien vers la mission (mobile/web)', example: 'https://app.flatchecker.fr/missions/...' },
    ],
    sujet: 'Nouvelle mission à valider : {{mission_reference}} — {{date_planifiee}}',
    body_html: `<p>Bonjour {{destinataire_nom}},</p>
<p>Une nouvelle mission vous a été assignée par {{workspace_nom}}.</p>
<p><strong>Référence :</strong> {{mission_reference}}<br>
<strong>Bien :</strong> {{lot_designation}} — {{lot_adresse}}<br>
<strong>Créneau :</strong> {{date_planifiee}} de {{heure_debut}} à {{heure_fin}}</p>
<p>Merci de valider votre disponibilité depuis l'application : <a href="{{app_url}}">Voir la mission</a></p>
<p>Cordialement,<br>{{workspace_nom}}</p>`,
  },
  mission_tech_assigne: {
    code: 'mission_tech_assigne',
    label: 'Coordonnées du technicien (locataire)',
    description: 'Envoyé au locataire après acceptation du technicien si l\'assignation a été faite après la planification (assignation différée).',
    variables: [
      ...COMMON_VARS,
      { name: 'technicien_nom', description: 'Nom complet du technicien', example: 'Jérôme Marchand' },
      { name: 'technicien_tel', description: 'Téléphone du technicien (si renseigné)', example: '06 12 34 56 78' },
    ],
    sujet: 'Votre technicien pour le rendez-vous du {{date_planifiee}}',
    body_html: `<p>Bonjour {{destinataire_nom}},</p>
<p>Pour votre rendez-vous d'état des lieux du <strong>{{date_planifiee}}</strong> sur le bien {{lot_designation}} ({{lot_adresse}}), notre technicien sera :</p>
<p><strong>{{technicien_nom}}</strong><br>
{{technicien_tel}}</p>
<p>Il se présentera à <strong>{{heure_debut}}</strong>. Vous pouvez le contacter directement en cas de besoin.</p>
<p>Cordialement,<br>L'équipe {{workspace_nom}}</p>`,
  },
}

export const TEMPLATE_CODES = Object.keys(DEFAULT_TEMPLATES) as EmailTemplateCode[]
