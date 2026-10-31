import { sql } from '@/lib/db'

// Basic abuse guard for the public contact / quote forms. Bots were filling
// them with random strings (Sep-Oct 2026), which created junk contacts and made
// the site email arbitrary addresses. A real captcha (Cloudflare Turnstile) is
// the proper next step; this stops the cheap cases now.
const EMAIL_RE = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,190}\.[A-Za-z]{2,}$/

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email.trim())
}

export function clip(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Global cap on form-created contacts per hour (a real day has far fewer).
export async function formRateLimited(limitPerHour = 15): Promise<boolean> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n FROM contacts
    WHERE source IN ('contact_form', 'agent_quote_request', 'quote_request')
      AND created_at > now() - interval '1 hour'
  `
  return Number(rows[0]?.n ?? 0) >= limitPerHour
}
