// Evergreen editorial content for the Tokyo travel guide.
// Recurring annual events are described by season/month, not a pinned date —
// exact dates move year to year and we don't publish one we haven't verified.

export interface TokyoAttraction {
  name: string
  description: string
}

export interface TokyoEvent {
  name: string
  when: string
  description: string
}

export const tokyoAttractions: TokyoAttraction[] = [
  {
    name: 'Senso-ji Temple, Asakusa',
    description:
      'Tokyo’s oldest temple, entered through the giant red Kaminarimon lantern gate and a market street (Nakamise-dori) leading up to it.',
  },
  {
    name: 'Shibuya Crossing',
    description: 'The world’s busiest pedestrian crossing — up to 3,000 people cross at once when the lights change.',
  },
  {
    name: 'Meiji Shrine',
    description:
      'A Shinto shrine set inside a 700,000-tree forest right next to Harajuku, dedicated to Emperor Meiji and Empress Shoken.',
  },
  {
    name: 'Tokyo Skytree',
    description: 'At 634 metres, the tallest structure in Japan, with two observation decks looking out over the whole city.',
  },
  {
    name: 'Tsukiji Outer Market',
    description:
      'The old fish market’s retail and restaurant street lives on here, even though the famous wholesale tuna auction moved to Toyosu Market in 2018.',
  },
  {
    name: 'teamLab Digital Art Museums',
    description: 'Immersive, borderless digital art installations (teamLab Planets and Borderless) that have become one of Tokyo’s most talked-about attractions.',
  },
  {
    name: 'Akihabara',
    description: 'Tokyo’s electronics and anime/manga district — multi-storey stores, arcades and maid cafes packed into a few blocks.',
  },
  {
    name: 'Hakone (day trip)',
    description: 'A popular escape from the city for hot springs, a Lake Ashi cruise and, on clear days, views of Mt Fuji.',
  },
]

export const tokyoEvents: TokyoEvent[] = [
  {
    name: 'Cherry Blossom Season (Hanami)',
    when: 'Late March – early April',
    description: 'Parks across the city fill with picnickers under blooming sakura trees — Tokyo’s single busiest tourist window.',
  },
  {
    name: 'Sanja Matsuri',
    when: 'Mid-May',
    description: 'One of Tokyo’s largest and loudest Shinto festivals, centred on Senso-ji Temple in Asakusa with portable shrines carried through the streets.',
  },
  {
    name: 'Sumida River Fireworks Festival',
    when: 'Late July',
    description: 'A huge fireworks display over the Sumida River, one of the oldest and most popular fireworks festivals in Japan.',
  },
  {
    name: 'Comiket (Comic Market)',
    when: 'August & December',
    description: 'The world’s largest comic/doujinshi convention, held twice a year at Tokyo Big Sight.',
  },
  {
    name: 'Autumn Foliage (Koyo)',
    when: 'November',
    description: 'Gardens like Rikugien and Shinjuku Gyoen turn red and gold — a quieter, equally photogenic counterpart to cherry blossom season.',
  },
  {
    name: 'Hatsumode (New Year Shrine Visits)',
    when: '1 January',
    description: 'Millions visit shrines and temples across Tokyo in the first days of the new year to pray for good fortune.',
  },
]

export const tokyoPackageSlugs = [
  'tokyo-kyoto-osaka-by-train-japan-golden-route',
  'a-taste-of-japan-tokyo-kyoto-osaka-9-days',
]
