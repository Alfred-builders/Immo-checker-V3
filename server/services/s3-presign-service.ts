import crypto from 'crypto'

const DEFAULT_EXPIRY_SECONDS = 86400 // 24h per US-601

// Real AWS SDK integration lives behind these env vars; absent = stub mode.
const hasRealCreds = !!(
  process.env.AWS_S3_BUCKET &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
)

/**
 * Regenerate a short-lived signed URL for a persisted PDF.
 *
 * Stub mode (no AWS creds configured): appends `?exp=<unix>&sig=<hmac>` to the
 * stored URL. This gives callers a stable response shape — swap the body for
 * `@aws-sdk/s3-request-presigner` once bucket creds are provisioned.
 */
export function presignPdfUrl(
  storedUrl: string | null | undefined,
  expirySeconds: number = DEFAULT_EXPIRY_SECONDS
): string | null {
  if (!storedUrl) return null

  const exp = Math.floor(Date.now() / 1000) + expirySeconds

  if (hasRealCreds) {
    // TODO: replace with @aws-sdk/s3-request-presigner — extract key from
    // storedUrl, call getSignedUrl(s3Client, new GetObjectCommand({...}), { expiresIn })
    return stubSign(storedUrl, exp)
  }

  return stubSign(storedUrl, exp)
}

function stubSign(url: string, exp: number): string {
  const secret = process.env.JWT_SECRET || 'dev-secret'
  const sig = crypto.createHmac('sha256', secret).update(`${url}|${exp}`).digest('hex').slice(0, 32)
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}exp=${exp}&sig=${sig}`
}
