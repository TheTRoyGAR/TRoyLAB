import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'

/* ─── GET /api/contacts ─────────────────────────────────────────────────────
 * Real contacts from Postgres. Starts with exactly one real record (TRoy,
 * seeded 2026-08-31) - no fabricated demo contacts. Grows only from real
 * signups/bookings/manual entries from here on.
 */
export async function GET() {
  try {
    await ensureSchema()
    // Real bookingsCount/totalSpent via an honest join against real bookings
    // matched by email - not a fabricated or estimated figure.
    const rows = await sql`
      SELECT
        c.*,
        COALESCE(b.bookings_count, 0) AS real_bookings_count,
        COALESCE(b.real_total_spent, 0) AS real_total_spent
      FROM contacts c
      LEFT JOIN (
        SELECT lead_traveler_email, COUNT(*) AS bookings_count, SUM(total_amount) AS real_total_spent
        FROM bookings
        WHERE status IN ('confirmed', 'deposit_paid', 'fully_paid')
        GROUP BY lead_traveler_email
      ) b ON b.lead_traveler_email = c.email
      ORDER BY c.created_at DESC
    `
    return NextResponse.json({
      success: true,
      contacts: rows.map((r) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        country: r.country,
        status: r.status,
        source: r.source,
        totalSpent: Number(r.real_total_spent),
        bookingsCount: Number(r.real_bookings_count),
        notes: r.notes,
        createdAt: r.created_at,
      })),
    })
  } catch (error) {
    console.error('[TRoyGO™] Contacts lookup error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load contacts.' }, { status: 500 })
  }
}

/* ─── POST /api/contacts ─────────────────────────────────────────────────────
 * Adds a real contact. No fabricated fields - only what's actually provided.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json() as {
      firstName: string
      lastName: string
      email: string
      phone?: string
      country?: string
      status?: string
      source?: string
      notes?: string
    }

    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'firstName, lastName, and email are required.' },
        { status: 400 }
      )
    }

    const rows = await sql`
      INSERT INTO contacts (first_name, last_name, email, phone, country, status, source, notes)
      VALUES (
        ${body.firstName}, ${body.lastName}, ${body.email}, ${body.phone ?? null},
        ${body.country ?? null}, ${body.status ?? 'lead'}, ${body.source ?? 'direct'}, ${body.notes ?? null}
      )
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        country = EXCLUDED.country,
        notes = EXCLUDED.notes
      RETURNING id
    `

    return NextResponse.json({ success: true, id: rows[0].id }, { status: 201 })
  } catch (error) {
    console.error('[TRoyGO™] Contact creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save contact.' }, { status: 500 })
  }
}

/* ─── DELETE /api/contacts?id=<uuid> ─────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  try {
    await ensureSchema()
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id query param required.' }, { status: 400 })
    }
    await sql`DELETE FROM contacts WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TRoyGO™] Contact delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete contact.' }, { status: 500 })
  }
}
