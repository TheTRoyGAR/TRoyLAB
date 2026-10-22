// Cloudflare Turnstile verification for the public forms (server side).
// TURNSTILE_SECRET_KEY set  -> a valid captcha token is REQUIRED (fails closed).
// TURNSTILE_SECRET_KEY unset -> check skipped, so the site keeps working until
// the keys are configured (the form-guard validation and rate limit still apply).
export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (typeof token !== 'string' || !token || token.length > 4096) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
