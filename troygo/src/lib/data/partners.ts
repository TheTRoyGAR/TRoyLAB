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
    name: 'Katherine Helicopters',
    country: 'Australia',
    destinationsCovered: ['Katherine', 'Katherine Gorge', 'Northern Territory'],
    description:
      'Katherine-based helicopter tour operator running scenic flights over Katherine Gorge, heli-fishing trips, and tailor-made Top End experiences. Operates two Bell helicopters, up to 6 passengers.',
    accreditations: ['AOC CASA.TAAOC.0977', 'QTAB Member', 'Tourism Council of Australia', 'Tourism Top End Listed'],
    website: 'https://www.katherinehelicopters.com/',
  },
  {
    name: 'Airborne Solutions',
    country: 'Australia',
    destinationsCovered: ['Darwin', 'Litchfield', 'Kakadu', 'Winnellie', 'Northern Territory'],
    description:
      "Northern Territory's helicopter specialist, led by Managing Director Clinton Brisk (30+ years flying experience). Runs scenic flights, heli pub crawls, heli fishing, Litchfield and Kakadu tours, plus aerial services (mining/exploration, aerial firefighting, filming, survey work).",
    accreditations: ['TripAdvisor Travelers’ Choice'],
    website: 'https://airbornesolutions.com.au/',
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
  {
    name: "TravelShop Turkey & Murti's Tours",
    country: 'Turkey',
    destinationsCovered: ['Istanbul', 'Cappadocia', 'Ephesus', 'Pamukkale', 'Bodrum', 'Fethiye', 'Antalya', 'Kuşadası', 'Turkey-wide (81 cities)'],
    description:
      "TURSAB-licensed Turkish tour operator and DMC founded 2005 in Bodrum, based in Istanbul since 2008, led by founder/CEO Murtaza Kalender. Offers 1000+ tours, 2000 hotels, 500 villas, and 200 yacht cruises across Turkey, plus destination management, wedding planning, and MICE/Congress organisation. TripAdvisor Travelers' Choice 2026, 4.8/5 (607 reviews).",
    accreditations: ['TURSAB', 'ASTA', 'USTOA', 'ETOA', 'TAAI', 'ATOAI', "TripAdvisor Travelers' Choice 2026"],
    website: 'https://travelshopturkey.com/',
  },
  {
    name: 'Go Türkiye (Official Tourism Board)',
    country: 'Turkey',
    destinationsCovered: ['Turkey-wide'],
    description:
      "Türkiye's official government travel guide and tourism promotion platform (Ministry of Culture and Tourism) — not a commercial agency. Publishes curated destination guides, 1-14 day themed itineraries, cultural/sporting event listings, and sustainable travel content covering the whole country.",
    website: 'https://goturkiye.com/',
  },
];
