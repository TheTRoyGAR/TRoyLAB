// Shared "X Today" live-data engine, used by every destination guide.
// Weather: Open-Meteo (free, no key). Sun times: sunrise-sunset.org (free, no key).
// If either source fails, its section is marked unavailable rather than backfilled with guesses.

export interface DestinationToday {
  fetchedAt: string
  localDateLabel: string
  localDayOfWeek: string
  season: string
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

export interface SeasonInfo {
  label: string
  note: string
}

export interface DestinationConfig {
  lat: number
  lon: number
  timezone: string
  getSeason: (nowUtc: Date, timezone: string) => SeasonInfo
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
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail',
}

function formatClockTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(iso))
}

export async function getDestinationToday(config: DestinationConfig): Promise<DestinationToday> {
  const { lat, lon, timezone, getSeason } = config
  const now = new Date()

  const [weatherResult, sunResult] = await Promise.allSettled([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&timezone=${encodeURIComponent(timezone)}`,
      { next: { revalidate: 3600 } }
    ),
    fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0&tzid=${encodeURIComponent(timezone)}`,
      { next: { revalidate: 3600 } }
    ),
  ])

  let weather: DestinationToday['weather'] = { live: false }
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

  let sun: DestinationToday['sun'] = { live: false }
  if (sunResult.status === 'fulfilled' && sunResult.value.ok) {
    try {
      const data = await sunResult.value.json()
      if (data.status === 'OK') {
        const totalSeconds = data.results.day_length
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.round((totalSeconds % 3600) / 60)
        sun = {
          live: true,
          sunriseLocal: formatClockTime(data.results.sunrise, timezone),
          sunsetLocal: formatClockTime(data.results.sunset, timezone),
          dayLengthLabel: `${hours}h ${minutes}m`,
        }
      }
    } catch {
      sun = { live: false }
    }
  }

  const { label: season, note: seasonNote } = getSeason(now, timezone)

  return {
    fetchedAt: now.toISOString(),
    localDateLabel: new Intl.DateTimeFormat('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone,
    }).format(now),
    localDayOfWeek: new Intl.DateTimeFormat('en-AU', {
      weekday: 'long',
      timeZone: timezone,
    }).format(now),
    season,
    seasonNote,
    weather,
    sun,
  }
}
