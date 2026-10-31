import { Plane, Ship, MessageCircle } from 'lucide-react';
import HeroSearch from './HeroSearch';

// Honest, calm hero: one clear question, one search card. Every line below the
// card is something that is true today (live flight search via Duffel, Viking
// as the cruise partner, personal quotes for everything else).
const points = [
  { icon: <Plane className="w-4 h-4" />, text: 'Live flight search' },
  { icon: <Ship className="w-4 h-4" />, text: 'Viking cruises' },
  { icon: <MessageCircle className="w-4 h-4" />, text: 'Every quote answered personally' },
];

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10 flex flex-col gap-6 sm:gap-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#0A1628] tracking-tight">
            Where to next?
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Search flights, or tell us about the cruise, package, hotel or car you want and we will reply with a confirmed price.
          </p>
        </div>

        <HeroSearch />

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
          {points.map((p) => (
            <li key={p.text} className="flex items-center gap-2">
              <span className="text-[#0077b6]">{p.icon}</span>
              {p.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
