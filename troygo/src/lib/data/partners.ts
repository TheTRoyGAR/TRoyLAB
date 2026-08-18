// Real, verified local ground operators / Destination Management Companies
// (DMCs) that TRoyGO can point customers to for on-the-ground expertise in
// specific destinations. These are NOT TRoyGO staff (see agents.ts for our
// own team) — they're independent, real, external companies, listed here
// with their real names, descriptions, and their own real website links.
// Researched 2026-08-19. Verify accreditation/status directly before
// entering any real commercial partnership — this list is a starting
// reference, not a confirmed contractual relationship yet.

export interface TrustedPartner {
  name: string;
  country: string;
  destinationsCovered: string[];
  description: string;
  accreditations?: string[];
  website: string;
}

export const trustedPartners: TrustedPartner[] = [
  {
    name: 'Aussie Grand Tours',
    country: 'Australia',
    destinationsCovered: ['Sydney', 'Melbourne', 'Great Barrier Reef', 'Uluru'],
    description:
      'Award-winning Australia-based Destination Management Company specialising in inbound travel services for international travel agents and tour operators.',
    accreditations: ['ATIA', 'ATAS', 'CATO', 'ATEC', 'Best DMC – Australia, Global Tourism Awards 2025'],
    website: 'https://www.aussiegrandtours.com.au/',
  },
  {
    name: 'Xplore Australia',
    country: 'Australia',
    destinationsCovered: ['Sydney', 'Melbourne', 'Cairns', 'Perth'],
    description:
      "Leading inbound tour operator and DMC offering tailor-made itineraries, competitive rates, and dedicated local support for travel agents.",
    website: 'https://xploreaustralia.com/',
  },
  {
    name: 'Australia One',
    country: 'Australia',
    destinationsCovered: ['Australia-wide', 'New Zealand'],
    description:
      'Inbound Tour Operator and DMC for Australia and New Zealand, established in 1990 with over three decades of experience creating travel experiences.',
    website: 'http://australiaone.com.au/',
  },
  {
    name: 'Travel DMC Turkey',
    country: 'Turkey',
    destinationsCovered: ['Istanbul', 'Cappadocia'],
    description:
      'Professional Destination Management Company providing complete B2B ground handling across Turkey — contracted hotels, airport transfers, city and regional tours, and hot-air-balloon experiences in Cappadocia.',
    website: 'https://travel-dmc.com/turkey-dmc/',
  },
  {
    name: 'DMC Turkey',
    country: 'Turkey',
    destinationsCovered: ['Istanbul', 'Cappadocia'],
    description:
      'Destination management company operating across strategically selected Turkish destinations, delivering event and travel ground-handling solutions.',
    website: 'https://dmcturkey.org/',
  },
  {
    name: 'Explore Anatolia',
    country: 'Turkey',
    destinationsCovered: ['Troy', 'Aegean Coast', 'Ephesus', 'Pamukkale', 'Anatolia'],
    description:
      'Turkey tour operator specialising in private and custom itineraries across Anatolia and the Aegean coast, including Troy, Ephesus, and Pamukkale.',
    website: 'https://exploreanatolia.com/',
  },
  {
    name: 'On The Go Tours',
    country: 'Turkey',
    destinationsCovered: ['Troy', 'Gallipoli', 'Aegean Coast'],
    description:
      'Established tour operator running dedicated Troy tours along the Aegean coast, combining the ancient city with nearby historic and coastal sites.',
    website: 'https://www.onthegotours.com/Turkey/Best-Places-To-Visit/Troy',
  },
  {
    name: 'The Other Tour',
    country: 'Turkey',
    destinationsCovered: ['Istanbul', 'Troy', 'Aegean Coast'],
    description:
      'Full-service Turkey tour operator and DMC covering historic sites across Istanbul, Troy, and the Aegean region.',
    website: 'https://theothertour.com/troy/',
  },
  {
    name: 'APT Luxury Travel',
    country: 'Australia',
    destinationsCovered: ['Darwin', 'Kakadu', 'Litchfield', 'Northern Territory'],
    description:
      'Long-established Australian small-group luxury tour operator running dedicated Northern Territory itineraries covering Darwin, Kakadu, and Litchfield National Parks.',
    website: 'https://www.aptouring.com/en-us/tours/australia/northern-territory',
  },
  {
    name: 'Intrepid Travel',
    country: 'Australia',
    destinationsCovered: ['Darwin', 'Kakadu', 'Litchfield', 'Nitmiluk', 'Northern Territory'],
    description:
      'Well-known adventure tour operator running small-group Darwin and Top End trips with local and First Nations guides through Kakadu, Litchfield, and Nitmiluk.',
    website: 'https://www.intrepidtravel.com/us/australia/darwin',
  },
  {
    name: 'Territory Expeditions',
    country: 'Australia',
    destinationsCovered: ['Kakadu', 'Litchfield', 'Koolpin Gorge', 'Northern Territory'],
    description:
      'Top-rated local Darwin-based operator running dedicated Kakadu, Litchfield, and Koolpin Gorge tours, holding special-access permits for environmentally and culturally sensitive Top End sites.',
    website: 'https://territoryexpeditions.com.au/',
  },
  {
    name: 'Kakadu Tours and Travel',
    country: 'Australia',
    destinationsCovered: ['Kakadu', 'Jabiru', 'Arnhem Land', 'Northern Territory'],
    description:
      'Local operator based in Jabiru, inside Kakadu National Park, running multi-day camping tours, accommodated tours, small-group luxury tours, and private charters departing Darwin.',
    website: 'https://www.kakadutoursandtravel.com.au/',
  },
  {
    name: 'Kakadu Adventure Tours',
    country: 'Australia',
    destinationsCovered: ['Darwin', 'Kakadu', 'Arnhem Land', 'Litchfield', 'Northern Territory'],
    description:
      'Darwin-based Top End specialist and licensed travel agent with 25+ years of local experience, running safari and camping tours across Kakadu, Arnhem Land, and Litchfield.',
    website: 'http://www.kakaduadventuretours.com/',
  },
  {
    name: 'Tourism Top End',
    country: 'Australia',
    destinationsCovered: ['Darwin', 'Top End', 'Northern Territory'],
    description:
      'Regional Top End booking agency offering free reservation services for tours, attractions, accommodation, and vehicle hire across the wider Top End region.',
    website: 'https://www.tourismtopend.com.au/',
  },
];
