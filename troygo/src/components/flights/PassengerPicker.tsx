'use client'

import { useEffect, useRef, useState } from 'react'
import { Users } from 'lucide-react'

export interface PassengerAge {
  id: string
  age: number
}

export interface PassengerCounts {
  adults: number
  children: PassengerAge[]
  infants: PassengerAge[]
}

interface PassengerPickerProps {
  value: PassengerCounts
  onChange: (value: PassengerCounts) => void
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

let idCounter = 0
function newId() {
  idCounter += 1
  return `pax-${Date.now()}-${idCounter}`
}

// Age matters for real fare accuracy — Duffel (and every real airline) prices
// a 9-year-old as a child fare and a 16-year-old as an adult fare. A flat
// "children" count with no age was a real quoting-accuracy gap, not a UI
// nicety — see the SIN-DRW-SIN scenario that surfaced this.
export default function PassengerPicker({ value, onChange }: PassengerPickerProps) {
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

  const { adults, children, infants } = value
  const childCount = children.length
  const infantCount = infants.length

  const summaryParts = [`${adults} Adult${adults > 1 ? 's' : ''}`]
  if (childCount > 0) summaryParts.push(`${childCount} Child${childCount > 1 ? 'ren' : ''}`)
  if (infantCount > 0) summaryParts.push(`${infantCount} Infant${infantCount > 1 ? 's' : ''}`)
  const summary = summaryParts.join(', ')

  function setAdults(n: number) {
    onChange({ ...value, adults: n })
  }

  function setChildCount(n: number) {
    const next = [...children]
    while (next.length < n) next.push({ id: newId(), age: 8 })
    while (next.length > n) next.pop()
    onChange({ ...value, children: next })
  }

  function setInfantCount(n: number) {
    const next = [...infants]
    while (next.length < n) next.push({ id: newId(), age: 1 })
    while (next.length > n) next.pop()
    onChange({ ...value, infants: next })
  }

  function setChildAge(id: string, age: number) {
    onChange({ ...value, children: children.map((c) => (c.id === id ? { ...c, age } : c)) })
  }

  function setInfantAge(id: string, age: number) {
    onChange({ ...value, infants: infants.map((i) => (i.id === id ? { ...i, age } : i)) })
  }

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
        <div className="absolute z-20 top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-100 p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
          <CounterRow label="Adults" sub="12+ years" value={adults} onChange={setAdults} min={1} max={9} />
          <CounterRow label="Children" sub="2–11 years" value={childCount} onChange={setChildCount} min={0} max={8} />
          {children.length > 0 && (
            <div className="py-2.5 space-y-2">
              {children.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <label className="text-xs text-slate-500">Child {i + 1} age</label>
                  <select
                    value={c.age}
                    onChange={(e) => setChildAge(c.id, Number(e.target.value))}
                    className="text-sm font-semibold text-navy border border-slate-200 rounded-lg px-2 py-1 outline-none"
                    style={{ color: '#0A1628' }}
                  >
                    {Array.from({ length: 10 }, (_, n) => n + 2).map((age) => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          <CounterRow label="Infants" sub="Under 2 years, on lap" value={infantCount} onChange={setInfantCount} min={0} max={Math.min(adults, 4)} />
          {infants.length > 0 && (
            <div className="py-2.5 space-y-2">
              {infants.map((inf, i) => (
                <div key={inf.id} className="flex items-center justify-between gap-2">
                  <label className="text-xs text-slate-500">Infant {i + 1} age (months)</label>
                  <select
                    value={inf.age}
                    onChange={(e) => setInfantAge(inf.id, Number(e.target.value))}
                    className="text-sm font-semibold text-navy border border-slate-200 rounded-lg px-2 py-1 outline-none"
                    style={{ color: '#0A1628' }}
                  >
                    {Array.from({ length: 24 }, (_, n) => n).map((months) => (
                      <option key={months} value={months / 12}>{months}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          <div className="pt-3">
            <p className="text-[11px] text-slate-400 mb-2">Infants must travel on an adult&apos;s lap — max one infant per adult.</p>
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
