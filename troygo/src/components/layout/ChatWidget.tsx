'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

// TRoyTEL website chat for visitors. Not shown on the owner-only admin portal:
// that portal is served on dashboard.<domain> (the browser path is just "/"
// there, the middleware rewrites it internally), so the host is checked as
// well as the path.
export default function ChatWidget() {
  const pathname = usePathname()
  const onAdminHost = typeof window !== 'undefined' && window.location.hostname.startsWith('dashboard.')
  if (onAdminHost || pathname?.startsWith('/dashboard')) return null

  return <Script src="https://troytel.com/widget.js" data-inbox="troygo" strategy="afterInteractive" />
}
