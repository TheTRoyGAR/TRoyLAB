export interface FlightLegInfo {
  flightNumber: string;
  from: { city: string; code: string };
  to: { city: string; code: string };
  departure: string; // ISO datetime string
  arrival: string;   // ISO datetime string
  duration: string;  // e.g. "7h 30m"
  stops: 0 | 1 | 2;
  stopCity?: string; // layover city if stops > 0
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: { city: string; code: string };
  to: { city: string; code: string };
  departure: string; // ISO datetime string
  arrival: string;   // ISO datetime string
  duration: string;  // e.g. "7h 30m"
  stops: 0 | 1 | 2;
  stopCity?: string; // layover city if stops > 0
  // Present only for real round-trip results — the return leg's own
  // segment info. `price` below is always the real combined round-trip
  // total when this is set, never the outbound leg priced alone (a
  // separately-priced one-way-plus-one-way overquoted a real test case
  // by ~$530 versus the real round-trip fare).
  returnLeg?: FlightLegInfo;
  price: {
    economy: number;
    business: number;
    first: number;
  };
  aircraft: string;
  amenities: {
    wifi: boolean;
    meals: boolean;
    entertainment: boolean;
  };
  seatsLeft: number;
  logo: string; // airline initial or two-letter code
}

// Sample flight dates must move with the calendar, like the search-form
// defaults do (see defaultSearchDate in utils.ts) — a fixed absolute date
// here silently drifts into the past and shows "available" flights that
// already departed. daysFromToday/dayDelta encode each flight's original
// offset from the group's base date, so relative spacing is preserved.
function futureDate(daysFromToday: number, time: string): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return `${d.toISOString().slice(0, 10)}T${time}`;
}

