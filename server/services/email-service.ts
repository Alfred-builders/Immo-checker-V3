import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.FROM_EMAIL || 'ImmoChecker <onboarding@resend.dev>'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const BRAND = {
  primary: '#2d526c',
  primaryDark: '#1a3344',
  bg: '#FAF8F5',
  card: '#FFFFFF',
  border: '#EAE6E0',
  text: '#1a1a1a',
  muted: '#6b6661',
  subtle: '#8a8680',
} as const

function renderShell({ preheader, body }: { preheader: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>ImmoChecker</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:'Nunito Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND.text};-webkit-font-smoothing:antialiased;">
<span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">

<tr><td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 100%);background-color:${BRAND.primary};padding:28px 40px;border-radius:16px 16px 0 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle;width:40px;">
<div style="width:40px;height:40px;background-color:rgba(255,255,255,0.14);border-radius:10px;text-align:center;line-height:40px;color:#ffffff;font-size:17px;font-weight:800;letter-spacing:-0.02em;">IC</div>
</td>
<td style="vertical-align:middle;padding-left:14px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.015em;">ImmoChecker</td>
</tr></table>
</td></tr>

<tr><td style="background-color:${BRAND.card};padding:40px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
${body}
</td></tr>

<tr><td style="background-color:${BRAND.card};padding:0 40px 28px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};border-radius:0 0 16px 16px;">
<div style="border-top:1px solid ${BRAND.border};padding-top:20px;color:${BRAND.subtle};font-size:12px;line-height:18px;">
© 2026 ImmoChecker — Gérez vos états des lieux en toute simplicité.<br>
Si vous n'attendiez pas cet email, vous pouvez l'ignorer en toute sécurité.
</div>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="border-radius:10px;background-color:${BRAND.primary};">
<a href="${href}" style="display:inline-block;background-color:${BRAND.primary};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:-0.01em;line-height:1;">${label}</a>
</td></tr></table>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;color:${BRAND.text};font-size:22px;font-weight:700;letter-spacing:-0.02em;line-height:1.3;">${text}</h1>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;color:${BRAND.muted};font-size:15px;line-height:1.6;">${text}</p>`
}

function helperText(text: string): string {
  return `<p style="margin:20px 0 0;color:${BRAND.subtle};font-size:13px;line-height:1.5;">${text}</p>`
}

function infoTable(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map(
      (r, i) => `<tr>
<td style="padding:12px 0;color:${BRAND.subtle};font-size:13px;font-weight:500;width:110px;${i > 0 ? `border-top:1px solid ${BRAND.border};` : ''}">${r.label}</td>
<td style="padding:12px 0;color:${BRAND.text};font-size:14px;font-weight:600;${i > 0 ? `border-top:1px solid ${BRAND.border};` : ''}">${r.value}</td>
</tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background-color:#FAF8F5;border:1px solid ${BRAND.border};border-radius:12px;padding:4px 20px;">${cells}</table>`
}

export async function sendInvitationEmail(email: string, token: string, workspaceName: string, role: string) {
  const link = `${FRONTEND_URL}/register/${token}`

  if (!resend) {
    console.log(`[email] (Resend not configured) Invitation for ${email}: ${link}`)
    return
  }

  const body = `
${heading(`Vous êtes invité sur ${workspaceName}`)}
${paragraph(`Vous avez été invité à rejoindre <strong style="color:${BRAND.text};font-weight:700;">${workspaceName}</strong> sur ImmoChecker en tant que <strong style="color:${BRAND.text};font-weight:700;">${role}</strong>.`)}
${paragraph(`Cliquez sur le bouton ci-dessous pour créer votre compte et accepter l'invitation.`)}
${button(link, `Accepter l'invitation`)}
${helperText(`Ce lien expire dans 7 jours. Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :<br><span style="color:${BRAND.muted};word-break:break-all;">${link}</span>`)}
`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Invitation à rejoindre ${workspaceName} sur ImmoChecker`,
    html: renderShell({ preheader: `Rejoignez ${workspaceName} en tant que ${role}.`, body }),
  })
}

export async function sendEmailTechnicienAssigne(
  email: string,
  prenom: string,
  mission: { reference: string; date_planifiee: string; heure_debut?: string | null; lot_designation: string; adresse?: string | null }
) {
  const dateStr = new Date(mission.date_planifiee).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const heureStr = mission.heure_debut ? `${dateStr} à ${mission.heure_debut}` : dateStr

  if (!resend) {
    console.log(`[email] (Resend not configured) Mission assignée ${mission.reference} → ${email}`)
    return
  }

  const rows = [
    { label: 'Référence', value: mission.reference },
    { label: 'Date', value: heureStr },
    { label: 'Lot', value: mission.lot_designation },
  ]
  if (mission.adresse) rows.push({ label: 'Adresse', value: mission.adresse })

  const body = `
${heading(`Nouvelle mission assignée`)}
${paragraph(`Bonjour <strong style="color:${BRAND.text};font-weight:700;">${prenom}</strong>,`)}
${paragraph(`Une nouvelle mission vient de vous être assignée. Voici les détails :`)}
${infoTable(rows)}
${paragraph(`Connectez-vous à ImmoChecker pour accepter ou refuser cette mission.`)}
${button(`${FRONTEND_URL}/app/missions`, `Voir mes missions`)}
`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Mission ${mission.reference} — Nouvelle assignation`,
    html: renderShell({ preheader: `Mission ${mission.reference} — ${dateStr}`, body }),
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${FRONTEND_URL}/reset-password/${token}`

  if (!resend) {
    console.log(`[email] (Resend not configured) Password reset for ${email}: ${link}`)
    return
  }

  const body = `
${heading(`Réinitialisation du mot de passe`)}
${paragraph(`Vous avez demandé la réinitialisation de votre mot de passe ImmoChecker.`)}
${paragraph(`Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.`)}
${button(link, `Réinitialiser mon mot de passe`)}
${helperText(`Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email — votre mot de passe restera inchangé.<br><br>Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :<br><span style="color:${BRAND.muted};word-break:break-all;">${link}</span>`)}
`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Réinitialisation de votre mot de passe ImmoChecker',
    html: renderShell({ preheader: `Lien valable 1 heure pour réinitialiser votre mot de passe.`, body }),
  })
}
