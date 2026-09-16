import { getDestinationToday, type DestinationToday, type SeasonInfo } from './destination-today'

export type BangkokToday = DestinationToday

const BANGKOK_LAT = 13.7563
const BANGKOK_LON = 100.5018
const BANGKOK_TZ = 'Asia/Bangkok'

function getBangkokSeason(nowUtc: Date, timezone: string): SeasonInfo {
  const month = Number(
    new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: timezone }).format(nowUtc)
  )
  // Thailand's tropical climate runs three seasons rather than four.
  if (month >= 11 || month <= 2) {
    return {
      label: 'Cool Season',
      note: 'Bangkok’s most comfortable stretch — lower humidity and milder heat. The city’s peak travel season.',
    }
  }
  if (month >= 3 && month <= 5) {
    return {
      label: 'Hot Season',
      note: 'The hottest, most intense stretch of the year, building toward the monsoon.',
    }
  }
  return {
    label: 'Rainy Season',
    note: 'Monsoon season — humid with heavy but usually brief afternoon downpours, and noticeably fewer tourists.',
  }
}

export async function getBangkokToday(): Promise<BangkokToday> {
  return getDestinationToday({
    lat: BANGKOK_LAT,
    lon: BANGKOK_LON,
    timezone: BANGKOK_TZ,
    getSeason: getBangkokSeason,
  })
}
