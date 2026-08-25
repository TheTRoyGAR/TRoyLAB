import { NextRequest, NextResponse } from 'next/server'

// Protects the owner-only dashboard and internal admin APIs with real HTTP
// Basic Auth. ADMIN_USERNAME/ADMIN_PASSWORD are real secrets set in Vercel
// project env vars — never committed to the repo.
export function middleware(req: NextRequest) {
  // Partner applications (POST) must stay public — only the admin listing
  // (GET, used by the review dashboard) needs to be locked down.
  if (req.nextUrl.pathname === '/api/partners/apply' && req.method === 'POST') {
    return NextResponse.next()
  }

  const user = process.env.ADMIN_USERNAME
  const pass = process.env.ADMIN_PASSWORD

  if (!user || !pass) {
    // Fail closed: if the secret isn't configured, block access rather than
    // silently leaving the admin area open to the public.
    return new NextResponse('Admin access not configured.', { status: 503 })
  }

  const authHeader = req.headers.get('authorization')

  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8')
    const separatorIndex = decoded.indexOf(':')
    const suppliedUser = decoded.slice(0, separatorIndex)
    const suppliedPass = decoded.slice(separatorIndex + 1)

    if (suppliedUser === user && suppliedPass === pass) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="TRoyGO Admin"' },
  })
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/partners/apply', '/api/bookings/confirm'],
}
