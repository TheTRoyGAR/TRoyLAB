// Evergreen editorial content for the Darwin travel guide.
// Recurring annual events are described by season/month, not a pinned date —
// exact dates move year to year and we don't publish one we haven't verified.

export interface DarwinAttraction {
  name: string
  description: string
}

export interface DarwinEvent {
  name: string
  when: string
  description: string
}

export const darwinAttractions: DarwinAttraction[] = [
  {
    name: 'Mindil Beach Sunset Market',
    description:
      'Darwin’s signature market — food stalls, craft stands and a beach full of people watching the sun drop into the Timor Sea. Runs Thursday and Sunday evenings through the dry season.',
  },
  {
    name: 'Darwin Waterfront Precinct',
    description:
      'A protected wave pool and swimming lagoon right on the harbour, plus restaurants, bars and Stokes Hill Wharf — the easiest walkable evening out in the CBD.',
  },
  {
    name: 'Crocosaurus Cove',
    description:
      'Home to some of the Top End’s largest saltwater crocodiles, right in the city centre — including the "Cage of Death" for those who want to get uncomfortably close.',
  },
  {
    name: 'Museum and Art Gallery of the Northern Territory (MAGNT)',
    description:
      'Free entry. The Cyclone Tracy gallery and the taxidermied giant croc "Sweetheart" are two of the most-visited exhibits in the Territory.',
  },
  {
    name: 'George Brown Darwin Botanic Gardens',
    description: 'Tropical gardens minutes from the CBD, with monsoon vine forest, wetlands and a dedicated orchid collection.',
  },
  {
    name: 'Litchfield National Park',
    description:
      'A popular day trip (around 1.5 hours’ drive) — waterfalls with safe swimming holes and the famous magnetic termite mounds.',
  },
  {
    name: 'Kakadu National Park',
    description:
      'A UNESCO World Heritage-listed park roughly 2.5–3 hours from Darwin — ancient rock art galleries, Yellow Water Billabong wildlife cruises and vast wetlands.',
  },
  {
    name: 'Defence of Darwin Experience & East Point Reserve',
    description:
      'Darwin was bombed by Japan in February 1942 — this museum and the coastal gun emplacements at East Point tell that history, with wallabies often grazing nearby at dusk.',
  },
]

export const darwinEvents: DarwinEvent[] = [
  {
    name: 'Mindil Beach Sunset Market',
    when: 'Thursday & Sunday evenings, late April – late October',
    description: 'Weekly market and Darwin’s most popular sunset-watching spot during the dry season.',
  },
  {
    name: 'Parap Village Market',
    when: 'Saturday mornings, year-round',
    description: 'A smaller, locals-favourite market known for its laksa and multicultural food stalls.',
  },
  {
    name: 'Territory Day',
    when: '1 July',
    description:
      'The one day of the year Territorians can legally buy and set off their own fireworks — foreshadowed by a city full of backyard and public firework displays after dark.',
  },
  {
    name: 'Royal Darwin Show',
    when: 'July',
    description: 'The Territory’s biggest agricultural show — sideshows, produce competitions and fireworks.',
  },
  {
    name: 'Darwin Cup Carnival',
    when: 'July – August',
    description: 'A season of horse racing culminating in the Darwin Cup, one of the city’s biggest social events.',
  },
  {
    name: 'NAIDOC Week',
    when: 'July',
    description: 'Nationwide celebration of Aboriginal and Torres Strait Islander history and culture, marked across Darwin with community events.',
  },
  {
    name: 'Darwin Festival',
    when: 'August',
    description: 'A major annual arts festival — theatre, music, comedy and visual art staged across outdoor venues around the city.',
  },
]

export const darwinPackageSlugs = [
  'top-end-highlights-darwin-kakadu-litchfield-nitmiluk-6-day-tour',
  'darwin-kakadu-katherine-7-night-adventure-package',
  'top-end-highlights-darwin-kakadu-litchfield-nitmiluk',
  'darwin-litchfield-and-kakadu-escape',
]
