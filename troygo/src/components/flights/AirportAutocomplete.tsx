'use client'

import { useEffect, useRef, useState } from 'react'

interface AirportResult {
  code: string
  name: string
  city: string
  country: string
}

interface AirportAutocompleteProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

// Drop-in replacement for a plain <input> — same value/onChange contract,
// but resolves free-text city names ("Darwin") to real IATA codes ("DRW")
// via Duffel's own live airport search, since Duffel's flight search only
// accepts exact codes. Without this, typing a city name silently found
// nothing (the live search only fires for exact 3-letter codes).
export default function AirportAutocomplete({ value, onChange, placeholder, className }: AirportAutocompleteProps) {
  const [results, setResults] = useState<AirportResult[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const query = value.trim()
  // Already an exact code (e.g. user picked a suggestion, or typed one
  // directly) — nothing to search for, and the dropdown should stay hidden;
  // computed here at render time rather than resetting state from the
  // effect below, which would call setState synchronously in the effect body.
  const isExactCode = /^[A-Za-z]{3}$/.test(query)

  useEffect(() => {
    if (query.length < 2 || isExactCode) return
    let cancelled = false
    const timer = setTimeout(() => {
      fetch(`/api/airports/search?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setResults(data.airports ?? [])
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [value, query, isExactCode])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        className={className}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && !isExactCode && results.length > 0 && (
        <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-100 py-1 max-h-64 overflow-y-auto">
          {results.map((a) => (
            <button
              key={a.code}
              type="button"
              onClick={() => { onChange(a.code); setResults([]); setOpen(false) }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
            >
              <span className="text-sm">
                <span className="font-semibold text-navy" style={{ color: '#0A1628' }}>{a.city}</span>
                <span className="text-slate-400"> · {a.name}</span>
              </span>
              <span className="text-xs font-bold shrink-0" style={{ color: '#00B4D8' }}>{a.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
