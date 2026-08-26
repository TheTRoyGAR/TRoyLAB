import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    const { email } = await req.json() as { email?: string }
    const trimmed = (email ?? '').trim().toLowerCase()

    if (!trimmed || !trimmed.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email is required.' }, { status: 400 })
    }

    await sql`
      INSERT INTO newsletter_subscribers (email) VALUES (${trimmed})
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({ success: true, message: "You're subscribed! Welcome aboard, traveller." }, { status: 201 })
  } catch (error) {
    console.error('[TRoyGO™ Newsletter] Subscribe error:', error)
    return NextResponse.json({ success: false, error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}

// GET /api/newsletter — admin-only, list of real subscribers (protected by middleware).
export async function GET() {
  try {
    await ensureSchema()
    const rows = await sql`SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC`
    return NextResponse.json({ success: true, count: rows.length, subscribers: rows })
  } catch (error) {
    console.error('[TRoyGO™ Newsletter] List error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load subscribers.' }, { status: 500 })
  }
}
