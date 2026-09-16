import { getDestinationToday, type DestinationToday, type SeasonInfo } from './destination-today'

export type TokyoToday = DestinationToday

const TOKYO_LAT = 35.6762
const TOKYO_LON = 139.6503
const TOKYO_TZ = 'Asia/Tokyo'

function getTokyoSeason(nowUtc: Date, timezone: string): SeasonInfo {
  const month = Number(
    new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: timezone }).format(nowUtc)
  )
  if (month === 12 || month <= 2) {
    return {
      label: 'Winter',
      note: 'Cool, dry and clear — good sightseeing weather with thinner crowds, occasional light snow.',
    }
  }
  if (month >= 3 && month <= 5) {
    return {
      label: 'Spring',
      note: 'Mild and mostly clear, with cherry blossom (sakura) season peaking late March into early April — Tokyo’s busiest tourist season.',
    }
  }
  if (month >= 6 && month <= 8) {
    return {
      label: 'Summer',
      note: 'Hot and humid, with a rainy season (tsuyu) through June into mid-July before the peak summer heat.',
    }
  }
  return {
    label: 'Autumn',
    note: 'Mild and comfortable, with autumn foliage (koyo) peaking through November — typhoon risk is higher in September.',
  }
}

export async function getTokyoToday(): Promise<TokyoToday> {
  return getDestinationToday({
    lat: TOKYO_LAT,
    lon: TOKYO_LON,
    timezone: TOKYO_TZ,
    getSeason: getTokyoSeason,
  })
}
