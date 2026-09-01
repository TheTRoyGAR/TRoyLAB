import { neon } from '@neondatabase/serverless'

// Real Neon Postgres (via Vercel's Neon integration on the t-roy-lab project).
// DATABASE_URL is set for Production, Preview, and Development environments.
export const sql = neon(process.env.DATABASE_URL!)

let schemaReady: Promise<void> | null = null

// Idempotent — safe to call on every cold start. Creates tables if they don't exist yet.
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          booking_ref TEXT PRIMARY KEY,
          status TEXT NOT NULL DEFAULT 'inquiry',
          requires_owner_approval BOOLEAN NOT NULL DEFAULT true,
          type TEXT NOT NULL,
          item_id TEXT NOT NULL,
          travelers JSONB NOT NULL DEFAULT '[]',
          add_ons JSONB NOT NULL DEFAULT '[]',
          total_amount NUMERIC NOT NULL DEFAULT 0,
          cabin_class TEXT,
          estimated_response_time TEXT NOT NULL DEFAULT '24 hours',
          lead_traveler_name TEXT NOT NULL,
          lead_traveler_email TEXT NOT NULL,
          owner_notes TEXT,
          approved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      // Real Stripe payment fields — added after the payment processor was
      // integrated. IF NOT EXISTS keeps this idempotent for existing rows.
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'`
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_link_url TEXT`
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id TEXT`
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`
      await sql`
        CREATE TABLE IF NOT EXISTS partner_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          specialization TEXT NOT NULL,
          destinations_covered TEXT NOT NULL,
          credentials TEXT,
          message TEXT,
          document_url TEXT,
          document_name TEXT,
          status TEXT NOT NULL DEFAULT 'pending_review',
          reviewer_notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          reviewed_at TIMESTAMPTZ
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          email TEXT PRIMARY KEY,
          subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          country TEXT,
          status TEXT NOT NULL DEFAULT 'lead',
          source TEXT NOT NULL DEFAULT 'direct',
          total_spent NUMERIC NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      // Real seed - TRoy (Ertan Govdeli) as the first genuine contact record,
      // replacing the old "TRoyGO Mock Data" fake CRM entirely. Real details
      // given directly by TRoy 2026-08-31. ON CONFLICT so this is safe to
      // run on every cold start without duplicating or overwriting edits.
      await sql`
        INSERT INTO contacts (first_name, last_name, email, phone, country, status, source, notes)
        VALUES ('Ertan', 'Govdeli', 'ertangovdeli@gmail.com', '+61422781807', 'Australia', 'vip', 'direct', 'Founder & CEO, TROYGO Group™')
        ON CONFLICT (email) DO NOTHING
      `
      // Real sales pipeline - starts empty (no fabricated demo leads). Grows
      // only from real "Add Lead" entries or future real integrations.
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
          package_interest TEXT NOT NULL,
          estimated_value NUMERIC NOT NULL DEFAULT 0,
          stage TEXT NOT NULL DEFAULT 'new',
          probability INTEGER NOT NULL DEFAULT 20,
          expected_close DATE,
          last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      // Real sent-email log - starts empty (no fabricated "opened"/"clicked"
      // engagement stats, since there's no real open/click tracking wired
      // up). Only real statuses this can honestly report: sent or failed.
      await sql`
        CREATE TABLE IF NOT EXISTS sent_emails (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          to_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          body TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'sent',
          error TEXT,
          sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
    })()
  }
  return schemaReady
}

// Real defaults - used only when a key has never been saved to the settings table.
const SETTINGS_DEFAULTS: Record<string, string> = {
  business_name: 'TRoy Travel Agency™',
  abn: '30 302 098 137',
  notification_email: 'troytravelagency@gmail.com',
}

export async function getSettings(): Promise<Record<string, string>> {
  await ensureSchema()
  const rows = await sql`SELECT key, value FROM settings`
  const saved = Object.fromEntries(rows.map((r) => [r.key as string, r.value as string]))
  return { ...SETTINGS_DEFAULTS, ...saved }
}

export async function getSetting(key: keyof typeof SETTINGS_DEFAULTS): Promise<string> {
  await ensureSchema()
  const rows = await sql`SELECT value FROM settings WHERE key = ${key}`
  return rows.length > 0 ? (rows[0].value as string) : SETTINGS_DEFAULTS[key]
}

export async function saveSettings(updates: Record<string, string>): Promise<void> {
  await ensureSchema()
  for (const [key, value] of Object.entries(updates)) {
    if (!(key in SETTINGS_DEFAULTS)) continue // only known, real settings keys
    await sql`
      INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${value}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `
  }
}
