import { getDestinationToday, type DestinationToday, type SeasonInfo } from './destination-today'

export type DarwinToday = DestinationToday

const DARWIN_LAT = -12.4611
const DARWIN_LON = 130.8418
const DARWIN_TZ = 'Australia/Darwin'

function getDarwinSeason(nowUtc: Date, timezone: string): SeasonInfo {
  const month = Number(
    new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: timezone }).format(nowUtc)
  )
  // Top End tropical savanna climate: Dry season May–Oct, Wet season Nov–Apr.
  if (month >= 5 && month <= 10) {
    return {
      label: 'Dry Season',
      note: 'Warm, sunny days with very low humidity and little rain — Darwin’s peak travel season.',
    }
  }
  return {
    label: 'Wet Season',
    note: 'Hot, humid days with dramatic afternoon storms and lush, green landscapes.',
  }
}

export async function getDarwinToday(): Promise<DarwinToday> {
  return getDestinationToday({
    lat: DARWIN_LAT,
    lon: DARWIN_LON,
    timezone: DARWIN_TZ,
    getSeason: getDarwinSeason,
  })
}
