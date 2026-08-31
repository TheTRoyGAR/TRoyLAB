import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'

const VALID_STAGES = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost']

/* ─── GET /api/leads ──────────────────────────────────────────────────────
 * Real sales pipeline from Postgres. Starts empty - no fabricated demo
 * leads. Joins contacts for display name/email.
 */
export async function GET() {
  try {
    await ensureSchema()
    const rows = await sql`
      SELECT l.*, c.first_name, c.last_name, c.email AS contact_email
      FROM leads l
      JOIN contacts c ON c.id = l.contact_id
      ORDER BY l.last_activity DESC
    `
    return NextResponse.json({
      success: true,
      leads: rows.map((r) => ({
        id: r.id,
        contactId: r.contact_id,
        contactName: `${r.first_name} ${r.last_name}`,
        contactEmail: r.contact_email,
        packageInterest: r.package_interest,
        estimatedValue: Number(r.estimated_value),
        stage: r.stage,
        probability: Number(r.probability),
        expectedClose: r.expected_close,
        lastActivity: r.last_activity,
        createdAt: r.created_at,
      })),
    })
  } catch (error) {
    console.error('[TRoyGO™] Leads lookup error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load leads.' }, { status: 500 })
  }
}

/* ─── POST /api/leads ──────────────────────────────────────────────────────
 * Adds a real lead against a real, existing contact. */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json() as {
      contactId: string
      packageInterest: string
      estimatedValue: number
      stage?: string
      probability?: number
      expectedClose?: string
    }

    if (!body.contactId || !body.packageInterest || body.estimatedValue == null) {
      return NextResponse.json(
        { success: false, error: 'contactId, packageInterest, and estimatedValue are required.' },
        { status: 400 }
      )
    }
    const stage = VALID_STAGES.includes(body.stage ?? '') ? body.stage! : 'new'
    const probability = Math.min(100, Math.max(0, body.probability ?? 20))

    const rows = await sql`
      INSERT INTO leads (contact_id, package_interest, estimated_value, stage, probability, expected_close)
      VALUES (${body.contactId}, ${body.packageInterest}, ${body.estimatedValue}, ${stage}, ${probability}, ${body.expectedClose ?? null})
      RETURNING id
    `
    return NextResponse.json({ success: true, id: rows[0].id }, { status: 201 })
  } catch (error) {
    console.error('[TRoyGO™] Lead creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save lead.' }, { status: 500 })
  }
}

/* ─── PATCH /api/leads?id=<uuid> ───────────────────────────────────────────
 * Moves a real lead to a new stage (e.g. Kanban drag), or updates other
 * fields. Always bumps last_activity to reflect the real change. */
export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema()
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id query param required.' }, { status: 400 })
    }
    const body = await req.json() as { stage?: string; probability?: number }
    if (body.stage && !VALID_STAGES.includes(body.stage)) {
      return NextResponse.json({ success: false, error: 'Invalid stage.' }, { status: 400 })
    }

    if (body.stage) {
      await sql`UPDATE leads SET stage = ${body.stage}, last_activity = now() WHERE id = ${id}`
    }
    if (body.probability != null) {
      const probability = Math.min(100, Math.max(0, body.probability))
      await sql`UPDATE leads SET probability = ${probability}, last_activity = now() WHERE id = ${id}`
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TRoyGO™] Lead update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update lead.' }, { status: 500 })
  }
}

/* ─── DELETE /api/leads?id=<uuid> ──────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  try {
    await ensureSchema()
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id query param required.' }, { status: 400 })
    }
    await sql`DELETE FROM leads WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TRoyGO™] Lead delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete lead.' }, { status: 500 })
  }
}
