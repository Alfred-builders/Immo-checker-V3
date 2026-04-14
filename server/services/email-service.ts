import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.FROM_EMAIL || 'ImmoChecker <onboarding@resend.dev>'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export async function sendInvitationEmail(email: string, token: string, workspaceName: string, role: string) {
  const link = `${FRONTEND_URL}/register/${token}`

  if (!resend) {
    console.log(`[email] (Resend not configured) Invitation for ${email}: ${link}`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Invitation a rejoindre ${workspaceName} sur ImmoChecker`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #d97706;">ImmoChecker</h2>
        <p>Vous etes invite a rejoindre <strong>${workspaceName}</strong> en tant que <strong>${role}</strong>.</p>
        <a href="${link}" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Accepter l'invitation
        </a>
        <p style="color: #888; font-size: 12px;">Ce lien expire dans 7 jours.</p>
      </div>
    `,
  })
}

// US-595: notify technicien when assigned to a mission
export async function sendEmailTechnicienAssigne(
  email: string,
  prenom: string,
  mission: { reference: string; date_planifiee: string; heure_debut?: string | null; lot_designation: string; adresse?: string | null }
) {
  const dateStr = new Date(mission.date_planifiee).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const heureStr = mission.heure_debut ? ` à ${mission.heure_debut}` : ''
  if (!resend) {
    console.log(`[email] (Resend not configured) Mission assignée ${mission.reference} → ${email}`)
    return
  }
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Mission ${mission.reference} — Nouvelle assignation`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #d97706;">ImmoChecker</h2>
        <p>Bonjour ${prenom},</p>
        <p>Vous avez été assigné(e) à une nouvelle mission :</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:8px;color:#888;font-size:13px;">Référence</td><td style="padding:8px;font-weight:600;">${mission.reference}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#888;font-size:13px;">Date</td><td style="padding:8px;">${dateStr}${heureStr}</td></tr>
          <tr><td style="padding:8px;color:#888;font-size:13px;">Lot</td><td style="padding:8px;">${mission.lot_designation}</td></tr>
          ${mission.adresse ? `<tr style="background:#f9f9f9"><td style="padding:8px;color:#888;font-size:13px;">Adresse</td><td style="padding:8px;">${mission.adresse}</td></tr>` : ''}
        </table>
        <p>Connectez-vous à ImmoChecker pour accepter ou refuser cette mission.</p>
        <a href="${FRONTEND_URL}/app/missions" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0;">Voir mes missions</a>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${FRONTEND_URL}/reset-password/${token}`

  if (!resend) {
    console.log(`[email] (Resend not configured) Password reset for ${email}: ${link}`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reinitialisation de votre mot de passe ImmoChecker',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #d97706;">ImmoChecker</h2>
        <p>Vous avez demande la reinitialisation de votre mot de passe.</p>
        <a href="${link}" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Reinitialiser mon mot de passe
        </a>
        <p style="color: #888; font-size: 12px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    `,
  })
}
