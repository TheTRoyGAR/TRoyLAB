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
