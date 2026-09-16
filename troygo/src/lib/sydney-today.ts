import { getDestinationToday, type DestinationToday, type SeasonInfo } from './destination-today'

export type SydneyToday = DestinationToday

const SYDNEY_LAT = -33.8688
const SYDNEY_LON = 151.2093
const SYDNEY_TZ = 'Australia/Sydney'

function getSydneySeason(nowUtc: Date, timezone: string): SeasonInfo {
  const month = Number(
    new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: timezone }).format(nowUtc)
  )
  // Southern hemisphere — seasons run opposite to the northern calendar.
  if (month === 12 || month <= 2) {
    return {
      label: 'Summer',
      note: 'Hot beach weather and Sydney’s busiest season, capped off by the world-famous Harbour Bridge fireworks on New Year’s Eve.',
    }
  }
  if (month >= 3 && month <= 5) {
    return {
      label: 'Autumn',
      note: 'Warm days easing into cooler evenings, with thinner crowds — a favourite season for exploring the harbour on foot.',
    }
  }
  if (month >= 6 && month <= 8) {
    return {
      label: 'Winter',
      note: 'Mild by most standards — cool days, rarely cold — and home to the Vivid Sydney light festival as the season turns to spring.',
    }
  }
  return {
    label: 'Spring',
    note: 'Mild, flowering and building toward summer — a comfortable stretch for the coastal walks before the peak season crowds arrive.',
  }
}

export async function getSydneyToday(): Promise<SydneyToday> {
  return getDestinationToday({
    lat: SYDNEY_LAT,
    lon: SYDNEY_LON,
    timezone: SYDNEY_TZ,
    getSeason: getSydneySeason,
  })
}
