// Checks for the partner application form (POST /api/partners/apply) and the
// admin review screen. Pure functions so they can be tested without a server.

export const PARTNER_STATUSES = ['pending_review', 'reviewing', 'needs_info', 'approved', 'declined'] as const
export type PartnerStatus = (typeof PARTNER_STATUSES)[number]

export interface CleanApplication {
  organisation: string
  name: string
  email: string
  country: string
  website: string | null
  registrationNumber: string | null
  specialization: string
  destinationsCovered: string
  credentials: string | null
  message: string | null
}

export type ApplicationResult = { ok: true; value: CleanApplication } | { ok: false; error: string }

const EMAIL_RE = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,190}\.[A-Za-z]{2,}$/
const PERSON_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .\-]{1,79}$/u
const ORG_RE = /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}'’&.,()\/ \-]{1,119}$/u
const COUNTRY_RE = /^[\p{L}\p{M}][\p{L}\p{M} .,'’()\-]{1,59}$/u
const REG_RE = /^[A-Za-z0-9][A-Za-z0-9 .\-\/]{2,39}$/

function clip(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : ''
}

// Accepts "example.com" or "https://example.com/path"; only http/https, must have a dot.
export function normaliseWebsite(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  const withScheme = /^[a-z][a-z0-9+.\-]*:\/\//i.test(s) ? s : 'https://' + s
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    if (!u.hostname.includes('.') || u.username || u.password) return null
    const href = u.toString()
    return href.length <= 200 ? href : null
  } catch {
    return null
  }
}

export function cleanApplication(f: Record<string, unknown>): ApplicationResult {
  const organisation = clip(f.organisation, 120)
  const name = clip(f.name, 80)
  const email = clip(f.email, 254)
  const country = clip(f.country, 60)
  const specialization = clip(f.specialization, 200)
  const destinationsCovered = clip(f.destinationsCovered, 200)
  const credentials = clip(f.credentials, 300) || null
  const message = clip(f.message, 2000) || null
  const websiteRaw = clip(f.website, 250)
  const regRaw = clip(f.registrationNumber, 40)

  if (!ORG_RE.test(organisation)) return { ok: false, error: 'Please enter your business or organisation name.' }
  if (!PERSON_RE.test(name)) return { ok: false, error: 'Please enter the name of the contact person.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please enter a valid email address.' }
  if (!COUNTRY_RE.test(country)) return { ok: false, error: 'Please enter the country you operate from.' }
  if (specialization.length < 3) return { ok: false, error: 'Please tell us what you specialise in.' }
  if (destinationsCovered.length < 2) return { ok: false, error: 'Please tell us which destinations you cover.' }

  let website: string | null = null
  if (websiteRaw) {
    website = normaliseWebsite(websiteRaw)
    if (!website) return { ok: false, error: 'Please enter a valid website address, for example https://example.com.' }
  }
  let registrationNumber: string | null = null
  if (regRaw) {
    if (!REG_RE.test(regRaw)) return { ok: false, error: 'Please check your business registration number.' }
    registrationNumber = regRaw
  }
  const consent = f.consent === 'on' || f.consent === 'true' || f.consent === true
  if (!consent) return { ok: false, error: 'Please confirm that your details are accurate and that you are authorised to offer these services.' }

  return { ok: true, value: { organisation, name, email, country, website, registrationNumber, specialization, destinationsCovered, credentials, message } }
}

// ── ABN ───────────────────────────────────────────────────────────────────────
// The official ABN checksum (ABR): subtract 1 from the first digit, multiply the 11
// digits by the weights below, the sum must divide exactly by 89. This only proves
// the number is well-formed; the ABR page must still be opened to see whether it is
// active and who holds it.
const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

export function abnChecksumValid(input: string): boolean {
  const digits = input.replace(/\s+/g, '')
  if (!/^\d{11}$/.test(digits)) return false
  const d = digits.split('').map(Number)
  d[0] -= 1
  const sum = d.reduce((s, n, i) => s + n * ABN_WEIGHTS[i], 0)
  return sum % 89 === 0
}

export interface RegistrationInfo {
  kind: 'abn' | 'other' | 'none'
  digits?: string
  checksumOk?: boolean
  lookupUrl?: string
}

export function registrationInfo(country: string | null | undefined, registration: string | null | undefined): RegistrationInfo {
  const reg = (registration ?? '').trim()
  if (!reg) return { kind: 'none' }
  const isAustralia = /^(australia|au|aus)$/i.test((country ?? '').trim())
  const digits = reg.replace(/\D/g, '')
  if (isAustralia && digits.length === 11) {
    return { kind: 'abn', digits, checksumOk: abnChecksumValid(digits), lookupUrl: `https://abr.business.gov.au/ABN/View?abn=${digits}` }
  }
  return { kind: 'other' }
}

// ── Documents ─────────────────────────────────────────────────────────────────
export function looksLikePdf(bytes: Uint8Array): boolean {
  return bytes.length > 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d // %PDF-
}

export function looksLikeText(bytes: Uint8Array): boolean {
  const n = Math.min(bytes.length, 8192)
  for (let i = 0; i < n; i++) if (bytes[i] === 0) return false
  return true
}

export function safeDocName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'document'
  const cleaned = base.replace(/[^A-Za-z0-9._\- ]/g, '_').slice(0, 80)
  return cleaned || 'document'
}

export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}
