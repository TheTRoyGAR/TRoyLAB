// Evergreen editorial content for the Sydney travel guide.
// Recurring annual events are described by season/month, not a pinned date —
// exact dates move year to year and we don't publish one we haven't verified.

export interface SydneyAttraction {
  name: string
  description: string
}

export interface SydneyEvent {
  name: string
  when: string
  description: string
}

export const sydneyAttractions: SydneyAttraction[] = [
  {
    name: 'Sydney Opera House',
    description: 'The city’s defining landmark and a working performing arts centre — tours run daily, or catch a show under the sails.',
  },
  {
    name: 'Sydney Harbour Bridge',
    description: 'Walk across for free, or book the BridgeClimb to the top of the arch for 360-degree harbour views.',
  },
  {
    name: 'Bondi to Coogee Coastal Walk',
    description: 'A roughly 6km clifftop walk linking Bondi, Tamarama, Bronte and Coogee beaches — one of Sydney’s best free activities.',
  },
  {
    name: 'The Rocks',
    description: 'Sydney’s oldest neighbourhood, right at the harbour’s edge, with sandstone lanes, weekend markets and colonial-era pubs.',
  },
  {
    name: 'Royal Botanic Garden Sydney',
    description: 'Harbourside gardens next to the Opera House, with a free walking track (the Sydney Harbour promenade) and views across to the bridge.',
  },
  {
    name: 'Taronga Zoo',
    description: 'A short ferry ride across the harbour to a zoo with some of the best skyline views in the city.',
  },
  {
    name: 'Darling Harbour',
    description: 'A waterfront precinct with SEA LIFE Sydney Aquarium, the Australian National Maritime Museum and regular fireworks.',
  },
  {
    name: 'Blue Mountains (day trip)',
    description: 'About 1.5–2 hours from the city — the Three Sisters rock formation, eucalyptus forest and the Scenic World cable cars.',
  },
]

export const sydneyEvents: SydneyEvent[] = [
  {
    name: 'Sydney Festival',
    when: 'January',
    description: 'A major arts festival staged across outdoor and indoor venues through the city in the middle of summer.',
  },
  {
    name: 'Sydney Gay and Lesbian Mardi Gras',
    when: 'February – March',
    description: 'One of the world’s largest LGBTQ+ pride events, culminating in a parade down Oxford Street.',
  },
  {
    name: 'Vivid Sydney',
    when: 'Late May – mid-June',
    description: 'A large-scale light, music and ideas festival that projects artwork across the Opera House and city landmarks after dark.',
  },
  {
    name: 'Sculpture by the Sea',
    when: 'October – November',
    description: 'A free outdoor sculpture exhibition along the Bondi-to-Tamarama coastal walk.',
  },
  {
    name: 'Sydney to Hobart Yacht Race',
    when: '26 December',
    description: 'An iconic ocean yacht race that starts on Sydney Harbour every Boxing Day, watched by huge crowds along the foreshore.',
  },
  {
    name: 'Sydney New Year’s Eve Fireworks',
    when: '31 December',
    description: 'One of the world’s most-watched fireworks displays, launched from the Harbour Bridge and Opera House.',
  },
]

export const sydneyPackageSlugs = [
  'sydney-and-melbourne-by-air-australia-city-package',
]
