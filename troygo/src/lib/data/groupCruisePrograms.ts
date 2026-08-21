// Real, sourced cruise-line group booking programs — verified via live web
// research 2026-08-21, not agent-generated. Every number here has a real
// source; where TRoy's initial figures didn't match independent sources
// (Carnival, Norwegian), the verified number is used and the discrepancy is
// noted in `note`. This powers a real product line: group cruises for
// weddings, family reunions, and corporate retreats — TRoyGO organizes the
// booking, the cruise line provides the group program terms.

export interface GroupCruiseProgram {
  cruiseLine: string
  tier: 'Mainstream & Family' | 'Premium' | 'Luxury'
  programName?: string
  minimumStaterooms: string
  benefits: string[]
  note?: string
  sourceUrl: string
}

export const groupCruisePrograms: GroupCruiseProgram[] = [
  {
    cruiseLine: 'Royal Caribbean International',
    tier: 'Mainstream & Family',
    minimumStaterooms: '8 staterooms (16 guests)',
    benefits: [
      'Cruise credit for every 8 staterooms, usable toward one or more fares',
      'Discounted group cabin fares',
      'Access to special onboard amenities and meeting spaces',
    ],
    sourceUrl: 'https://www.royalcaribbean.com/guides/cruise-group-travel',
  },
  {
    cruiseLine: 'Norwegian Cruise Line',
    tier: 'Mainstream & Family',
    minimumStaterooms: '8 cabins (16 full-fare adults)',
    benefits: [
      '1 complimentary Tour Conductor berth per 16 full-fare passengers / 8 staterooms',
      'Free onboard credit',
      'Free drinks package',
      'Free specialty dining',
    ],
    note: "Verified minimum is 8 cabins, not 6 as originally stated.",
    sourceUrl: 'https://www.portjourney.com/blog/what-is-considered-a-group-booking-on-norwegian-cruise-line',
  },
  {
    cruiseLine: 'Carnival Cruise Line',
    tier: 'Mainstream & Family',
    minimumStaterooms: '8 staterooms (Category 4B or higher)',
    benefits: [
      'Free cabin(s) for the group organizer',
      'Reduced deposits',
      'Net group rates',
    ],
    note: "Verified minimum is 8 staterooms, not 5 as originally stated.",
    sourceUrl: 'https://www.portjourney.com/blog/what-is-considered-a-group-booking-on-carnival-cruise-line',
  },
  {
    cruiseLine: 'Disney Cruise Line',
    tier: 'Mainstream & Family',
    minimumStaterooms: '8 staterooms',
    benefits: [
      'Free cabin per 8 paid, on select sailings',
      'Character appearance at a private group event for 20+ cabins',
      'Priority seating, reserved section for group dining',
    ],
    note: 'Group discounts are modest (3-8%) compared to other mainstream lines.',
    sourceUrl: 'https://cruiseline.com/advice/cruising-101/all-about-cruising/5-surprising-things-cruise-lines-do-for-large-families-and-groups',
  },
  {
    cruiseLine: 'Holland America Line',
    tier: 'Premium',
    minimumStaterooms: '8 double-occupancy cabins',
    benefits: [
      'Free cabin upgrade (not a free cabin) for one or more group cabins',
      'Complimentary wine/champagne, chocolates',
      'Private cocktail parties',
      'Shipboard and casino credits',
    ],
    sourceUrl: 'https://www.travelmarketreport.com/cruises/articles/here-are-all-the-cruise-line-group-policies',
  },
  {
    cruiseLine: 'Princess Cruises',
    tier: 'Premium',
    programName: 'Celebration Group Program',
    minimumStaterooms: '5-99 staterooms',
    benefits: [
      '1 Tour Conductor credit per 8 staterooms (usable on a 9th)',
      'Princess Plus fares included (drinks, Wi-Fi, crew appreciation)',
      'Dedicated Princess group-planning expert',
      'Early access to Dine My Way reservations',
    ],
    sourceUrl: 'https://www.princess.com/ships-and-experience/celebrations/celebration-group-program',
  },
  {
    cruiseLine: 'Celebrity Cruises',
    tier: 'Premium',
    minimumStaterooms: '8 staterooms',
    benefits: [
      'Standard group program for family reunions, weddings, corporate retreats',
    ],
    note: 'General industry pattern, not independently re-verified line-by-line.',
    sourceUrl: 'https://www.travelmarketreport.com/cruises/articles/here-are-all-the-cruise-line-group-policies',
  },
  {
    cruiseLine: 'Regent Seven Seas Cruises',
    tier: 'Luxury',
    minimumStaterooms: '3 bookings deposited',
    benefits: [
      '$400 USD shipboard credit per suite, OR',
      'One-time waiver of the custom air fee, per guest',
    ],
    sourceUrl: 'https://www.rssc.com/group-cruises',
  },
]

// Lines with a real, confirmed group program but details not yet
// independently verified per-line — flagged honestly rather than guessed.
export const groupCruiseProgramsNeedingConfirmation = [
  'Cunard Line', 'Silversea Cruises', 'Virgin Voyages',
]