export const sampleFlights: Flight[] = [
  {
    id: "FL001",
    airline: "British Airways",
    flightNumber: "BA 178",
    from: { city: "New York", code: "JFK" },
    to: { city: "London", code: "LHR" },
    departure: futureDate(30, "22:00:00"),
    arrival: futureDate(31, "10:30:00"),
    duration: "7h 30m",
    stops: 0,
    price: { economy: 689, business: 2150, first: 4800 },
    aircraft: "Boeing 777-300ER",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 12,
    logo: "BA",
  },
  {
    id: "FL002",
    airline: "American Airlines",
    flightNumber: "AA 106",
    from: { city: "New York", code: "JFK" },
    to: { city: "London", code: "LHR" },
    departure: futureDate(30, "10:15:00"),
    arrival: futureDate(30, "22:45:00"),
    duration: "7h 30m",
    stops: 0,
    price: { economy: 612, business: 1980, first: 4200 },
    aircraft: "Boeing 787-9",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 4,
    logo: "AA",
  },
  {
    id: "FL003",
    airline: "Delta Air Lines",
    flightNumber: "DL 401",
    from: { city: "New York", code: "JFK" },
    to: { city: "London", code: "LHR" },
    departure: futureDate(30, "17:30:00"),
    arrival: futureDate(31, "05:55:00"),
    duration: "7h 25m",
    stops: 0,
    price: { economy: 724, business: 2320, first: 5100 },
    aircraft: "Airbus A330-300",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 18,
    logo: "DL",
  },
  {
    id: "FL004",
    airline: "Japan Airlines",
    flightNumber: "JL 061",
    from: { city: "Los Angeles", code: "LAX" },
    to: { city: "Tokyo", code: "NRT" },
    departure: futureDate(35, "11:00:00"),
    arrival: futureDate(36, "15:45:00"),
    duration: "11h 45m",
    stops: 0,
    price: { economy: 890, business: 3200, first: 7500 },
    aircraft: "Boeing 787-9 Dreamliner",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 9,
    logo: "JL",
  },
  {
    id: "FL005",
    airline: "United Airlines",
    flightNumber: "UA 837",
    from: { city: "Los Angeles", code: "LAX" },
    to: { city: "Tokyo", code: "NRT" },
    departure: futureDate(35, "13:30:00"),
    arrival: futureDate(36, "19:10:00"),
    duration: "12h 40m",
    stops: 1,
    stopCity: "San Francisco",
    price: { economy: 742, business: 2680, first: 6200 },
    aircraft: "Boeing 777-200",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 22,
    logo: "UA",
  },
  {
    id: "FL006",
    airline: "Air France",
    flightNumber: "AF 090",
    from: { city: "Miami", code: "MIA" },
    to: { city: "Paris", code: "CDG" },
    departure: futureDate(46, "22:30:00"),
    arrival: futureDate(47, "13:15:00"),
    duration: "9h 45m",
    stops: 0,
    price: { economy: 798, business: 2750, first: 5900 },
    aircraft: "Airbus A380",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 3,
    logo: "AF",
  },
  {
    id: "FL007",
    airline: "Emirates",
    flightNumber: "EK 231",
    from: { city: "Chicago", code: "ORD" },
    to: { city: "Dubai", code: "DXB" },
    departure: futureDate(55, "21:00:00"),
    arrival: futureDate(56, "19:30:00"),
    duration: "13h 30m",
    stops: 0,
    price: { economy: 1050, business: 4200, first: 9800 },
    aircraft: "Airbus A380-800",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 15,
    logo: "EK",
  },
  {
    id: "FL008",
    airline: "Lufthansa",
    flightNumber: "LH 441",
    from: { city: "Chicago", code: "ORD" },
    to: { city: "Dubai", code: "DXB" },
    departure: futureDate(55, "14:10:00"),
    arrival: futureDate(56, "16:50:00"),
    duration: "16h 40m",
    stops: 1,
    stopCity: "Frankfurt",
    price: { economy: 879, business: 3100, first: 7200 },
    aircraft: "Boeing 747-8",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 27,
    logo: "LH",
  },
  {
    id: "FL009",
    airline: "Singapore Airlines",
    flightNumber: "SQ 021",
    from: { city: "Los Angeles", code: "LAX" },
    to: { city: "Singapore", code: "SIN" },
    departure: futureDate(40, "23:55:00"),
    arrival: futureDate(42, "07:20:00"),
    duration: "17h 25m",
    stops: 0,
    price: { economy: 1120, business: 4800, first: 11500 },
    aircraft: "Airbus A350-900ULR",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 6,
    logo: "SQ",
  },
  {
    id: "FL010",
    airline: "Qantas",
    flightNumber: "QF 012",
    from: { city: "Los Angeles", code: "LAX" },
    to: { city: "Sydney", code: "SYD" },
    departure: futureDate(81, "22:00:00"),
    arrival: futureDate(83, "07:00:00"),
    duration: "15h 00m",
    stops: 0,
    price: { economy: 1380, business: 5200, first: 12000 },
    aircraft: "Airbus A380",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 11,
    logo: "QF",
  },
  {
    id: "FL011",
    airline: "Turkish Airlines",
    flightNumber: "TK 001",
    from: { city: "New York", code: "JFK" },
    to: { city: "Istanbul", code: "IST" },
    departure: futureDate(60, "23:00:00"),
    arrival: futureDate(61, "18:10:00"),
    duration: "10h 10m",
    stops: 0,
    price: { economy: 760, business: 2490, first: 5500 },
    aircraft: "Boeing 777-300ER",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 19,
    logo: "TK",
  },
  {
    id: "FL012",
    airline: "Iberia",
    flightNumber: "IB 6251",
    from: { city: "Miami", code: "MIA" },
    to: { city: "Barcelona", code: "BCN" },
    departure: futureDate(67, "20:45:00"),
    arrival: futureDate(68, "11:30:00"),
    duration: "9h 45m",
    stops: 0,
    price: { economy: 685, business: 2200, first: 4900 },
    aircraft: "Airbus A330-300",
    amenities: { wifi: true, meals: true, entertainment: false },
    seatsLeft: 2,
    logo: "IB",
  },
  {
    id: "FL013",
    airline: "KLM",
    flightNumber: "KL 641",
    from: { city: "Houston", code: "IAH" },
    to: { city: "Amsterdam", code: "AMS" },
    departure: futureDate(86, "16:50:00"),
    arrival: futureDate(87, "09:30:00"),
    duration: "9h 40m",
    stops: 0,
    price: { economy: 710, business: 2380, first: 5100 },
    aircraft: "Boeing 787-10",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 8,
    logo: "KL",
  },
  {
    id: "FL014",
    airline: "Cathay Pacific",
    flightNumber: "CX 830",
    from: { city: "San Francisco", code: "SFO" },
    to: { city: "Hong Kong", code: "HKG" },
    departure: futureDate(94, "00:30:00"),
    arrival: futureDate(95, "05:55:00"),
    duration: "14h 25m",
    stops: 0,
    price: { economy: 980, business: 3900, first: 8800 },
    aircraft: "Airbus A350-1000",
    amenities: { wifi: true, meals: true, entertainment: true },
    seatsLeft: 14,
    logo: "CX",
  },
  {
    id: "FL015",
    airline: "Spirit Airlines",
    flightNumber: "NK 204",
    from: { city: "New York", code: "JFK" },
    to: { city: "Cancún", code: "CUN" },
    departure: futureDate(45, "06:15:00"),
    arrival: futureDate(45, "11:45:00"),
    duration: "5h 30m",
    stops: 1,
    stopCity: "Fort Lauderdale",
    price: { economy: 189, business: 420, first: 0 },
    aircraft: "Airbus A320neo",
    amenities: { wifi: false, meals: false, entertainment: false },
    seatsLeft: 35,
    logo: "NK",
  },
];
