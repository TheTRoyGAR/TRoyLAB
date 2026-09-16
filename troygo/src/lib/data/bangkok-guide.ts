// Evergreen editorial content for the Bangkok travel guide.
// Recurring annual events are described by season/month, not a pinned date —
// exact dates move year to year and we don't publish one we haven't verified.

export interface BangkokAttraction {
  name: string
  description: string
}

export interface BangkokEvent {
  name: string
  when: string
  description: string
}

export const bangkokAttractions: BangkokAttraction[] = [
  {
    name: 'Grand Palace & Wat Phra Kaew',
    description:
      'The former royal residence and home to the Emerald Buddha — Bangkok’s most important and most visited religious site.',
  },
  {
    name: 'Wat Arun (Temple of Dawn)',
    description: 'A riverside temple with a distinctive porcelain-encrusted spire, best seen at sunset from across the Chao Phraya River.',
  },
  {
    name: 'Wat Pho',
    description: 'Home to a 46-metre gold Reclining Buddha and Thailand’s original school of traditional Thai massage.',
  },
  {
    name: 'Chatuchak Weekend Market',
    description: 'One of the world’s largest weekend markets — over 8,000 stalls across clothing, art, antiques and food.',
  },
  {
    name: 'Chao Phraya River & Khlong Boat Tours',
    description: 'River ferries and longtail boat trips through the canals (khlongs) that give Bangkok its old nickname, the "Venice of the East".',
  },
  {
    name: 'Jim Thompson House',
    description: 'A traditional teak house museum built by the American silk entrepreneur credited with reviving Thailand’s silk industry.',
  },
  {
    name: 'Damnoen Saduak Floating Market',
    description: 'A popular day trip outside the city — vendors selling fruit and street food from boats along the canals.',
  },
  {
    name: 'Khao San Road',
    description: 'The famous backpacker strip — street food, bars and markets that run late into the night.',
  },
]

export const bangkokEvents: BangkokEvent[] = [
  {
    name: 'Songkran (Thai New Year)',
    when: '13 – 15 April',
    description: 'Thailand’s biggest festival — nationwide public water fights mark the traditional new year, Bangkok’s streets included.',
  },
  {
    name: 'Chinese New Year in Chinatown (Yaowarat)',
    when: 'January or February (lunar calendar)',
    description: 'Bangkok’s Chinatown district fills with lion dances, street food stalls and lantern displays.',
  },
  {
    name: 'Vegetarian Festival',
    when: 'October',
    description: 'A nine-day Chinese-Thai Buddhist festival with citywide vegetarian food stalls, most visible around Chinatown.',
  },
  {
    name: 'Loy Krathong',
    when: 'November (full moon)',
    description: 'Small floating lantern baskets (krathong) are released onto the Chao Phraya River and Bangkok’s canals after dark.',
  },
  {
    name: 'Bangkok Art Biennale',
    when: 'Recurring, varies by edition',
    description: 'A citywide contemporary art exhibition staged across temples, malls and galleries in central Bangkok.',
  },
]

export const bangkokPackageSlugs = [
  'bangkok-and-phuket-by-air-thailand-package',
  '9-day-central-thailand-with-river-kwai',
  '13-day-classic-thailand-tour',
  'bangkok-chiang-mai-phuket-by-air',
]
