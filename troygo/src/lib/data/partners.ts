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
];
