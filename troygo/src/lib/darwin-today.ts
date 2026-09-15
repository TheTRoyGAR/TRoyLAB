// Real, live data for the "Darwin Today" widget — no fabricated numbers.
// Weather: Open-Meteo (free, no key). Sun times: sunrise-sunset.org (free, no key).
// If either source fails, its section is marked unavailable rather than backfilled with guesses.

const DARWIN_LAT = -12.4611
const DARWIN_LON = 130.8418
const DARWIN_TZ = 'Australia/Darwin'

export interface DarwinToday {
  fetchedAt: string
  localDateLabel: string
  localDayOfWeek: string
  season: 'Dry Season' | 'Wet Season'
  seasonNote: string
  weather: {
    live: true
    tempC: number
    feelsLikeC: number
    humidityPct: number
    windKph: number
    uvIndex: number
    conditionLabel: string
  } | { live: false }
  sun: {
    live: true
    sunriseLocal: string
    sunsetLocal: string
    dayLengthLabel: string
  } | { live: false }
}

const WMO_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail',
}

function formatClockTime(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: DARWIN_TZ,
  }).format(new Date(iso))
}

function getDarwinSeason(nowUtc: Date): { season: DarwinToday['season']; note: string } {
  const month = Number(
    new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: DARWIN_TZ }).format(nowUtc)
  )
  // Top End tropical savanna climate: Dry season May–Oct, Wet season Nov–Apr.
  if (month >= 5 && month <= 10) {
    return { season: 'Dry Season', note: 'Warm, sunny days with very low humidity and little rain — Darwin’s peak travel season.' }
  }
  return { season: 'Wet Season', note: 'Hot, humid days with dramatic afternoon storms and lush, green landscapes.' }
}

export async function getDarwinToday(): Promise<DarwinToday> {
  const now = new Date()

  const [weatherResult, sunResult] = await Promise.allSettled([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${DARWIN_LAT}&longitude=${DARWIN_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&timezone=${encodeURIComponent(DARWIN_TZ)}`,
      { next: { revalidate: 3600 } }
    ),
    fetch(
      `https://api.sunrise-sunset.org/json?lat=${DARWIN_LAT}&lng=${DARWIN_LON}&formatted=0&tzid=${encodeURIComponent(DARWIN_TZ)}`,
      { next: { revalidate: 3600 } }
    ),
  ])

  let weather: DarwinToday['weather'] = { live: false }
  if (weatherResult.status === 'fulfilled' && weatherResult.value.ok) {
    try {
      const data = await weatherResult.value.json()
      const c = data.current
      weather = {
        live: true,
        tempC: Math.round(c.temperature_2m),
        feelsLikeC: Math.round(c.apparent_temperature),
        humidityPct: Math.round(c.relative_humidity_2m),
        windKph: Math.round(c.wind_speed_10m),
        uvIndex: Math.round(c.uv_index * 10) / 10,
        conditionLabel: WMO_LABELS[c.weather_code] ?? 'Conditions unavailable',
      }
    } catch {
      weather = { live: false }
    }
  }

  let sun: DarwinToday['sun'] = { live: false }
  if (sunResult.status === 'fulfilled' && sunResult.value.ok) {
    try {
      const data = await sunResult.value.json()
      if (data.status === 'OK') {
        const totalSeconds = data.results.day_length
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.round((totalSeconds % 3600) / 60)
        sun = {
          live: true,
          sunriseLocal: formatClockTime(data.results.sunrise),
          sunsetLocal: formatClockTime(data.results.sunset),
          dayLengthLabel: `${hours}h ${minutes}m`,
        }
      }
    } catch {
      sun = { live: false }
    }
  }

  const { season, note } = getDarwinSeason(now)

  return {
    fetchedAt: now.toISOString(),
    localDateLabel: new Intl.DateTimeFormat('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: DARWIN_TZ,
    }).format(now),
    localDayOfWeek: new Intl.DateTimeFormat('en-AU', {
      weekday: 'long',
      timeZone: DARWIN_TZ,
    }).format(now),
    season,
    seasonNote: note,
    weather,
    sun,
  }
}
