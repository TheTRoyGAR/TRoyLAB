'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
  }
}

// Public site key (safe to expose). Unset -> no captcha is shown or required.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

// Cloudflare Turnstile captcha. Calls onToken(token) when the visitor passes and
// onToken('') when the token expires or errors. Bump resetKey to get a fresh one.
export default function TurnstileWidget({ onToken, resetKey = 0 }: { onToken: (t: string) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !box.current) return
    let cancelled = false

    const mount = () => {
      if (cancelled || !box.current || !window.turnstile) return
      widgetId.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      })
    }

    if (window.turnstile) {
      mount()
    } else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
      if (!s) {
        s = document.createElement('script')
        s.src = SCRIPT_SRC
        s.async = true
        document.head.appendChild(s)
      }
      s.addEventListener('load', mount)
    }

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  if (!TURNSTILE_SITE_KEY) return null
  return <div ref={box} className="my-2" />
}
