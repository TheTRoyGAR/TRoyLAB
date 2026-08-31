import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Search-form default dates must move with the calendar, not stay pinned to
// whatever date the form was built on - otherwise every default silently
// drifts into the past. Returns YYYY-MM-DD, `daysFromToday` days from now.
export function defaultSearchDate(daysFromToday: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toISOString().slice(0, 10)
}
