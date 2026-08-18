'use client'

import { useEffect, useRef, useState } from 'react'
import { Users } from 'lucide-react'

interface PassengerPickerProps {
  adults: number
  childCount: number
  onChange: (adults: number, childCount: number) => void
}

function CounterRow({
  label, sub, value, onChange, min, max,
}: { label: string; sub?: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-semibold text-navy" style={{ color: '#0A1628' }}>{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white transition-opacity disabled:opacity-30"
          style={{ background: '#00B4D8' }}
        >
          −
        </button>
        <span className="w-5 text-center font-semibold text-sm" style={{ color: '#0A1628' }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white transition-opacity disabled:opacity-30"
          style={{ background: '#00B4D8' }}
        >
          +
        </button>
      </div>
    </div>
  )
}

// Restores the real Adults/Children +/- picker that used to exist here —
// the flights search bar had regressed to a flat "1-8 Passengers" dropdown
// with no way to split out children.
export default function PassengerPicker({ adults, childCount, onChange }: PassengerPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const summary = childCount > 0
    ? `${adults} Adult${adults > 1 ? 's' : ''}, ${childCount} Child${childCount > 1 ? 'ren' : ''}`
    : `${adults} Passenger${adults > 1 ? 's' : ''}`

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-sm font-semibold text-navy bg-transparent"
        style={{ color: '#0A1628' }}
      >
        <Users className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="truncate">{summary}</span>
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 p-4 divide-y divide-slate-100">
          <CounterRow label="Adults" sub="12+ years" value={adults} onChange={(v) => onChange(v, childCount)} min={1} max={9} />
          <CounterRow label="Children" sub="2–11 years" value={childCount} onChange={(v) => onChange(adults, v)} min={0} max={8} />
          <div className="pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-2 rounded-lg font-semibold text-sm text-white"
              style={{ background: '#00B4D8' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
