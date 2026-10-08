// Jetstar hand-off. TRoyGO has no access to Jetstar's own booking API, so when our live search finds no
// Australian domestic flights we send the customer to Jetstar's own website with the route and the number of
// passengers already filled in (checked against jetstar.com: From, To, Adults, Children and Infants carry over).
// The customer then picks dates, seats and bags and pays Jetstar directly. TRoyGO never touches that payment.
//
// Deliberately NOT passed: dates and trip type. Jetstar's home page ignores the date parameters we tried and we
// could not confirm which "flight-type" number means return, so we leave both for the customer to choose there.

// Australian airports (IATA). Used only to decide whether a route is domestic.
const AU_AIRPORTS = new Set([
  'SYD', 'MEL', 'BNE', 'PER', 'ADL', 'DRW', 'CBR', 'OOL', 'HBA', 'CNS', 'TSV', 'MCY', 'AVV', 'LST', 'NTL', 'MKY',
  'PPP', 'AYQ', 'BNK', 'BQB', 'HVB', 'WSI', 'ASP', 'ISA', 'ROK', 'TWB', 'HTI', 'LNO', 'KTA', 'BME', 'PHE', 'GLT',
  'MQL', 'ABX', 'WGA', 'DBO', 'TMW', 'ARM', 'PQQ', 'MBH', 'BDB', 'CFS',
])

const clean = (s: string) => s.trim().toUpperCase()

export function isAustralianDomestic(from: string, to: string): boolean {
  const a = clean(from)
  const b = clean(to)
  return a !== b && AU_AIRPORTS.has(a) && AU_AIRPORTS.has(b)
}

export interface JetstarSearch {
  from: string
  to: string
  adults: number
  children: number
  infants: number
}

export function buildJetstarSearchUrl(s: JetstarSearch): string {
  const q = new URLSearchParams({
    adults: String(Math.max(1, Math.floor(s.adults) || 1)),
    children: String(Math.max(0, Math.floor(s.children) || 0)),
    infants: String(Math.max(0, Math.floor(s.infants) || 0)),
    origin: clean(s.from),
    destination: clean(s.to),
  })
  return `https://www.jetstar.com/au/en/home?${q.toString()}`
}
