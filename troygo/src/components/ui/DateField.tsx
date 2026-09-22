'use client'

import { useRef } from 'react'
import { Calendar } from 'lucide-react'

// The real, visible native date input — an earlier version hid this input
// (opacity-0) under a fake styled display, which meant typing gave no visual
// feedback at all and the real clickable calendar icon was invisible and in
// the wrong place. This keeps the real input on screen so typing is visible,
// and the decorative icon calls showPicker() so it's a genuine second way in.
export default function DateField({
  label, value, onChange, className,
}: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          className="text-slate-400 shrink-0"
          onClick={() => inputRef.current?.showPicker?.()}
          aria-label={`Open ${label} calendar`}
        >
          <Calendar className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-semibold bg-transparent focus:outline-none [color-scheme:light]"
          style={{ color: '#0A1628' }}
        />
      </div>
    </div>
  )
}
