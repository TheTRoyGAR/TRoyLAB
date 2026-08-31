import { NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'

/* ─── GET /api/bookings ────────────────────────────────────────────────────
 * Real bookings list from Postgres, most recent first. Used by the main
 * dashboard and any future bookings list view - real data only, no
 * fabricated destination/date fields the create flow doesn't actually
 * capture yet.
 */
export async function GET() {
  try {
    await ensureSchema()
    const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`
    return NextResponse.json({
      success: true,
      bookings: rows.map((b) => ({
        bookingRef: b.booking_ref,
        status: b.status,
        requiresOwnerApproval: b.requires_owner_approval,
        type: b.type,
        itemId: b.item_id,
        travelers: b.travelers,
        addOns: b.add_ons,
        totalAmount: Number(b.total_amount),
        cabinClass: b.cabin_class,
        estimatedResponseTime: b.estimated_response_time,
        leadTravelerName: b.lead_traveler_name,
        leadTravelerEmail: b.lead_traveler_email,
        ownerNotes: b.owner_notes,
        approvedAt: b.approved_at,
        createdAt: b.created_at,
      })),
    })
  } catch (error) {
    console.error('[TRoyGO™] Bookings list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load bookings.' }, { status: 500 })
  }
}
