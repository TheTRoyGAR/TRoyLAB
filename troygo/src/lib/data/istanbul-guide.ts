// Evergreen editorial content for the Istanbul travel guide.
// Recurring annual events are described by season/month, not a pinned date —
// exact dates move year to year and we don't publish one we haven't verified.

export interface IstanbulAttraction {
  name: string
  description: string
}

export interface IstanbulEvent {
  name: string
  when: string
  description: string
}

export const istanbulAttractions: IstanbulAttraction[] = [
  {
    name: 'Hagia Sophia',
    description:
      'Nearly 1,500 years old — built as a Byzantine cathedral, later an Ottoman mosque and museum, now a mosque again. Its dome remains one of the great feats of ancient engineering.',
  },
  {
    name: 'Blue Mosque (Sultan Ahmed Mosque)',
    description:
      'Six minarets and a cascade of domes, named for the thousands of hand-painted blue Iznik tiles lining its interior. Directly across the square from Hagia Sophia.',
  },
  {
    name: 'Topkapi Palace',
    description:
      'Home to Ottoman sultans for nearly 400 years, with courtyards, the Imperial Harem, and a treasury holding the Topkapi Dagger and the 86-carat Spoonmaker’s Diamond.',
  },
  {
    name: 'Grand Bazaar',
    description:
      'One of the world’s oldest and largest covered markets — thousands of shops across sixty-odd streets, trading everything from carpets to gold since the 15th century.',
  },
  {
    name: 'Basilica Cistern',
    description:
      'An underground Byzantine water reservoir the size of a cathedral, held up by 336 columns — including two carved with Medusa heads at their base.',
  },
  {
    name: 'Bosphorus Cruise',
    description:
      'A boat ride up the strait that splits the city between Europe and Asia, passing Ottoman waterfront mansions, fortresses and the bridges linking the two continents.',
  },
  {
    name: 'Galata Tower',
    description:
      'A 14th-century stone tower in the old Genoese quarter, with a viewing deck looking out over the Golden Horn, the old city and the Bosphorus.',
  },
  {
    name: 'Dolmabahçe Palace',
    description:
      'A 19th-century Ottoman palace on the Bosphorus shoreline, built in European style with a crystal staircase and the world’s largest Bohemian crystal chandelier.',
  },
]

export const istanbulEvents: IstanbulEvent[] = [
  {
    name: 'Istanbul Tulip Festival',
    when: 'April',
    description: 'City parks — especially Emirgan Park on the Bosphorus — are planted with millions of tulips for the month.',
  },
  {
    name: 'Istanbul Music Festival',
    when: 'June',
    description: 'A classical music festival staged in historic venues across the city, including Byzantine churches and Ottoman palaces.',
  },
  {
    name: 'Istanbul Jazz Festival',
    when: 'June – July',
    description: 'International and Turkish jazz acts performing at outdoor and indoor venues through the summer.',
  },
  {
    name: 'Istanbul Biennial',
    when: 'Autumn, odd-numbered years',
    description: 'A major contemporary art exhibition staged across galleries and historic buildings citywide.',
  },
  {
    name: 'Republic Day',
    when: '29 October',
    description: 'Turkey’s national day, marking the founding of the Republic in 1923 — flags, parades and fireworks across the city.',
  },
  {
    name: 'Istanbul Marathon',
    when: 'November',
    description: 'The only marathon in the world run across two continents, crossing the Bosphorus Bridge from Asia to Europe.',
  },
]

export const istanbulPackageSlugs = [
  'istanbul-and-cappadocia-tour-6-days-turkey-package',
  'gallipoli-troy-remembrance-journey',
  'best-of-turkey-tour-10-days-small-group',
  '13-day-turkish-treasures-istanbul-troy-cappadocia-more',
]
