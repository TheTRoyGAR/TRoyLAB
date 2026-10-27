import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { sql, ensureSchema } from '@/lib/db'
import { isUuid, safeDocName } from '@/lib/partner-guard'

/* ─── GET /api/partners/document?id=<application id> (admin only) ──────────────
 * Streams the applicant's private document to the owner. Locked by the
 * middleware (owner password). Always sent as a download with nosniff so a
 * hostile file can never run in the owner's browser.
 */
export async function GET(req: NextRequest) {
  try {
    await ensureSchema()
    const id = req.nextUrl.searchParams.get('id')
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: 'A valid application id is required.' }, { status: 400 })
    }
    const rows = await sql`SELECT document_url, document_name FROM partner_submissions WHERE id = ${id}`
    const url = rows[0]?.document_url as string | undefined
    if (!url) {
      return NextResponse.json({ success: false, error: 'No document for this application.' }, { status: 404 })
    }
    const blob = await get(url, { access: 'private' })
    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json({ success: false, error: 'The document could not be found.' }, { status: 404 })
    }
    const name = safeDocName((rows[0]?.document_name as string | undefined) ?? 'document')
    const isPdf = name.toLowerCase().endsWith('.pdf')
    return new Response(blob.stream, {
      status: 200,
      headers: {
        'Content-Type': isPdf ? 'application/pdf' : 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${name}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('[TRoyGO™ Partners] Document error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load the document.' }, { status: 500 })
  }
}
