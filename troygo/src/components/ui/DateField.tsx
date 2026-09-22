'use client'

import { Calendar } from 'lucide-react'

function formatDDMMYYYY(isoDate: string) {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-AU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// A plain `<input type="date">` with a decorative calendar icon next to it
// only reliably opens its native picker when the browser's own tiny icon is
// clicked precisely — that's what made date fields across the site hard to
// use. This overlays a full-size transparent date input over a styled
// display, so clicking anywhere in the field opens the real picker.
export default function DateField({
  label, value, onChange, className,
}: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 mt-1 relative">
        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="w-full text-sm font-semibold text-navy" style={{ color: '#0A1628' }}>
          {value ? formatDDMMYYYY(value) : <span className="text-slate-400 font-normal">dd/mm/yyyy</span>}
        </span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}
