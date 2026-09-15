import { getDestinationToday, type DestinationToday, type SeasonInfo } from './destination-today'

export type IstanbulToday = DestinationToday

const ISTANBUL_LAT = 41.0082
const ISTANBUL_LON = 28.9784
const ISTANBUL_TZ = 'Europe/Istanbul'

function getIstanbulSeason(nowUtc: Date, timezone: string): SeasonInfo {
  const month = Number(
    new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: timezone }).format(nowUtc)
  )
  if (month === 12 || month <= 2) {
    return {
      label: 'Winter',
      note: 'Cool and often rainy, with occasional snow — the quietest, least crowded season to visit.',
    }
  }
  if (month >= 3 && month <= 5) {
    return {
      label: 'Spring',
      note: 'Mild days and blooming parks (the Istanbul Tulip Festival runs through April) — ideal sightseeing weather before summer crowds.',
    }
  }
  if (month >= 6 && month <= 8) {
    return {
      label: 'Summer',
      note: 'Hot, dry days along the Bosphorus and warm evenings for ferry rides — also peak tourist season with the biggest crowds.',
    }
  }
  return {
    label: 'Autumn',
    note: 'Warm days cooling into crisp evenings, with thinner crowds — many locals’ favourite season to explore the city on foot.',
  }
}

export async function getIstanbulToday(): Promise<IstanbulToday> {
  return getDestinationToday({
    lat: ISTANBUL_LAT,
    lon: ISTANBUL_LON,
    timezone: ISTANBUL_TZ,
    getSeason: getIstanbulSeason,
  })
}
